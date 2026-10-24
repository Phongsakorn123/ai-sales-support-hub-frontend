"use client";

import { useRegisterViewModel } from "../hooks/use-register-view-model";

export default function RegisterForm() {
  const {
    isPasswordVisible,
    message,
    passwordToggleLabel,
    togglePasswordVisibility,
    handleSubmit,
  } = useRegisterViewModel();

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-700"
          htmlFor="full-name"
        >
          Full name
        </label>
        <input
          autoComplete="name"
          className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          id="full-name"
          name="full-name"
          placeholder="Your name"
          required
          type="text"
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
            minLength={8}
            name="password"
            placeholder="At least 8 characters"
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
          Use at least 8 characters for a secure password.
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
          minLength={8}
          name="confirm-password"
          placeholder="Re-enter your password"
          required
          type={isPasswordVisible ? "text" : "password"}
        />
      </div>

      <button
        className="flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-800"
        type="submit"
      >
        Create account
      </button>

      <p
        aria-live="polite"
        className={`min-h-5 text-center text-sm ${
          message ? "text-amber-800" : "text-transparent"
        }`}
        role="status"
      >
        {message || " "}
      </p>
    </form>
  );
}
