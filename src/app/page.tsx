import Link from "next/link";
import AiOrb from "@/components/dashboard/ai-orb";

const metrics = [
  { label: "Conversations today", value: "24", change: "+12%" },
  { label: "Products matched", value: "186", change: "+8.4%" },
  { label: "Response time", value: "1.2s", change: "−0.3s" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080d1b] font-sans text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden w-[248px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0a1020] px-5 py-7 lg:flex">
          <Link className="flex items-center gap-3 px-2" href="/">
            <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/15 text-cyan-300 ring-1 ring-indigo-300/15">
              <BrandMark />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              AI Sales Support
              <span className="mt-0.5 block text-xs font-medium text-slate-500">
                HUB
              </span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="mt-12 space-y-1.5">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Workspace
            </p>
            <a
              aria-current="page"
              className="flex items-center gap-3 rounded-xl bg-indigo-400/[0.12] px-3 py-2.5 text-sm font-medium text-indigo-100 ring-1 ring-inset ring-indigo-300/[0.12]"
              href="#overview"
            >
              <GridIcon />
              Overview
            </a>
            <a
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-100"
              href="#conversations"
            >
              <ChatIcon />
              Conversations
              <span className="ml-auto rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-slate-400">
                4
              </span>
            </a>
            <a
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-100"
              href="#products"
            >
              <BoxIcon />
              Product library
            </a>
          </nav>

          <div className="mt-auto rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
              <span className="text-xs font-medium text-slate-300">
                AI systems operational
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              Your sales assistant is ready to help your team.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[76px] items-center justify-between border-b border-white/[0.07] px-5 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/15 text-cyan-300 ring-1 ring-indigo-300/15">
                <BrandMark />
              </span>
              <span className="text-sm font-semibold">Sales Support Hub</span>
            </div>
            <div className="hidden text-sm text-slate-500 lg:block">
              Workspace <span className="mx-2 text-slate-700">/</span>{" "}
              <span className="text-slate-300">Overview</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <span className="hidden text-xs text-slate-500 sm:block">
                Tuesday, October 24
              </span>
              <button
                aria-label="Notifications"
                className="relative flex size-9 items-center justify-center rounded-xl border border-white/[0.08] text-slate-400 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                type="button"
              >
                <BellIcon />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-cyan-400" />
              </button>
              <div
                aria-label="User profile"
                className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-semibold text-white ring-2 ring-white/[0.08]"
                role="img"
              >
                PS
              </div>
            </div>
          </header>

          <div className="flex-1 px-5 pb-10 pt-8 sm:px-8 lg:px-10 lg:pt-10">
            <section
              aria-labelledby="dashboard-title"
              className="mx-auto max-w-[1200px]"
              id="overview"
            >
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                    Tuesday, October 24, 2026
                  </p>
                  <h1
                    className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl"
                    id="dashboard-title"
                  >
                    Your sales intelligence, at a glance
                  </h1>
                </div>
                <button
                  className="flex h-10 items-center justify-center gap-2 self-start rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:self-auto"
                  type="button"
                >
                  <span aria-hidden="true" className="text-lg leading-none">
                    +
                  </span>
                  New conversation
                </button>
              </div>

              <section
                aria-labelledby="ai-assistant-title"
                className="relative mt-2 flex flex-col items-center text-center"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[min(78vw,720px)] -translate-x-1/2 -translate-y-[47%] rounded-full bg-[radial-gradient(circle,rgba(18,91,174,0.14),rgba(24,43,112,0.07)_42%,transparent_70%)] blur-2xl"
                />
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-200/90">
                    System online
                  </span>
                </div>
                <h2
                  className="mt-2 text-xs font-medium uppercase tracking-[0.3em] text-cyan-100/70"
                  id="ai-assistant-title"
                >
                  AI Sales Intelligence
                </h2>

                <AiOrb />

                <p className="-mt-2 text-xs text-slate-400">
                  Your intelligent sales copilot is ready
                </p>
                <button
                  className="mt-4 flex h-11 items-center gap-2 rounded-xl border border-cyan-200/20 bg-cyan-100/[0.08] px-5 text-sm font-medium text-cyan-50 shadow-[0_0_28px_rgba(34,211,238,0.08)] transition hover:border-cyan-200/40 hover:bg-cyan-100/[0.13] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  type="button"
                >
                  Start a conversation
                  <ArrowIcon />
                </button>
              </section>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <article
                    className="rounded-2xl border border-white/[0.07] bg-[#0d1425]/80 px-5 py-4 backdrop-blur-sm"
                    key={metric.label}
                  >
                    <p className="text-xs font-medium text-slate-500">
                      {metric.label}
                    </p>
                    <div className="mt-3 flex items-end justify-between">
                      <p className="text-2xl font-semibold tracking-tight text-white">
                        {metric.value}
                      </p>
                      <span className="mb-0.5 rounded-md bg-emerald-400/[0.09] px-2 py-1 text-[11px] font-medium text-emerald-300">
                        {metric.change}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              <section
                aria-labelledby="activity-title"
                className="mt-6 rounded-2xl border border-white/[0.07] bg-[#0d1425] p-5 sm:p-6"
                id="conversations"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2
                      className="text-sm font-semibold text-slate-100"
                      id="activity-title"
                    >
                      Recent activity
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Your team&apos;s latest customer conversations
                    </p>
                  </div>
                  <a
                    className="text-xs font-medium text-indigo-300 transition hover:text-indigo-200"
                    href="#conversations"
                  >
                    View all
                  </a>
                </div>
                <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/[0.06] pt-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-400/10 text-xs font-semibold text-violet-200">
                      JD
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-200">
                        Product recommendations for a retail customer
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Jordan Davis · 12 minutes ago
                      </p>
                    </div>
                  </div>
                  <span className="hidden shrink-0 rounded-full bg-emerald-400/[0.08] px-2.5 py-1 text-[10px] font-medium text-emerald-300 sm:block">
                    Completed
                  </span>
                </div>
              </section>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function BrandMark() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 2.75 14.1 9.9l7.15 2.1-7.15 2.1L12 21.25 9.9 14.1l-7.15-2.1L9.9 9.9 12 2.75Z"
        fill="currentColor"
      />
      <circle cx="19" cy="5" r="1.25" fill="currentColor" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[17px]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <rect
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        width="7"
        x="3.5"
        y="3.5"
      />
      <rect
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        width="7"
        x="13.5"
        y="3.5"
      />
      <rect
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        width="7"
        x="3.5"
        y="13.5"
      />
      <rect
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        width="7"
        x="13.5"
        y="13.5"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[17px]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.8-3.6A7.5 7.5 0 1 1 20 11.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M8.5 11.5h7M8.5 8.5h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[17px]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="m4.5 7.75 7.5 4.3 7.5-4.3M12 12v8.5"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[17px]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}
