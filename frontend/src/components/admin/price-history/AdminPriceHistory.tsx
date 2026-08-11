import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  adminFieldClass,
  adminBackToPanelClass,
  formatMoney,
} from "../shared/adminShared";
import type { AdminPriceHistoryItem } from "../shared/admin.types";

const PAGE_SIZE = 12;
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

export default function AdminPriceHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<AdminPriceHistoryItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [listingIdText, setListingIdText] = useState(
    searchParams.get("listingId") ?? "",
  );
  const [appliedSearchText, setAppliedSearchText] = useState("");
  const [appliedListingIdText, setAppliedListingIdText] = useState(
    searchParams.get("listingId") ?? "",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const searchListingId = searchParams.get("listingId") ?? "";
    setListingIdText(searchListingId);
    setAppliedListingIdText(searchListingId);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const { data } = await api.get<
          PaginatedResponse<AdminPriceHistoryItem>
        >("/admin/price-history", {
          params: {
            page,
            limit: PAGE_SIZE,
            q: appliedSearchText || undefined,
            listingId: appliedListingIdText || undefined,
          },
        });

        setItems(data.items ?? []);
        setMeta(data.meta ?? emptyMeta);
      } catch (error) {
        setItems([]);
        setMeta(emptyMeta);
        setErrorMessage(
          getApiErrorMessage(
            error,
            "Não foi possível carregar o histórico de preço.",
          ),
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadHistory();
  }, [appliedListingIdText, appliedSearchText, page]);

  const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextListingId = listingIdText.trim();
    setPage(1);
    setAppliedSearchText(searchText.trim());
    setAppliedListingIdText(nextListingId);
    setSearchParams(nextListingId ? { listingId: nextListingId } : {});
  };

  const handleFilterReset = () => {
    setSearchText("");
    setListingIdText("");
    setAppliedSearchText("");
    setAppliedListingIdText("");
    setPage(1);
    setSearchParams({});
  };

  return (
    <AdminLayout
      title="Auditoria de preço"
      description="Histórico do preço base por jogo e plataforma, com responsável e data da alteração."
      backTo="/admin"
      backLabel="Voltar ao painel"
      backClassName={adminBackToPanelClass}
    >
      <form
        onSubmit={handleFilterSubmit}
        className="grid gap-4 rounded-[24px] border border-slate-800 bg-slate-950/70 p-4 md:grid-cols-3"
      >
        <label className="text-sm text-slate-200 md:col-span-2">
          Buscar por jogo, plataforma ou admin
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className={adminFieldClass}
            placeholder="Ex.: Hollow Knight, Steam, admin"
          />
        </label>

        <label className="text-sm text-slate-200">
          Listing ID
          <input
            value={listingIdText}
            onChange={(event) =>
              setListingIdText(event.target.value.replace(/[^\d]/g, ""))
            }
            className={adminFieldClass}
            placeholder="Ex.: 14"
          />
        </label>

        <div className="flex flex-wrap gap-3 md:col-span-3">
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
        isEmpty={items.length === 0}
        loadingText="Carregando histórico..."
        emptyText="Nenhuma alteração de preço encontrada."
      >
        <section className="space-y-4">
          <p className="text-sm text-slate-400">
            {meta.total} alteração(ões) encontrada(s)
          </p>

          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-[24px] border border-slate-800 bg-slate-950/82 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-white">
                    {item.game?.title || "Jogo"} ·{" "}
                    {item.platform?.name || "Plataforma"}
                  </h2>
                  <p className="text-sm text-slate-400">
                    Listing #{item.listingId} · Alterado em{" "}
                    {formatDateTime(item.createdAt)}
                  </p>
                  <p className="text-sm text-slate-300">
                    Responsável:{" "}
                    {item.changedBy?.username ||
                      item.changedBy?.email ||
                      "Não identificado"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Preço anterior
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-200">
                      {item.previousPrice === null
                        ? "Cadastro inicial"
                        : formatMoney(item.previousPrice)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Novo preço
                    </p>
                    <p className="mt-2 text-lg font-semibold text-blue-100">
                      {formatMoney(item.nextPrice)}
                    </p>
                  </div>
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
