import { useEffect, type ReactNode } from "react";

type AdminSuccessToastProps = {
  title: string;
  message: ReactNode;
  details?: ReactNode;
  onDismiss: () => void;
  durationMs?: number;
};

export default function AdminSuccessToast({
  title,
  message,
  details,
  onDismiss,
  durationMs = 6000,
}: AdminSuccessToastProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onDismiss, durationMs);

    return () => window.clearTimeout(timeoutId);
  }, [durationMs, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-24 z-[140] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-emerald-500/35 bg-slate-950/95 p-4 text-left shadow-[0_22px_60px_rgba(2,6,23,0.55)] backdrop-blur"
    >
      <p className="text-sm font-semibold text-emerald-200">{title}</p>
      <div className="mt-2 text-lg font-bold text-white">{message}</div>
      {details && (
        <div className="mt-2 text-sm leading-6 text-slate-300">{details}</div>
      )}
    </div>
  );
}
