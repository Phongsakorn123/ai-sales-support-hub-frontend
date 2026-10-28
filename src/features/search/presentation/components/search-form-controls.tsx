import type { ReactNode } from "react";

export const fieldClass =
  "h-11 w-full rounded-xl border border-white/10 bg-[#080d1b] px-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-1.5 block text-xs font-medium text-slate-300"
        htmlFor={htmlFor}
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-[11px] text-rose-300" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
      )}
    </div>
  );
}

export function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-white/[0.07] p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}
