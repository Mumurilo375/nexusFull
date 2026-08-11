import { Link } from "react-router-dom";
import { getAvailableStock, getQuantity, toMoney } from "./checkout.helpers";
import type { CheckoutCartItem } from "./checkout.types";

export default function CheckoutSummary({
  items,
  subtotal,
  totalQuantity,
  hasStockIssues,
}: {
  items: CheckoutCartItem[];
  subtotal: number;
  totalQuantity: number;
  hasStockIssues: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <h2 className="text-xl font-semibold">Itens do pedido</h2>
        <ul className="mt-4 space-y-3">
          {items.map((item) => {
            const quantity = getQuantity(item);
            const unitPrice = Number(item.listing?.price ?? 0);
            const availableStock = getAvailableStock(item);

            return (
              <li key={item.id} className="rounded-xl bg-gray-800/80 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{item.listing?.game?.title || "Jogo"}</p>
                    <p className="text-sm text-gray-300">
                      {item.listing?.platform?.name || "-"} • {quantity}x
                    </p>
                  </div>
                  <p className="font-medium">{toMoney(unitPrice * quantity)}</p>
                </div>

                {item.isQuantityAvailable === false && (
                  <p className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                    No carrinho: {quantity} • Disponível agora: {availableStock}. Ajuste no
                    carrinho para continuar.
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-5 rounded-xl border border-gray-800 bg-black/20 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-300">Itens</span>
            <span className="text-sm text-white">{totalQuantity}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Subtotal</span>
            <span className="text-lg font-semibold text-white">{toMoney(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            A confirmação libera as keys imediatamente na sua biblioteca.
          </p>
        </div>
      </div>

      {hasStockIssues && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p>
            O estoque do seu carrinho mudou. Ajuste as quantidades antes de finalizar o pedido.
          </p>
          <Link
            to="/carrinho"
            className="mt-3 inline-flex rounded-lg bg-slate-950 px-4 py-2 font-semibold text-white transition hover:bg-slate-900"
          >
            Voltar ao carrinho
          </Link>
        </div>
      )}
    </div>
  );
}
