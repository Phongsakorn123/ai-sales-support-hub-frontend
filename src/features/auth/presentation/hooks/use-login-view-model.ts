"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export interface LoginViewModel {
  isPasswordVisible: boolean;
  passwordToggleLabel: string;
  togglePasswordVisibility: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function useLoginViewModel(): LoginViewModel {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    router.push("/");
  }

  return {
    isPasswordVisible,
    passwordToggleLabel: isPasswordVisible ? "Hide password" : "Show password",
    togglePasswordVisibility: () => {
      setIsPasswordVisible((visible) => !visible);
    },
    handleSubmit,
  };
}
