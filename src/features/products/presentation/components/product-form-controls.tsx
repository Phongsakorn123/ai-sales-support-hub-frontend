import { useState, type KeyboardEvent, type ReactNode } from "react";

export const taxonomy: Record<string, Record<string, string[]>> = {
  Computer: {
    Laptop: ["Business Laptop", "Gaming Laptop", "Ultrabook"],
    Desktop: ["Workstation", "All-in-One", "Mini PC"],
  },
  Networking: {
    Router: ["Wi-Fi Router", "Enterprise Router"],
    Switch: ["Managed Switch", "Unmanaged Switch"],
  },
  Peripherals: {
    Monitor: ["Business Monitor", "Gaming Monitor"],
    Accessory: ["Keyboard & Mouse", "Webcam", "Docking Station"],
  },
  Laboratory: {
    Chromatography: ["HPLC"],
    Analyzer: ["Portable"],
  },
  Monitoring: {
    Environment: ["Air quality"],
  },
};

export const currencies = ["THB", "USD", "EUR"];
export const customerSuggestions = ["SME", "Enterprise", "Education", "Government"];
export const useCaseSuggestions = [
  "Office Productivity",
  "Video Conferencing",
  "Business Travel",
  "Software Development",
];
export const specKeySuggestions = ["Processor", "RAM", "Storage", "Screen Size"];


export const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-[#080d1b] px-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10";
export const selectClass = `${inputClass} cursor-pointer appearance-none bg-[length:16px] bg-[position:right_0.875rem_center] bg-no-repeat pr-10 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-[#111a2c] [&>option]:text-slate-100 bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%2394a3b8' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m5 8 5 5 5-5'/%3E%3C/svg%3E")]`;
export const numberClass = `${inputClass} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;
export const textareaClass =
  "min-h-20 w-full resize-y rounded-xl border border-white/10 bg-[#080d1b] px-3.5 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10";
export const labelClass = "mb-2 block text-xs font-medium text-slate-300";
export const sectionClass = "rounded-xl border border-white/[0.07] p-4 sm:p-5";
export const sectionTitleClass = "text-sm font-semibold text-slate-100";


export function Field({
  label,
  error,
  helper,
  children,
  className,
}: {
  label: string;
  error?: string;
  helper?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className={labelClass}>{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-[11px] text-rose-300" role="alert">
          {error}
        </span>
      ) : (
        helper && (
          <span className="mt-1 block text-[11px] text-slate-500">
            {helper}
          </span>
        )
      )}
    </label>
  );
}

export function TagInput({
  label,
  values,
  onChange,
  placeholder,
  suggestions = [],
  helper,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  suggestions?: string[];
  helper?: string;
}) {
  const [draft, setDraft] = useState("");

  function add(raw: string): void {
    const value = raw.trim();
    if (value && !values.some((v) => v.toLowerCase() === value.toLowerCase())) {
      onChange([...values, value]);
    }
    setDraft("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  }

  const remaining = suggestions.filter(
    (s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div>
      <span className={labelClass}>{label}</span>
      {values.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {values.map((value) => (
            <li
              className="flex items-center gap-1 rounded-lg bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100"
              key={value}
            >
              {value}
              <button
                aria-label={`Remove ${value}`}
                className="text-cyan-200/70 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300"
                onClick={() => onChange(values.filter((v) => v !== value))}
                type="button"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        aria-label={label}
        className={inputClass}
        onBlur={() => add(draft)}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        value={draft}
      />
      <span className="mt-1 block text-[11px] text-slate-500">
        {helper ?? "Press Enter or comma to add."}
      </span>
      {remaining.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {remaining.map((s) => (
            <button
              className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-slate-400 transition hover:bg-white/[0.05] hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-cyan-300"
              key={s}
              onClick={() => add(s)}
              type="button"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function optionsWith(options: string[], current: string): string[] {
  return current && !options.includes(current)
    ? [current, ...options]
    : options;
}
