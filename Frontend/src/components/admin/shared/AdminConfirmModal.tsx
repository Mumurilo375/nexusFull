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
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-[28px] border border-slate-800 bg-slate-950 p-5 shadow-[0_30px_80px_rgba(2,6,23,0.6)]"
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="mt-3 text-sm leading-6 text-slate-300">{message}</div>
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <AdminButton
            type="button"
            tone="secondary"
            onClick={onCancel}
            disabled={isProcessing}
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
