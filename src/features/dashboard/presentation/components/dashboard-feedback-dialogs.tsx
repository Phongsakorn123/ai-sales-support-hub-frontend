import type { ConfirmAction } from "@/features/dashboard/domain/dashboard";
import { PopupDialog } from "@/features/dashboard/presentation/components/dashboard-dialog";

type Notice = { tone: "success" | "error"; title: string; message: string };
type Props = {
  searching: boolean;
  confirmAction: ConfirmAction | null;
  notice: Notice | null;
  productName: string;
  onCloseConfirm: () => void;
  onConfirm: (action: ConfirmAction) => void;
  onCloseNotice: () => void;
};

export default function DashboardFeedbackDialogs({ searching, confirmAction, notice, productName, onCloseConfirm, onConfirm, onCloseNotice }: Props) {
  return (
    <>
      {searching && (
        <div
          aria-live="polite"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="status"
        >
          <div className="flex w-full max-w-xs flex-col items-center rounded-2xl border border-white/[0.1] bg-[#111a2c] px-6 py-7 text-center shadow-2xl shadow-black/40">
            <span
              aria-hidden="true"
              className="size-10 animate-spin rounded-full border-4 border-indigo-400/20 border-t-indigo-400 motion-reduce:animate-none"
            />
            <p className="mt-4 text-sm font-semibold text-slate-100">
              Searching products…
            </p>
            <p className="mt-1 text-xs text-slate-400">
              This may take a few seconds.
            </p>
          </div>
        </div>
      )}
      {confirmAction && (
        <PopupDialog
          actions={
            <>
              <button
                className="h-10 rounded-xl border border-white/[0.1] px-4 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-cyan-300"
                onClick={() => onCloseConfirm()}
                type="button"
              >
                Cancel
              </button>
              <button
                autoFocus
                className={`h-10 rounded-xl px-4 text-xs font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                  confirmAction.kind === "delete"
                    ? "bg-rose-500 hover:bg-rose-400"
                    : "bg-indigo-500 hover:bg-indigo-400"
                }`}
                onClick={() =>
                  onConfirm(confirmAction)
                }
                type="button"
              >
                {confirmAction.kind === "delete" ? "Delete" : "Update"}
              </button>
            </>
          }
          message={
            confirmAction.kind === "delete"
              ? `Delete "${confirmAction.product.name}"? This cannot be undone.`
              : `Save your changes to "${productName}"?`
          }
          onClose={() => onCloseConfirm()}
          title={
            confirmAction.kind === "delete"
              ? "Confirm delete"
              : "Confirm update"
          }
          tone={confirmAction.kind === "delete" ? "error" : "info"}
        />
      )}
      {notice && (
        <PopupDialog
          actions={
            <button
              autoFocus
              className="h-10 rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              onClick={() => onCloseNotice()}
              type="button"
            >
              OK
            </button>
          }
          message={notice.message}
          onClose={() => onCloseNotice()}
          title={notice.title}
          tone={notice.tone}
        />
      )}
    </>
  );
}
