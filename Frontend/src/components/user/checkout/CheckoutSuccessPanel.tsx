import { Link } from "react-router-dom";
import { toMoney } from "./checkout.helpers";
import type { CheckoutOrderResponse } from "./checkout.types";

export default function CheckoutSuccessPanel({
  order,
}: {
  order: CheckoutOrderResponse;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-950/20 p-6">
      <h2 className="text-2xl font-semibold">Pedido confirmado</h2>
      <p className="mt-2 text-gray-200">Número: {order.orderNumber}</p>
      <p className="text-gray-200">Total: {toMoney(Number(order.totalAmount ?? 0))}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <p className="basis-full text-sm text-blue-100">
          Compra concluída. Suas keys já foram liberadas na sua biblioteca.
        </p>
        <Link
          to="/meus-pedidos"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold"
        >
          Ver meus pedidos
        </Link>
        <Link to="/loja" className="rounded-lg bg-gray-700 px-4 py-2 text-sm">
          Continuar comprando
        </Link>
      </div>
    </section>
  );
}
