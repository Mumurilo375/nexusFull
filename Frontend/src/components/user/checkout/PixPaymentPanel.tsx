import { CheckCircle2, Copy } from "lucide-react";

export default function PixPaymentPanel({
  pixCode,
  pixQrSrc,
  copyStatus,
  pixConfirmed,
  onCopy,
  onConfirmChange,
}: {
  pixCode: string;
  pixQrSrc: string;
  copyStatus: "idle" | "copied" | "error";
  pixConfirmed: boolean;
  onCopy: () => void;
  onConfirmChange: (checked: boolean) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Pagar com PIX</h2>
        <p className="mt-1 text-sm text-gray-300">
          Leia o QR Code ou copie o código abaixo.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.92fr,1.08fr]">
        <div className="rounded-2xl border border-gray-800 bg-[#0d1118] p-5">
          <div className="mx-auto flex max-w-60 flex-col items-center gap-4">
            <div className="rounded-[28px] bg-white p-4 shadow-xl shadow-black/20">
              <img
                src={pixQrSrc}
                alt="QR Code PIX"
                className="h-52 w-52 rounded-2xl object-cover"
              />
            </div>
            <p className="text-center text-sm text-gray-300">
              Aponte a camera do app do banco para este QR Code.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5">
          <p className="text-sm font-medium text-gray-200">Código copia e cola</p>
          <div className="mt-3 rounded-xl border border-gray-800 bg-black/40 p-4">
            <p className="break-all font-mono text-xs text-blue-200">{pixCode}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <Copy className="h-4 w-4" />
              Copiar código
            </button>

            {copyStatus === "copied" && (
              <span className="inline-flex items-center gap-2 text-sm text-blue-200">
                <CheckCircle2 className="h-4 w-4" />
                Código copiado com sucesso
              </span>
            )}

            {copyStatus === "error" && (
              <span className="text-sm text-rose-300">
                Não foi possível copiar automaticamente.
              </span>
            )}
          </div>

          <label className="mt-5 flex items-start gap-3 rounded-xl border border-gray-800 bg-gray-900/80 px-4 py-3 text-sm text-gray-200">
            <input
              type="checkbox"
              checked={pixConfirmed}
              onChange={(event) => onConfirmChange(event.target.checked)}
              className="mt-1"
            />
            <span>Já conferi o QR Code e quero concluir a compra.</span>
          </label>
        </div>
      </div>
    </div>
  );
}
