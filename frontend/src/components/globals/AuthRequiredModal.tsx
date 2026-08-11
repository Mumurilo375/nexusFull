import { useEffect, useId, useRef } from "react";
import type { AuthRequiredModalProps } from "./globals.types";

export default function AuthRequiredModal({
  open,
  title = "Login necessário",
  message = "Para continuar, você precisa estar logado.",
  onClose,
  onConfirm,
}: AuthRequiredModalProps) {
  const titleId = useId();
  const messageId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
      );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121212] p-5 shadow-2xl"
      >
        <h2 id={titleId} className="text-xl font-bold text-white">
          {title}
        </h2>
        <p id={messageId} className="mt-2 text-sm text-gray-300">
          {message}
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            ref={cancelButtonRef}
            onClick={onClose}
            className="min-h-11 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          >
            Agora não
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          >
            Ir para login
          </button>
        </div>
      </div>
    </div>
  );
}
