import type { ReactNode } from "react";

type AdminSuccessModalProps = {
  title: string;
  message: ReactNode;
  details?: ReactNode;
  children: ReactNode;
};

export default function AdminSuccessModal({
  title,
  message,
  details,
  children,
}: AdminSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-[28px] border border-emerald-500/30 bg-slate-950 p-5 shadow-[0_30px_80px_rgba(2,6,23,0.65)]"
      >
        <p className="text-sm font-semibold text-emerald-200">{title}</p>
        <div className="mt-3 text-2xl font-bold text-white">{message}</div>
        {details && (
          <div className="mt-3 text-sm leading-6 text-slate-300">{details}</div>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-3">{children}</div>
      </div>
    </div>
  );
}
