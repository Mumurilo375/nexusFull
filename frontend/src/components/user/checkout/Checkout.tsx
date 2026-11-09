import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BackButton from "../../login/BackButton";
import AdminConfirmModal from "../../admin/shared/AdminConfirmModal";
import api from "../../../services/api";
import { getApiErrorMessage } from "../../../services/http";
import CheckoutSuccessPanel from "./CheckoutSuccessPanel";
import CheckoutSummary from "./CheckoutSummary";
import { getQuantity } from "./checkout.helpers";
import type { CheckoutCartItem, CheckoutCartResponse, CheckoutCreateResponse, CheckoutOrderResponse } from "./checkout.types";

const checkoutActionClass = "inline-flex min-h-12 items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60";

export default function Checkout() {
  const [params, setParams] = useSearchParams();
  const orderId = params.get("orderId");
  const [items, setItems] = useState<CheckoutCartItem[]>([]);
  const [order, setOrder] = useState<CheckoutOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<"create" | "refresh" | "cancel" | null>(null);
  const busy = busyAction !== null;
  const [wasCancelled, setWasCancelled] = useState(false);
  const [confirmingCancellation, setConfirmingCancellation] = useState(false);
  const [error, setError] = useState("");
  const closeCancellationConfirmation = useCallback(() => setConfirmingCancellation(false), []);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [cart, checkout] = await Promise.all([
          api.get<CheckoutCartResponse>("/cart"),
          api.get<{ order: CheckoutOrderResponse | null }>(orderId ? `/checkout/${orderId}` : "/checkout"),
        ]);
        if (active) { setItems(cart.data.items ?? []); setOrder(checkout.data.order); setError(""); }
      } catch (error) {
        if (active) setError(getApiErrorMessage(error, "Não foi possível carregar o checkout."));
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [orderId]);

  useEffect(() => {
    if (!order || order.status !== "pending") return;
    let active = true;
    const timer = window.setInterval(() => {
      void api.get<CheckoutCreateResponse>(`/checkout/${order.id}`).then(({ data }) => {
        if (active) { setOrder(data.order); setError(""); }
      }).catch((error) => {
        if (active) setError(getApiErrorMessage(error, "Não foi possível consultar o pagamento. Tente novamente."));
      });
    }, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [order]);

  useEffect(() => {
    if (order?.status === "paid") window.dispatchEvent(new Event("nexus:counts-updated"));
  }, [order?.status]);

  async function createOrder() {
    setBusyAction("create");
    setError("");
    try {
      const { data } = await api.post<CheckoutCreateResponse>("/checkout");
      setOrder(data.order);
      setParams({ orderId: String(data.order.id) });
      if (data.order.status === "pending" && data.order.checkoutUrl) window.location.assign(data.order.checkoutUrl);
    } catch (error) {
      setError(getApiErrorMessage(error, "Não foi possível iniciar o pagamento."));
    } finally { setBusyAction(null); }
  }

  async function checkPayment() {
    if (!order) return;
    setBusyAction("refresh");
    setError("");
    try {
      const { data } = await api.post<CheckoutCreateResponse>(`/checkout/${order.id}/refresh`);
      setOrder(data.order);
    } catch (error) {
      setError(getApiErrorMessage(error, "Não foi possível consultar o pagamento."));
    } finally { setBusyAction(null); }
  }

  async function cancelOrder() {
    if (!order) return;
    setBusyAction("cancel");
    setError("");
    try {
      const { data } = await api.post<CheckoutCreateResponse>(`/checkout/${order.id}/cancel`);
      setOrder(data.order);
      setWasCancelled(data.order.status === "failed");
    } catch (error) {
      setError(getApiErrorMessage(error, "Não foi possível cancelar a compra."));
    } finally {
      setBusyAction(null);
      setConfirmingCancellation(false);
    }
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.listing?.price ?? 0) * getQuantity(item), 0);
  const totalQuantity = items.reduce((sum, item) => sum + getQuantity(item), 0);
  const hasStockIssues = items.some((item) => item.isQuantityAvailable === false);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 pb-10 pt-28">
      <h1 className="text-3xl font-bold">Resumo do pedido</h1>
      <p className="mt-2 text-sm text-slate-300">Revise os itens e pague com segurança pelo Mercado Pago.</p>
      {error && <p role="alert" className="mt-5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
      {loading ? <p role="status" className="mt-6 text-slate-300">Carregando resumo...</p> : order ? (
        <>
          <CheckoutSuccessPanel order={order} wasCancelled={wasCancelled} />
          {order.status === "pending" && (
            <div className="mt-4 flex flex-wrap gap-3">
              {order.checkoutUrl && <a href={order.checkoutUrl} className={checkoutActionClass}>Abrir Mercado Pago</a>}
              <button type="button" disabled={busy} onClick={() => void checkPayment()} className={checkoutActionClass}>
                {busyAction === "refresh" ? "Consultando..." : "Já paguei, verificar pagamento"}
              </button>
              <button type="button" disabled={busy} onClick={() => setConfirmingCancellation(true)} className={checkoutActionClass}>
                {busyAction === "cancel" ? "Cancelando..." : "Cancelar compra"}
              </button>
            </div>
          )}
          {order.status === "failed" && <Link to="/carrinho" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500">Voltar ao carrinho</Link>}
        </>
      ) : items.length ? (
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <CheckoutSummary items={items} subtotal={subtotal} totalQuantity={totalQuantity} hasStockIssues={hasStockIssues} />
          <div className="self-start rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold">Pagamento</h2>
            <p className="mt-3 text-sm text-slate-300">Você escolherá a forma de pagamento no Mercado Pago. As keys serão liberadas após a confirmação.</p>
            <p className="mt-3 text-sm text-slate-300">Os itens ficam reservados por 30 minutos ao iniciar o pagamento.</p>
            <button type="button" disabled={busy || hasStockIssues} aria-busy={busy} onClick={() => void createOrder()} className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
              {busy ? "Abrindo pagamento..." : hasStockIssues ? "Ajuste o carrinho para continuar" : "Continuar para pagamento"}
            </button>
          </div>
        </section>
      ) : <p className="mt-6 text-slate-300">Seu carrinho está vazio. <Link to="/loja" className="text-blue-300 underline">Ir para loja</Link></p>}
      <BackButton />
      {confirmingCancellation && (
        <AdminConfirmModal
          title="Cancelar esta compra?"
          message="A cobrança pendente será cancelada e os itens reservados serão liberados. Se o pagamento já tiver sido aprovado, a compra continuará como concluída."
          onCancel={closeCancellationConfirmation}
          onConfirm={() => void cancelOrder()}
          confirmLabel="Cancelar compra"
          cancelLabel="Manter compra"
          processingLabel="Cancelando..."
          isProcessing={busyAction === "cancel"}
          tone="danger"
        />
      )}
    </main>
  );
}
