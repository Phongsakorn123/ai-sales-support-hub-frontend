"use client";

import { APP_ROUTES } from "@/navigation/app-routes";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useDependencies } from "@/di/dependency-provider";

type Status = "checking" | "authenticated" | "unauthenticated";

export function useAuthenticatedPageViewModel() {
  const router = useRouter();
  const { auth } = useDependencies();
  const source = useMemo(() => ({
    subscribe: (listener: () => void) => auth.subscribeToSession(listener),
    status: (): Status => auth.hasSession() ? "authenticated" : "unauthenticated",
    version: () => auth.getSessionVersion(),
  }), [auth]);
  const status = useSyncExternalStore(source.subscribe, source.status, () => "checking");
  const version = useSyncExternalStore(source.subscribe, source.version, () => -1);
  const [verifiedVersion, setVerifiedVersion] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      auth.logout();
      router.replace(APP_ROUTES.login);
    }
  }, [auth, router, status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    auth.verifySession().then((valid) => {
      if (!active) return;
      if (!valid) {
        auth.logout();
        router.replace(APP_ROUTES.login);
        return;
      }
      setError("");
      setVerifiedVersion(version);
    }).catch(() => {
      if (active) setError("We couldn’t reach the authentication service. Please try again.");
    });
    return () => { active = false; };
  }, [attempt, auth, router, status, version]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const expiresAt = auth.getSessionExpiry();
    if (expiresAt === null) {
      auth.logout();
      router.replace(APP_ROUTES.login);
      return;
    }
    const timeout = window.setTimeout(() => {
      auth.logout();
      router.replace(APP_ROUTES.login);
    }, Math.max(0, expiresAt - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [auth, router, status]);

  return {
    isVerified: status === "authenticated" && verifiedVersion === version,
    error,
    retry: () => {
      setError("");
      setAttempt((value) => value + 1);
    },
  };
}
