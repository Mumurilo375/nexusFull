import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { AdminButton } from "./adminShared";

type AdminConfirmModalProps = {
  title: string;
  message: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  processingLabel?: string;
  isProcessing?: boolean;
  tone?: "primary" | "danger";
};

export default function AdminConfirmModal({
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  processingLabel,
  isProcessing = false,
  tone = "primary",
}: AdminConfirmModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isProcessing) {
        event.preventDefault();
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isProcessing, onCancel]);

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-message"
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-[0_30px_80px_rgba(2,6,23,0.6)]"
      >
        <h3 id="admin-confirm-title" className="text-lg font-semibold text-white">{title}</h3>
        <div id="admin-confirm-message" className="mt-3 text-sm leading-6 text-slate-300">{message}</div>
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <AdminButton
            type="button"
            tone="secondary"
            onClick={onCancel}
            disabled={isProcessing}
            ref={cancelButtonRef}
          >
            {cancelLabel}
          </AdminButton>
          <AdminButton
            type="button"
            tone={tone}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (processingLabel ?? confirmLabel) : confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
