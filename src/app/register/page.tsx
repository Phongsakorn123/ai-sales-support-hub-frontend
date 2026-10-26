import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import LoginIllustration from "@/features/auth/presentation/components/login-illustration";
import RegisterForm from "@/features/auth/presentation/components/register-form";

export const metadata: Metadata = {
  title: "Create account | AI Sales Support Hub",
  description: "Create an account for AI Sales Support Hub.",
};

export default async function RegisterPage() {
  await connection();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-4 py-6 font-sans text-slate-900 sm:px-8 sm:py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_80px_-36px_rgba(27,39,76,0.25)] lg:min-h-[700px] lg:grid-cols-[1.05fr_0.95fr]">
        <LoginIllustration />

        <section
          aria-labelledby="register-heading"
          className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14"
        >
          <div className="w-full max-w-[400px]">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 2.75 14.1 9.9l7.15 2.1-7.15 2.1L12 21.25 9.9 14.1l-7.15-2.1L9.9 9.9 12 2.75Z"
                    fill="currentColor"
                  />
                  <circle cx="19" cy="5" r="1.25" fill="currentColor" />
                </svg>
              </span>
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                AI Sales Support Hub
              </span>
            </div>

            <div className="mb-7">
              <p className="mb-3 text-sm font-semibold text-indigo-600">
                Get started for free
              </p>
              <h1
                className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]"
                id="register-heading"
              >
                Create your account
              </h1>
              <p className="mt-3 text-[15px] leading-6 text-slate-500">
                Set up your workspace and bring better insights to every sales
                conversation.
              </p>
            </div>

            <RegisterForm />

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                className="font-semibold text-indigo-700 decoration-indigo-300 underline-offset-4 hover:text-indigo-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
                href="/login"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
