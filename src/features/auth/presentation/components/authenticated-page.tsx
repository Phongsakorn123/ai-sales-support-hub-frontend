"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import {
  clearAccessToken,
  getAccessToken,
  getAccessTokenExpiration,
  getSessionVersion,
  hasLocalSession,
  subscribeToSession,
} from "@/lib/auth/session";
import {
  AuthenticationRequiredError,
  fetchProtectedApi,
} from "@/lib/api/protected-fetch";

interface AuthenticatedPageProps {
  children: ReactNode;
}

type SessionStatus = "checking" | "authenticated" | "unauthenticated";

function getSessionStatus(): SessionStatus {
  return hasLocalSession() ? "authenticated" : "unauthenticated";
}

export default function AuthenticatedPage({
  children,
}: AuthenticatedPageProps) {
  const router = useRouter();
  const [verifiedSessionVersion, setVerifiedSessionVersion] = useState<
    number | null
  >(null);
  const [verificationError, setVerificationError] = useState("");
  const [verificationAttempt, setVerificationAttempt] = useState(0);
  const sessionStatus = useSyncExternalStore(
    subscribeToSession,
    getSessionStatus,
    (): SessionStatus => "checking",
  );
  const sessionVersion = useSyncExternalStore(
    subscribeToSession,
    getSessionVersion,
    (): number => -1,
  );

  useEffect(() => {
    if (sessionStatus !== "unauthenticated") {
      return;
    }

    clearAccessToken();
    router.replace("/login");
  }, [router, sessionStatus]);

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      return;
    }

    let isActive = true;

    async function verifySession(): Promise<void> {
      try {
        const response = await fetchProtectedApi("/api/auth/me", {
          method: "GET",
        });

        if (!isActive || response.status === 401) {
          return;
        }

        if (!response.ok) {
          setVerificationError(
            "We couldn’t verify your session. Please try again.",
          );
          return;
        }

        setVerificationError("");
        setVerifiedSessionVersion(sessionVersion);
      } catch (error) {
        if (!isActive || error instanceof AuthenticationRequiredError) {
          return;
        }

        setVerificationError(
          "We couldn’t reach the authentication service. Please try again.",
        );
      }
    }

    void verifySession();

    return () => {
      isActive = false;
    };
  }, [sessionStatus, sessionVersion, verificationAttempt]);

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      return;
    }

    const accessToken = getAccessToken();
    const expiresAt = accessToken
      ? getAccessTokenExpiration(accessToken)
      : null;
    if (expiresAt === null) {
      clearAccessToken();
      router.replace("/login");
      return;
    }

    const timeout = window.setTimeout(
      () => {
        clearAccessToken();
        router.replace("/login");
      },
      Math.max(0, expiresAt - Date.now()),
    );

    return () => window.clearTimeout(timeout);
  }, [router, sessionStatus]);

  if (
    sessionStatus !== "authenticated" ||
    verifiedSessionVersion !== sessionVersion
  ) {
    if (verificationError && sessionStatus === "authenticated") {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#080d1b] px-6 text-center font-sans text-slate-100">
          <div className="max-w-md">
            <p className="text-sm text-slate-300" role="alert">
              {verificationError}
            </p>
            <button
              className="mt-4 rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-100 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              onClick={() => {
                setVerificationError("");
                setVerificationAttempt((attempt) => attempt + 1);
              }}
              type="button"
            >
              Try again
            </button>
          </div>
        </main>
      );
    }
    return null;
  }

  return children;
}
