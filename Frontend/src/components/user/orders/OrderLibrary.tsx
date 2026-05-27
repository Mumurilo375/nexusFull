import { Eye, EyeOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Pagination from "../../globals/Pagination";
import api from "../../../services/api";
import { resolveAssetUrl } from "../../../services/assets";
import {
  getApiErrorMessage,
  type PaginatedResponse,
  type PaginationMeta,
} from "../../../services/http";
import type { LibraryItem } from "./orderLibrary.types";

const PAGE_SIZE = 6;
const emptyMeta: PaginationMeta = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

function toMoney(value: number) {
  return `R$ ${value.toFixed(2)}`;
}

function maskKey(value: string) {
  return value.replace(/[^\s]/g, "*");
}

export default function OrderLibrary() {
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [libraryMeta, setLibraryMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<number[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get<PaginatedResponse<LibraryItem>>(
          "/library/keys",
          {
            params: { page, limit: PAGE_SIZE },
          },
        );

        setLibrary(data.items ?? []);
        setLibraryMeta(data.meta ?? emptyMeta);
      } catch (requestError) {
        setLibrary([]);
        setLibraryMeta(emptyMeta);
        setError(
          getApiErrorMessage(
            requestError,
            "Não foi possível carregar seus pedidos e keys.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [page]);

  const totalVisibleItems = useMemo(() => library.length, [library.length]);

  const toggleKeyVisibility = (itemId: number) => {
    setVisibleKeys((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId],
    );
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 pb-10 pt-28">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Meus pedidos e keys</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-300">
          Aqui ficam suas compras liberadas. Cada item mostra o jogo, o valor
          pago, o pedido e a key protegida.
        </p>
      </header>

      {loading && <p className="text-gray-300">Carregando suas compras...</p>}
      {!loading && error && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      {!loading && !error && (
        <section className="rounded-2xl border border-gray-800 bg-gray-950/85 p-5">
          <div className="flex flex-col gap-2 border-b border-gray-800 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Biblioteca de compras
              </h2>
              <p className="text-sm text-gray-400">
                {libraryMeta.total} item(ns) encontrado(s)
              </p>
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
              Mostrando {totalVisibleItems} nesta página
            </p>
          </div>

          {library.length === 0 && (
            <p className="py-8 text-center text-gray-300">
              Nenhuma key entregue ainda.
            </p>
          )}

          {library.length > 0 && (
            <div className="mt-5 space-y-4">
              {library.map((item) => {
                const isVisible = visibleKeys.includes(item.id);
                const keyValue = item.gameKey?.keyValue || "-";

                return (
                  <article
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900/90 p-4 transition hover:border-gray-700"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <img
                        src={resolveAssetUrl(item.listing?.game?.coverImageUrl)}
                        alt={item.listing?.game?.title || "Jogo"}
                        className="aspect-[18/7] w-full rounded-xl object-cover sm:w-40"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="truncate text-xl font-semibold text-white">
                              {item.listing?.game?.title || "Jogo"}
                            </h3>
                            <p className="mt-1 text-sm text-gray-400">
                              {item.listing?.platform?.name || "Plataforma"}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-lg font-semibold text-blue-200">
                              {toMoney(Number(item.listing?.price ?? 0))}
                            </p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gray-500">
                              Pedido {item.order?.orderNumber || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-gray-800 bg-black/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                              Key
                            </p>
                            <p className="mt-1 break-all font-mono text-sm text-gray-100">
                              {isVisible ? keyValue : maskKey(keyValue)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleKeyVisibility(item.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 transition hover:border-blue-500 hover:text-white"
                          >
                            {isVisible ? (
                              <>
                                <EyeOff className="h-4 w-4" />
                                Ocultar
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4" />
                                Mostrar Keys
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <Pagination
            page={libraryMeta.page}
            totalPages={libraryMeta.totalPages}
            onPageChange={setPage}
          />
        </section>
      )}
    </main>
  );
}
