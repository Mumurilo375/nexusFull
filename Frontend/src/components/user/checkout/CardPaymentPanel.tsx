import type { CardField } from "./checkout.types";
import {
  digitsOnly,
  formatCardNumber,
  formatExpiry,
  getCardBrand,
} from "./checkout.helpers";

const inputClassName =
  "mt-2 w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none transition focus:border-blue-500";

export default function CardPaymentPanel({
  cardName,
  cardNumber,
  cardExpiry,
  cardCvv,
  focusedField,
  onFieldFocus,
  onFieldBlur,
  onNameChange,
  onNumberChange,
  onExpiryChange,
  onCvvChange,
}: {
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  focusedField: CardField;
  onFieldFocus: (field: Exclude<CardField, null>) => void;
  onFieldBlur: () => void;
  onNameChange: (value: string) => void;
  onNumberChange: (value: string) => void;
  onExpiryChange: (value: string) => void;
  onCvvChange: (value: string) => void;
}) {
  const formattedCardNumber = formatCardNumber(cardNumber);
  const formattedExpiry = formatExpiry(cardExpiry);
  const maskedCardCvv = "*".repeat(digitsOnly(cardCvv).length) || "---";
  const cardBrand = getCardBrand(cardNumber);

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Pagar com cartão</h2>

      <div className="rounded-[28px] border border-gray-800 bg-linear-to-br from-[#090b11] via-[#101827] to-[#111827] p-1">
        <div className="relative h-56 overflow-hidden rounded-3xl bg-black/20 perspective-distant">
          <div
            className="relative h-full w-full transition-transform duration-500"
            style={{
              transform: focusedField === "cvv" ? "rotateY(180deg)" : "rotateY(0deg)",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="absolute inset-0 flex h-full flex-col justify-between rounded-3xl bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_40%),linear-gradient(135deg,#090b11_0%,#0f172a_55%,#111827_100%)] p-6"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Nexus Secure
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-100">{cardBrand}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-white/85" />
                  <div className="h-3 w-3 rounded-full bg-white/45" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-10 w-14 rounded-lg border border-white/15 bg-linear-to-br from-slate-300 to-slate-500" />
                <p className="text-2xl tracking-[0.28em] text-slate-50 sm:text-3xl">
                  {formattedCardNumber || "0000 0000 0000 0000"}
                </p>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Nome</p>
                  <p className="truncate text-sm font-medium uppercase text-slate-100">
                    {cardName.trim() || "Seu nome"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                    Validade
                  </p>
                  <p className="text-sm font-medium text-slate-100">
                    {formattedExpiry || "MM/AA"}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="absolute inset-0 rounded-3xl bg-[linear-gradient(135deg,#090b11_0%,#111827_55%,#1f2937_100%)] p-6"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div className="mt-4 h-12 rounded-md bg-black/70" />
              <div className="mt-6 rounded-md bg-white/90 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">CVV</p>
                <p className="text-lg font-semibold tracking-[0.35em] text-slate-900">
                  {maskedCardCvv}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <label className="text-sm text-gray-200">
          Número do cartão
          <input
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            maxLength={19}
            value={formattedCardNumber}
            onFocus={() => onFieldFocus("number")}
            onBlur={onFieldBlur}
            onChange={(event) => onNumberChange(event.target.value)}
            placeholder="0000 0000 0000 0000"
            className={inputClassName}
          />
        </label>

        <label className="text-sm text-gray-200">
          Nome impresso
          <input
            type="text"
            autoComplete="cc-name"
            value={cardName}
            onFocus={() => onFieldFocus("name")}
            onBlur={onFieldBlur}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Nome como está no cartão"
            className={inputClassName}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-gray-200">
            Validade
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              maxLength={5}
              value={formattedExpiry}
              onFocus={() => onFieldFocus("expiry")}
              onBlur={onFieldBlur}
              onChange={(event) => onExpiryChange(event.target.value)}
              placeholder="MM/AA"
              className={inputClassName}
            />
          </label>

          <label className="text-sm text-gray-200">
            CVV
            <input
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={3}
              value={digitsOnly(cardCvv)}
              onFocus={() => onFieldFocus("cvv")}
              onBlur={onFieldBlur}
              onChange={(event) => onCvvChange(event.target.value)}
              placeholder="000"
              className={inputClassName}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
