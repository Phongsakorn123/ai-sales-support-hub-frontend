import { APP_ROUTES } from "@/navigation/app-routes";
import Link from "next/link";

export default function LoginIllustration() {
  return (
    <aside className="relative hidden flex-col overflow-hidden bg-[#f1f3fc] p-12 lg:flex xl:p-16">
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 size-[420px] rounded-full border border-indigo-200/60"
      />
      <div
        aria-hidden="true"
        className="absolute -right-8 -top-8 size-[290px] rounded-full border border-indigo-200/60"
      />

      <Link
        className="relative z-10 flex w-fit items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
        href={APP_ROUTES.home}
      >
        <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-900/15">
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
        </span>
        <span className="text-sm font-semibold tracking-tight text-slate-900">
          AI Sales Support Hub
        </span>
      </Link>

      <div className="relative z-10 mt-16 max-w-md xl:mt-20">
        <p className="mb-4 text-sm font-semibold tracking-wide text-indigo-700">
          SELL SMARTER, TOGETHER
        </p>
        <h2 className="text-[2.65rem] font-semibold leading-[1.12] tracking-[-0.04em] text-slate-950 xl:text-5xl">
          Better insights.
          <br />
          Stronger sales.
        </h2>
        <p className="mt-5 max-w-sm text-base leading-7 text-slate-600">
          Bring product knowledge and thoughtful AI assistance into every
          customer conversation.
        </p>
      </div>

      <div
        aria-label="Illustration of a sales insight dashboard"
        className="relative z-10 mx-auto mt-12 w-full max-w-[430px] xl:mt-14"
        role="img"
      >
        <div className="absolute -left-5 top-12 size-10 rounded-xl border border-white/90 bg-white/80 shadow-lg shadow-indigo-900/5" />
        <div className="absolute -right-4 bottom-10 flex size-12 items-center justify-center rounded-2xl border border-white/90 bg-white shadow-lg shadow-indigo-900/5">
          <svg
            aria-hidden="true"
            className="size-5 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 3v18m9-9H3"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          </svg>
        </div>
        <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-[0_22px_55px_-30px_rgba(38,48,104,0.35)] backdrop-blur-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Sales overview
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                Weekly performance
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              +18.6%
            </span>
          </div>

          <div className="mt-6 flex h-28 items-end gap-2.5 border-b border-slate-100 pb-3">
            {[35, 53, 43, 68, 54, 82, 66, 94, 73, 100, 80, 90].map(
              (height, index) => (
                <span
                  className={`w-full rounded-t-md ${
                    index === 9 ? "bg-indigo-600" : "bg-indigo-100"
                  }`}
                  key={index}
                  style={{ height: `${height}%` }}
                />
              ),
            )}
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#f6f7fc] p-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 3.5 14 9l5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2 2-5.5Z"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                Product insight ready
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Find the right fit for every customer
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="relative z-10 mt-auto pt-8 text-xs text-slate-500">
        Clarity for every customer conversation.
      </p>
    </aside>
  );
}
