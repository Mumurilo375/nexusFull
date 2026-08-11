import { Minus, Plus, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import { resolveAssetUrl, resolvePlatformLogoUrl } from "../../../services/assets";
import { getApiErrorMessage } from "../../../services/http";
import type { CartItem, CartResponse } from "./cart.types";

function toMoney(value: number) {
  return `R$ ${value.toFixed(2)}`;
}

function getQuantity(item: CartItem) {
  return Math.max(1, Number(item.quantity ?? 1));
}

function getAvailableStock(item: CartItem) {
  return Math.max(0, Number(item.stock?.available ?? 0));
}

function getItemTotal(item: CartItem) {
  return Number(item.listing?.price ?? 0) * getQuantity(item);
}

function getNextLowerQuantity(item: CartItem) {
  const quantity = getQuantity(item);
  const availableStock = getAvailableStock(item);

  if (availableStock > 0 && availableStock < quantity) {
    return availableStock;
  }

  return quantity - 1;
}

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyListingId, setBusyListingId] = useState<number | null>(null);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + getItemTotal(item), 0),
    [items],
  );
  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + getQuantity(item), 0),
    [items],
  );
  const hasStockIssues = useMemo(
    () => items.some((item) => item.isQuantityAvailable === false),
    [items],
  );

  const readCart = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
        setError("");
      }

      const { data } = await api.get<CartResponse>("/cart");
      setItems(data.items ?? []);
    } catch (requestError) {
      if (showLoading) {
        setItems([]);
        setError(
          getApiErrorMessage(requestError, "Não foi possível carregar o carrinho."),
        );
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void readCart(true);
  }, []);

  const syncCartCounters = () => {
    window.dispatchEvent(new Event("nexus:counts-updated"));
  };

  const reloadCartWithError = async <TError,>(
    requestError: TError,
    fallbackMessage: string,
  ) => {
    const message = getApiErrorMessage(requestError, fallbackMessage);
    await readCart();
    setError(message);
  };

  const updateQuantity = async (listingId: number, nextQuantity: number) => {
    if (nextQuantity < 1) {
      return;
    }

    try {
      setBusyListingId(listingId);
      setError("");
      await api.patch(`/cart/${listingId}`, { quantity: nextQuantity });
      await readCart();
      syncCartCounters();
    } catch (requestError) {
      await reloadCartWithError(
        requestError,
        "Não foi possível atualizar a quantidade do item.",
      );
    } finally {
      setBusyListingId(null);
    }
  };

  const removeItem = async (listingId: number) => {
    try {
      setBusyListingId(listingId);
      setError("");
      await api.delete(`/cart/${listingId}`);
      setItems((current) => current.filter((item) => item.listingId !== listingId));
      syncCartCounters();
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Não foi possível remover o item."),
      );
    } finally {
      setBusyListingId(null);
    }
  };

  const clearCart = async () => {
    try {
      setBusyListingId(-1);
      setError("");
      await api.delete("/cart");
      setItems([]);
      syncCartCounters();
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Não foi possível limpar o carrinho."),
      );
    } finally {
      setBusyListingId(null);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 pb-10 pt-28">
      <div className="nexus-panel p-7">
        <div className="flex flex-col gap-2 border-b border-slate-800 pb-5 md:flex-row md:items-end md:justify-between">
          <h1 className="text-3xl font-bold text-white">Carrinho</h1>
        </div>

        {loading && <p className="mt-6 text-gray-300">Carregando carrinho...</p>}

        {!loading && error && (
          <p className="mt-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="nexus-card mt-6 p-6">
            <p className="text-gray-300">Seu carrinho está vazio.</p>
            <Link
              to="/loja"
              className="mt-4 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Ir para loja
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="space-y-4">
              {items.map((item) => {
                const quantity = getQuantity(item);
                const availableStock = getAvailableStock(item);
                const itemTotal = getItemTotal(item);
                const isBusy =
                  busyListingId === item.listingId || busyListingId === -1;

                return (
                  <article key={item.id} className="nexus-card p-6">
                    <div className="flex flex-col gap-5 md:flex-row">
                      <img
                        src={resolveAssetUrl(item.listing?.game?.coverImageUrl)}
                        alt={item.listing?.game?.title || "Jogo"}
                        className="aspect-[18/7] w-full rounded-2xl border border-slate-800 object-cover md:w-72"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="truncate text-xl font-semibold text-white">
                              {item.listing?.game?.title || "Jogo"}
                            </h2>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-950/90 p-1.5">
                              <img
                                src={resolvePlatformLogoUrl(item.listing?.platform?.name)}
                                alt={item.listing?.platform?.name || "Plataforma"}
                                title={item.listing?.platform?.name || "Plataforma"}
                                className="h-full w-full object-contain"
                              />
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-sm">
                            <span className="rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1 text-slate-300">
                              {toMoney(Number(item.listing?.price ?? 0))} por unidade.
                            </span>
                            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 font-semibold text-blue-100">
                              Total: {toMoney(itemTotal)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-950/80">
                              <button
                                type="button"
                                onClick={() => {
                                  void updateQuantity(item.listingId, getNextLowerQuantity(item));
                                }}
                                disabled={
                                  isBusy ||
                                  quantity <= 1 ||
                                  (item.isQuantityAvailable === false &&
                                    availableStock === 0)
                                }
                                className="px-3 py-2 text-slate-200 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Diminuir quantidade"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="min-w-12 border-x border-slate-700 px-4 py-2 text-center text-sm font-semibold text-white">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  void updateQuantity(item.listingId, quantity + 1);
                                }}
                                disabled={isBusy || quantity >= availableStock}
                                className="px-3 py-2 text-slate-200 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Aumentar quantidade"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <span className="text-sm text-slate-400">
                              {availableStock === 1
                                ? "1 unidade disponível"
                                : `${availableStock} unidades disponíveis`}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              void removeItem(item.listingId);
                            }}
                            disabled={isBusy}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-rose-500/50 hover:text-rose-200 disabled:opacity-60"
                          >
                            <Trash2Icon className="h-4 w-4" />
                            Remover
                          </button>
                        </div>

                        {item.isQuantityAvailable === false && (
                          <p className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                            {availableStock === 0 ? (
                              <>
                                Seu carrinho tem {quantity} unidades desse jogo, mas ele ficou
                                sem estoque agora. Remova o item para continuar.
                              </>
                            ) : (
                              <>
                                Seu carrinho tem {quantity} unidades desse jogo, mas só existem{" "}
                                {availableStock} disponíveis agora. Ajuste a quantidade
                                para continuar.
                              </>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="nexus-card h-fit p-6 lg:sticky lg:top-28">
              <h2 className="text-xl font-semibold text-white">Resumo</h2>
              <div className="mt-5 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/85 p-4 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Jogos diferentes</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Unidades</span>
                  <span>{totalQuantity}</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold text-white">
                  <span>Subtotal</span>
                  <span>{toMoney(subtotal)}</span>
                </div>
              </div>

              {hasStockIssues && (
                <p className="mt-5 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  O estoque de um ou mais itens mudou. Ajuste as quantidades antes
                  de finalizar a compra.
                </p>
              )}

              <Link
                to="/loja"
                className="mt-5 flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:text-white"
              >
                Voltar para loja
              </Link>

              {hasStockIssues ? (
                <button
                  type="button"
                  disabled
                  className="mt-3 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white opacity-50"
                >
                  Ajuste o carrinho para continuar
                </button>
              ) : (
                <Link
                  to="/checkout"
                  className="mt-3 block rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Finalizar compra
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  void clearCart();
                }}
                disabled={busyListingId !== null}
                className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-500 disabled:opacity-60"
              >
                Limpar carrinho
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
