"use client";

import { useLoginViewModel } from "../hooks/use-login-view-model";

export default function LoginForm() {
  const {
    isPasswordVisible,
    message,
    messageType,
    isSubmitting,
    passwordToggleLabel,
    togglePasswordVisibility,
    handleSubmit,
  } = useLoginViewModel();

  return (
    <form className="space-y-5" method="post" onSubmit={handleSubmit}>
      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-700"
          htmlFor="identifier"
        >
          Username or Email
        </label>
        <input
          autoComplete="username"
          className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          id="identifier"
          name="username"
          placeholder="Enter your username or email"
          required
          type="text"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="password"
          >
            Password
          </label>
          <a
            className="text-sm font-medium text-indigo-700 decoration-indigo-300 underline-offset-4 hover:text-indigo-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
            href="/forgot-password"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <input
            autoComplete="current-password"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 pr-16 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            id="password"
            name="password"
            placeholder="Enter your password"
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
      </div>

      <div className="flex items-center">
        <input
          className="size-4 rounded border-slate-300 accent-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          id="remember-me"
          name="remember-me"
          type="checkbox"
        />
        <label className="ml-2.5 text-sm text-slate-600" htmlFor="remember-me">
          Remember me
        </label>
      </div>

      <button
        className="flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-800"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting
          ? messageType === "success"
            ? "Redirecting..."
            : "Signing in..."
          : "Sign in"}
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
    </form>
  );
}
