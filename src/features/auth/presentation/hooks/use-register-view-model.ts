"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  registerAccount,
  RegistrationApiError,
} from "@/lib/api/register";

export interface RegisterViewModel {
  isPasswordVisible: boolean;
  message: string;
  messageType: "success" | "error" | "";
  isSubmitting: boolean;
  isRegistered: boolean;
  passwordToggleLabel: string;
  togglePasswordVisibility: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useRegisterViewModel(): RegisterViewModel {
  const submissionInProgress = useRef(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (submissionInProgress.current) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirm-password");

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("Your passwords don’t match. Please check and try again.");
      return;
    }

    if (typeof password !== "string" || password.length < 12) {
      setMessageType("error");
      setMessage("Your password must contain at least 12 characters.");
      return;
    }
    if (password.length > 128) {
      setMessageType("error");
      setMessage("Your password must contain no more than 128 characters.");
      return;
    }

    const username = formData.get("username");
    if (typeof username !== "string" || username.trim().length === 0) {
      setMessageType("error");
      setMessage("Please enter a username.");
      return;
    }
    if (
      username.length < 3 ||
      username.length > 64 ||
      !/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(username)
    ) {
      setMessageType("error");
      setMessage(
        "Use 3–64 characters: start with a letter or number, then use letters, numbers, dots, underscores, or hyphens.",
      );
      return;
    }

    const email = formData.get("email");
    if (typeof email !== "string") {
      setMessageType("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      await registerAccount({ username, email, password });
      setIsRegistered(true);
      setMessageType("success");
      setMessage("Your account has been created successfully.");
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof RegistrationApiError
          ? error.message
          : "Unable to create your account right now. Please try again.",
      );
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  return {
    isPasswordVisible,
    message,
    messageType,
    isSubmitting,
    isRegistered,
    passwordToggleLabel: isPasswordVisible ? "Hide password" : "Show password",
    togglePasswordVisibility: () => {
      setIsPasswordVisible((visible) => !visible);
    },
    handleSubmit,
  };
}
