import { CreditCard, Mail, QrCode } from "lucide-react";
import type { PaymentMethod, PaymentOptionProps } from "./checkout.types";

function PaymentOption({
  icon: Icon,
  title,
  description,
  active,
  onClick,
}: PaymentOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-blue-500/70 bg-slate-900 shadow-[0_0_0_1px_rgba(59,130,246,0.18)]"
          : "border-gray-800 bg-gray-900 hover:border-gray-600"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`rounded-xl p-3 ${
            active ? "bg-blue-600/20 text-blue-200" : "bg-gray-800 text-gray-300"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-300">{description}</p>
        </div>
      </div>
    </button>
  );
}

export default function CheckoutPaymentMethods({
  paymentMethod,
  onSelect,
}: {
  paymentMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <PaymentOption
        icon={CreditCard}
        title="Cartão"
        description="Pagamento com preenchimento guiado."
        active={paymentMethod === "card"}
        onClick={() => onSelect("card")}
      />
      <PaymentOption
        icon={Mail}
        title="PayPal"
        description="Confirme os dados da sua conta."
        active={paymentMethod === "paypal"}
        onClick={() => onSelect("paypal")}
      />
      <PaymentOption
        icon={QrCode}
        title="PIX"
        description="Leia o QR Code ou copie o código."
        active={paymentMethod === "pix"}
        onClick={() => onSelect("pix")}
      />
    </div>
  );
}
