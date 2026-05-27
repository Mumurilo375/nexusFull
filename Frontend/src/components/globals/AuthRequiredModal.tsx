import type { AuthRequiredModalProps } from "./globals.types";

export default function AuthRequiredModal({
  open,
  title = "Login necessário",
  message = "Para continuar, você precisa estar logado.",
  onClose,
  onConfirm,
}: AuthRequiredModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121212] p-5 shadow-2xl">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-gray-300">{message}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
          >
            Agora não
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Ir para login
          </button>
        </div>
      </div>
    </div>
  );
}
