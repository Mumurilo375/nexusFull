import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/useAuth";
import api from "../../../services/api";
import type { CheckoutOrderResponse } from "./checkout.types";

export default function PendingCheckoutNotice() {
  const { isAuthenticated, user } = useAuth();
  const { pathname } = useLocation();
  const userId = user?.id;
  const [notice, setNotice] = useState<{ userId: number; order: CheckoutOrderResponse } | null>(null);
  const [dismissedOrderId, setDismissedOrderId] = useState<number | null>(null);
  const hidden = pathname === "/checkout" || pathname === "/login" || pathname === "/cadastro" || pathname.startsWith("/admin");

  useEffect(() => {
    if (!isAuthenticated || !userId || hidden) return;
    let active = true;
    let loading = false;
    const load = async () => {
      if (loading || document.visibilityState === "hidden") return;
      loading = true;
      try {
        const { data } = await api.get<{ order: CheckoutOrderResponse | null }>("/checkout");
        if (active) setNotice(data.order ? { userId, order: data.order } : null);
      } catch {
        return;
      } finally { loading = false; }
    };
    void load();
    const onReturn = () => { void load(); };
    const timer = window.setInterval(() => void load(), 30000);
    window.addEventListener("focus", onReturn);
    document.addEventListener("visibilitychange", onReturn);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onReturn);
      document.removeEventListener("visibilitychange", onReturn);
    };
  }, [hidden, isAuthenticated, userId]);

  if (hidden || !isAuthenticated || !notice || notice.userId !== user?.id || notice.order.status !== "pending" ||
      notice.order.id === dismissedOrderId) return null;
  const { order } = notice;
  const expired = Boolean(order.paymentExpiresAt && Date.parse(order.paymentExpiresAt) <= Date.now());
  return (
    <aside aria-label="Compra pendente" className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-xl rounded-xl border border-blue-500/40 bg-slate-950 p-4 text-white shadow-lg shadow-black/40 sm:inset-x-6">
      <div className="flex items-start justify-between gap-3">
        <p role="status" className="pt-2 font-semibold">{expired ? "Confira sua compra pendente" : "Você tem uma compra em andamento"}</p>
        <button type="button" aria-label="Ocultar aviso de compra pendente" onClick={() => setDismissedOrderId(order.id)} className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200">
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        {expired ? "O prazo da reserva terminou. Abra o pedido para conferir a situação da compra."
          : order.checkoutUrl ? "Seu pagamento está pronto. Continue a compra antes do fim da reserva."
          : "Estamos preparando seu pagamento. Você pode acompanhar o pedido e continuar por lá quando estiver pronto."}
      </p>
      <Link to={`/checkout?orderId=${order.id}`} className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200">
        {expired ? "Conferir pedido" : "Continuar compra"}
      </Link>
    </aside>
  );
}
