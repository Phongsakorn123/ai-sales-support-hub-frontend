"use client";

import { useState, type FormEvent } from "react";

export interface LoginViewModel {
  isPasswordVisible: boolean;
  message: string;
  passwordToggleLabel: string;
  togglePasswordVisibility: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function useLoginViewModel(): LoginViewModel {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setMessage("Login isn’t connected yet. Your details have not been sent.");
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
