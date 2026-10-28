import { useEffect, type ReactNode } from "react";

export function PopupDialog({
  title,
  message,
  tone,
  actions,
  onClose,
}: {
  title: string;
  message: string;
  tone: "success" | "error" | "info";
  actions: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const accent =
    tone === "success"
      ? "text-emerald-300"
      : tone === "error"
        ? "text-rose-300"
        : "text-indigo-300";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-describedby="popup-message"
        aria-labelledby="popup-title"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#111a2c] p-6 text-center shadow-2xl shadow-black/40"
        role="alertdialog"
      >
        <h2 className={`text-base font-semibold ${accent}`} id="popup-title">
          {title}
        </h2>
        <p
          className="mt-2 break-words text-sm text-slate-300"
          id="popup-message"
        >
          {message}
        </p>
        <div className="mt-5 flex justify-center gap-2">{actions}</div>
      </section>
    </div>
  );
}
