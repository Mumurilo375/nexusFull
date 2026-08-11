import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../../globals/Pagination";
import api from "../../../services/api";
import {
  getApiErrorMessage,
  type PaginatedResponse,
  type PaginationMeta,
} from "../../../services/http";
import AdminLayout from "../shared/AdminLayout";
import {
  AdminButton,
  AdminPageState,
  AdminStatusBadge,
  adminFieldClass,
  adminBackToPanelClass,
  formatMoney,
} from "../shared/adminShared";
import type { AdminOrderSummary } from "../shared/admin.types";

const PAGE_SIZE = 10;
const emptyMeta: PaginationMeta = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

function formatDateTime(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("pt-BR");
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [appliedSearchText, setAppliedSearchText] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  const [appliedPaymentStatusFilter, setAppliedPaymentStatusFilter] =
    useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const { data } = await api.get<PaginatedResponse<AdminOrderSummary>>(
          "/admin/orders",
          {
            params: {
              page,
              limit: PAGE_SIZE,
              q: appliedSearchText || undefined,
              status: appliedStatusFilter || undefined,
              paymentStatus: appliedPaymentStatusFilter || undefined,
            },
          },
        );

        setOrders(data.items ?? []);
        setMeta(data.meta ?? emptyMeta);
      } catch (error) {
        setOrders([]);
        setMeta(emptyMeta);
        setErrorMessage(
          getApiErrorMessage(error, "Não foi possível carregar os pedidos."),
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrders();
  }, [
    appliedPaymentStatusFilter,
    appliedSearchText,
    appliedStatusFilter,
    page,
  ]);

  const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setAppliedSearchText(searchText.trim());
    setAppliedStatusFilter(statusFilter);
    setAppliedPaymentStatusFilter(paymentStatusFilter);
  };

  const handleFilterReset = () => {
    setSearchText("");
    setStatusFilter("");
    setPaymentStatusFilter("");
    setPage(1);
    setAppliedSearchText("");
    setAppliedStatusFilter("");
    setAppliedPaymentStatusFilter("");
  };

  return (
    <AdminLayout
      title="Pedidos"
      description="Consulta completa dos pedidos realizados na loja, com filtros e visualização detalhada."
      backTo="/admin"
      backLabel="Voltar ao painel"
      backClassName={adminBackToPanelClass}
    >
      <form
        onSubmit={handleFilterSubmit}
        className="grid gap-4 rounded-[24px] border border-slate-800 bg-slate-950/70 p-4 md:grid-cols-4"
      >
        <label className="text-sm text-slate-200 md:col-span-2">
          Buscar por pedido, email ou usuário
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className={adminFieldClass}
            placeholder="Ex.: NEX-12, teste@nexus.com, admin"
          />
        </label>

        <label className="text-sm text-slate-200">
          Status do pedido
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={adminFieldClass}
          >
            <option value="">Todos</option>
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="cancelled">cancelled</option>
          </select>
        </label>

        <label className="text-sm text-slate-200">
          Status do pagamento
          <select
            value={paymentStatusFilter}
            onChange={(event) => setPaymentStatusFilter(event.target.value)}
            className={adminFieldClass}
          >
            <option value="">Todos</option>
            <option value="pending">pending</option>
            <option value="succeeded">succeeded</option>
            <option value="failed">failed</option>
          </select>
        </label>

        <div className="flex flex-wrap gap-3 md:col-span-4">
          <AdminButton type="submit">Aplicar filtros</AdminButton>
          <AdminButton
            type="button"
            tone="secondary"
            onClick={handleFilterReset}
          >
            Limpar
          </AdminButton>
        </div>
      </form>

      <AdminPageState
        loading={isLoading}
        error={errorMessage}
        isEmpty={orders.length === 0}
        loadingText="Carregando pedidos..."
        emptyText="Nenhum pedido encontrado para os filtros aplicados."
      >
        <section className="space-y-4">
          <p className="text-sm text-slate-400">
            {meta.total} pedido(s) encontrado(s)
          </p>

          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-[24px] border border-slate-800 bg-slate-950/82 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-white">
                      {order.orderNumber}
                    </h2>
                    <AdminStatusBadge
                      active={order.status === "paid"}
                      activeLabel={`Pedido ${order.status}`}
                      inactiveLabel={`Pedido ${order.status}`}
                    />
                    <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                      Pagamento {order.paymentStatus}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300">
                    {order.user?.fullName || order.user?.username || "Usuário"}{" "}
                    · {order.user?.email || "Sem email"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {order.itemCount} item(ns) · Criado em{" "}
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  <p className="text-2xl font-bold text-blue-100">
                    {formatMoney(order.totalAmount)}
                  </p>
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    Ver detalhes
                  </Link>
                </div>
              </div>
            </article>
          ))}

          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        </section>
      </AdminPageState>
    </AdminLayout>
  );
}
