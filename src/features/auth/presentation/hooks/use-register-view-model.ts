"use client";

import { useState, type FormEvent } from "react";

export interface RegisterViewModel {
  isPasswordVisible: boolean;
  message: string;
  passwordToggleLabel: string;
  togglePasswordVisibility: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function useRegisterViewModel(): RegisterViewModel {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirm-password");

    if (password !== confirmPassword) {
      setMessage("Your passwords don’t match. Please check and try again.");
      return;
    }

    setMessage(
      "Registration isn’t connected yet. Your details have not been sent.",
    );
  }

  return {
    isPasswordVisible,
    message,
    passwordToggleLabel: isPasswordVisible ? "Hide password" : "Show password",
    togglePasswordVisibility: () => {
      setIsPasswordVisible((visible) => !visible);
    },
    handleSubmit,
  };
}
