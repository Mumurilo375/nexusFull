import { useEffect, useState } from "react";
import AdminLayout from "../shared/AdminLayout";
import { AdminNotice, AdminPageState, AdminStatusBadge, formatMoney } from "../shared/adminShared";
import type { AdminOrderDetails as AdminOrderDetailsType } from "../shared/admin.types";
import api from "../../../services/api";
import { getApiErrorMessage } from "../../../services/http";
import { resolveAssetUrl } from "../../../services/assets";
import Pagination from "../../globals/Pagination";

const ITEMS_PER_PAGE = 6;

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("pt-BR");
}

function translateStatus(value?: string) {
  if (value === "paid") return "Pago";
  if (value === "pending") return "Pendente";
  if (value === "cancelled") return "Cancelado";
  if (value === "succeeded") return "Pagamento aprovado";
  return value || "-";
}

type AdminOrderDetailsProps = {
  orderId?: string;
};

export default function AdminOrderDetails({ orderId }: AdminOrderDetailsProps) {
  const [order, setOrder] = useState<AdminOrderDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [itemsPage, setItemsPage] = useState(1);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setIsLoading(false);
        setErrorMessage("Pedido inválido.");
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const { data } = await api.get<AdminOrderDetailsType>(`/admin/orders/${orderId}`);
        setOrder(data);
      } catch (error) {
        setOrder(null);
        setErrorMessage(
          getApiErrorMessage(error, "Não foi possível carregar o pedido."),
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrder();
  }, [orderId]);

  useEffect(() => {
    setItemsPage(1);
  }, [order?.id]);

  const visibleItems = order
    ? order.items.slice((itemsPage - 1) * ITEMS_PER_PAGE, itemsPage * ITEMS_PER_PAGE)
    : [];

  return (
    <AdminLayout
      title={order ? `Pedido ${order.orderNumber}` : "Detalhes do pedido"}
      description="Visualização completa do pedido, do comprador e das licenças entregues."
      backTo="/admin/orders"
      backLabel="Voltar para pedidos"
    >
      <AdminPageState
        loading={isLoading}
        error={errorMessage}
        isEmpty={!order}
        loadingText="Carregando pedido..."
        emptyText="Pedido não encontrado."
      >
        {order ? (
          <div className="space-y-5">
            <section className="grid gap-4 lg:grid-cols-3">
              <article className="rounded-[24px] border border-slate-800 bg-slate-950/82 p-5 lg:col-span-2">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge
                    active={order.status === "paid"}
                    activeLabel={`Status: ${translateStatus(order.status)}`}
                    inactiveLabel={`Status: ${translateStatus(order.status)}`}
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Subtotal</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{formatMoney(order.subtotal)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Desconto</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{formatMoney(order.discountAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total</p>
                    <p className="mt-2 text-2xl font-semibold text-blue-100">{formatMoney(order.totalAmount)}</p>
                  </div>
                </div>
              </article>

              <article className="rounded-[24px] border border-slate-800 bg-slate-950/82 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Cliente</p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  {order.user?.fullName || order.user?.username || "Usuário"}
                </h2>
                <p className="mt-2 text-sm text-slate-300">{order.user?.email || "Sem email"}</p>
                <p className="mt-2 text-sm text-slate-400">
                  CPF: {order.user?.cpf || "Não informado"}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Método: {order.paymentMethod || "-"}
                </p>
              </article>
            </section>

            <section className="rounded-[24px] border border-slate-800 bg-slate-950/82 p-5">
              <h2 className="text-lg font-semibold text-white">Timeline básica</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Criado</p>
                  <p className="mt-2 text-sm text-slate-200">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pagamento confirmado</p>
                  <p className="mt-2 text-sm text-slate-200">{formatDateTime(order.paymentConfirmedAt)}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Cancelado</p>
                  <p className="mt-2 text-sm text-slate-200">{formatDateTime(order.cancelledAt)}</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">Itens do pedido</h2>
                <p className="text-sm text-slate-400">{order.items.length} item(ns) no pedido</p>
              </div>

              {order.items.length === 0 && (
                <AdminNotice>Este pedido não possui itens cadastrados.</AdminNotice>
              )}

              {visibleItems.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 rounded-[24px] border border-slate-800 bg-slate-950/82 p-5 sm:flex-row"
                >
                  <img
                    src={resolveAssetUrl(item.listing?.game?.coverImageUrl)}
                    alt={item.listing?.game?.title || "Jogo"}
                    className="aspect-[18/7] w-full rounded-2xl border border-slate-800 object-cover sm:w-44"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {item.listing?.game?.title || "Jogo"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {item.listing?.platform?.name || "Plataforma"}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Item #{item.id} · Listing #{item.listingId}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-lg font-semibold text-blue-100">{formatMoney(item.price)}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Registrado em {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                </article>
              ))}

              {order.items.length > ITEMS_PER_PAGE && (
                <Pagination
                  page={itemsPage}
                  totalPages={Math.ceil(order.items.length / ITEMS_PER_PAGE)}
                  onPageChange={setItemsPage}
                />
              )}
            </section>
          </div>
        ) : null}
      </AdminPageState>
    </AdminLayout>
  );
}

