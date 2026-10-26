import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import LoginForm from "@/features/auth/presentation/components/login-form";
import LoginIllustration from "@/features/auth/presentation/components/login-illustration";

export const metadata: Metadata = {
  title: "Sign in | AI Sales Support Hub",
  description: "Sign in to discover products and empower your sales workflow.",
};

export default async function LoginPage() {
  await connection();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-4 py-6 font-sans text-slate-900 sm:px-8 sm:py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_80px_-36px_rgba(27,39,76,0.25)] lg:min-h-[700px] lg:grid-cols-[1.05fr_0.95fr]">
        <LoginIllustration />

        <section
          aria-labelledby="login-heading"
          className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-14"
        >
          <div className="w-full max-w-[400px]">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <BrandIcon />
              </span>
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                AI Sales Support Hub
              </span>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold text-indigo-600">
                Your sales workspace
              </p>
              <h1
                id="login-heading"
                className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]"
              >
                Welcome back
              </h1>
              <p className="mt-3 text-[15px] leading-6 text-slate-500">
                Sign in to discover products and empower your sales workflow.
              </p>
            </div>

            <LoginForm />

            <p className="mt-8 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
                className="font-semibold text-indigo-700 decoration-indigo-300 underline-offset-4 hover:text-indigo-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
              >
                Create account
            </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function BrandIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 2.75 14.1 9.9l7.15 2.1-7.15 2.1L12 21.25 9.9 14.1l-7.15-2.1L9.9 9.9 12 2.75Z"
        fill="currentColor"
      />
      <circle cx="19" cy="5" r="1.25" fill="currentColor" />
    </svg>
  );
}
