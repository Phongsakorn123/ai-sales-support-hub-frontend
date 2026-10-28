"use client";

import { APP_ROUTES } from "@/navigation/app-routes";

import Link from "next/link";
import { useRegisterViewModel } from "../view-models/use-register-view-model";

export default function RegisterForm() {
  const {
    isPasswordVisible,
    message,
    messageType,
    isSubmitting,
    isRegistered,
    passwordToggleLabel,
    togglePasswordVisibility,
    handleSubmit,
  } = useRegisterViewModel();

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-700"
          htmlFor="username"
        >
          Username
        </label>
        <input
          autoComplete="username"
          className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          id="username"
          maxLength={64}
          minLength={3}
          name="username"
          pattern="[A-Za-z0-9][A-Za-z0-9_.\-]*"
          placeholder="Choose a username"
          required
          type="text"
          title="Use 3–64 characters: start with a letter or number, then use letters, numbers, dots, underscores, or hyphens."
        />
      </div>

      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-700"
          htmlFor="email"
        >
          Work email
        </label>
        <input
          autoComplete="email"
          className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          id="email"
          name="email"
          placeholder="you@company.com"
          required
          type="email"
        />
      </div>

      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-700"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative">
          <input
            autoComplete="new-password"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 pr-16 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            id="password"
            maxLength={128}
            minLength={12}
            name="password"
            placeholder="At least 12 characters"
            required
            type={isPasswordVisible ? "text" : "password"}
          />
          <button
            aria-label={passwordToggleLabel}
            aria-pressed={isPasswordVisible}
            className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3.5 text-xs font-semibold text-slate-500 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-indigo-600"
            onClick={togglePasswordVisibility}
            type="button"
          >
            {isPasswordVisible ? "Hide" : "Show"}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Use at least 12 characters for a secure password.
        </p>
      </div>

      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-700"
          htmlFor="confirm-password"
        >
          Confirm password
        </label>
        <input
          autoComplete="new-password"
          className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          id="confirm-password"
          maxLength={128}
          minLength={12}
          name="confirm-password"
          placeholder="Re-enter your password"
          required
          type={isPasswordVisible ? "text" : "password"}
        />
      </div>

      <button
        className="flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting || isRegistered}
        type="submit"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p
        aria-live="polite"
        className={`min-h-5 text-center text-sm ${
          messageType === "success"
            ? "text-emerald-700"
            : messageType === "error"
              ? "text-amber-800"
              : "text-transparent"
        }`}
        role="status"
      >
        {message || " "}
      </p>
      {isRegistered && (
        <p className="-mt-2 text-center text-sm">
          <Link
            className="font-semibold text-indigo-700 decoration-indigo-300 underline-offset-4 hover:text-indigo-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
            href={APP_ROUTES.login}
          >
            Continue to sign in
          </Link>
        </p>
      )}
    </form>
  );
}
