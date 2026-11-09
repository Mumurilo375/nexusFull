import { Link } from "react-router-dom";
import { toMoney } from "./checkout.helpers";
import type { CheckoutOrderResponse } from "./checkout.types";

export default function CheckoutSuccessPanel({ order }: { order: CheckoutOrderResponse }) {
  const paid = order.status === "paid";
  const failed = order.status === "failed";
  return (
    <section role="status" className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-950/20 p-6">
      <h2 className="text-2xl font-semibold">{paid ? "Pagamento confirmado" : failed ? "Pagamento não concluído" : "Aguardando pagamento"}</h2>
      <p className="mt-2 text-slate-200">Número: {order.orderNumber}</p>
      <p className="text-slate-200">Total: {toMoney(Number(order.totalAmount))}</p>
      <p className="mt-4 text-sm text-blue-100">{paid ? "Suas keys já estão disponíveis na biblioteca." : failed ? "O pedido foi encerrado e a reserva dos itens foi liberada. Um pagamento aprovado após o encerramento será estornado." : "Conclua o pagamento no Mercado Pago. Esta página atualiza a confirmação automaticamente."}</p>
      {!paid && !failed && order.paymentExpiresAt && <p className="mt-2 text-sm text-blue-100">Reserva até {new Date(order.paymentExpiresAt).toLocaleString("pt-BR")}.</p>}
      {paid && <Link to="/meus-pedidos" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold hover:bg-blue-500">Ver keys na biblioteca</Link>}
    </section>
  );
}
