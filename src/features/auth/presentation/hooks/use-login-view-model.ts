"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { loginAccount, LoginApiError } from "@/lib/api/login";
import { storeAccessToken } from "@/lib/auth/session";

export interface LoginViewModel {
  isPasswordVisible: boolean;
  message: string;
  messageType: "success" | "error" | "";
  isSubmitting: boolean;
  passwordToggleLabel: string;
  togglePasswordVisibility: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useLoginViewModel(): LoginViewModel {
  const router = useRouter();
  const submissionInProgress = useRef(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (submissionInProgress.current) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const identifier = formData.get("username");
    const password = formData.get("password");
    if (
      typeof identifier !== "string" ||
      identifier.trim().length === 0 ||
      typeof password !== "string"
    ) {
      setMessageType("error");
      setMessage("Please enter your username or email and password.");
      return;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const tokenResponse = await loginAccount(identifier, password);
      try {
        storeAccessToken(tokenResponse.access_token);
      } catch {
        setMessageType("error");
        setMessage(
          "Sign-in succeeded, but this browser could not save your session. Check your browser storage settings and try again.",
        );
        submissionInProgress.current = false;
        setIsSubmitting(false);
        return;
      }

      setMessageType("success");
      setMessage("Signed in successfully. Redirecting to your dashboard...");
      window.setTimeout(() => router.replace("/"), 500);
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof LoginApiError
          ? error.message
          : "Unable to sign in right now. Please try again.",
      );
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  return {
    isPasswordVisible,
    message,
    messageType,
    isSubmitting,
    passwordToggleLabel: isPasswordVisible ? "Hide password" : "Show password",
    togglePasswordVisibility: () => {
      setIsPasswordVisible((visible) => !visible);
    },
    handleSubmit,
  };
}
