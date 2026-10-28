export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-white/[0.07] bg-[#080d1b]/60 px-4 py-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <div className="mt-3">
        <p className="text-2xl font-semibold tracking-tight text-white">
          {value}
        </p>
      </div>
    </article>
  );
}

export function CategoryBar({
  label,
  value,
  count,
}: {
  label: string;
  value: number;
  count: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-500">
          {count} products · {value}%
        </span>
      </div>
      <div
        aria-label={`${label}: ${value}%`}
        className="h-2 overflow-hidden rounded-full bg-white/[0.06]"
        role="img"
      >
        <div
          className="h-full rounded-full bg-cyan-400/70"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
