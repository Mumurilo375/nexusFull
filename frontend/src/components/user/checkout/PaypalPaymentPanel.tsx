import { LockKeyhole, WalletMinimal } from "lucide-react";

export default function PaypalPaymentPanel({
  email,
  password,
  onEmailChange,
  onPasswordChange,
}: {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-800 bg-[#0d1118] p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-600/15 p-3 text-blue-200">
            <WalletMinimal className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Entrar com PayPal</h2>
            <p className="text-sm text-gray-300">
              Confirme os dados da conta para continuar.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <label className="text-sm text-gray-200">
          Email da conta
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="email@paypal.com"
            className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
          />
        </label>

        <label className="text-sm text-gray-200">
          Senha
          <div className="relative mt-2">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Sua senha do PayPal"
              className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 pl-11 pr-4 text-white outline-none transition focus:border-blue-500"
            />
          </div>
        </label>
      </div>
    </div>
  );
}
