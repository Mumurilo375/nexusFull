import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../shared/AdminLayout";
import AdminConfirmModal from "../shared/AdminConfirmModal";
import {
  AdminButton,
  AdminLinkButton,
  AdminPageState,
  AdminStatusBadge,
  adminBackToPanelClass,
  createEmptyMeta,
  formatReleaseDate,
} from "../shared/adminShared";
import Pagination from "../../globals/Pagination";
import api from "../../../services/api";
import { resolveAssetUrl } from "../../../services/assets";
import {
  getApiErrorMessage,
  type PaginatedResponse,
} from "../../../services/http";

type Game = {
  id: number;
  title: string;
  description: string;
  coverImageUrl?: string;
  releaseDate: string;
  isActive?: boolean;
};

const PAGE_SIZE = 9;
const emptyPagination = createEmptyMeta(PAGE_SIZE);
const actionBaseClass =
  "inline-flex min-h-10 items-center justify-center rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70";
const editActionClass = `${actionBaseClass} flex-1 border-slate-700 bg-slate-950 text-slate-100 hover:border-blue-500/45 hover:bg-slate-900`;
const monitorActionClass = `${actionBaseClass} flex-1 border-blue-500/35 bg-blue-500/12 px-2.5 text-center text-[10px] font-medium leading-[1.1] normal-case tracking-normal whitespace-normal text-blue-100 hover:border-blue-400/60 hover:bg-blue-500/20`;
const deleteActionClass = `${actionBaseClass} flex-1 border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20`;

export default function AdminGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingGameId, setDeletingGameId] = useState<number | null>(null);
  const [pendingDeleteGame, setPendingDeleteGame] = useState<Game | null>(null);

  const fetchGamesPage = useCallback(
    async (page = currentPage) => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const { data } = await api.get<PaginatedResponse<Game>>("/games", {
          params: {
            page,
            limit: PAGE_SIZE,
            q: searchQuery.trim() || undefined,
          },
        });

        setGames(data.items ?? []);
        setPagination(data.meta ?? emptyPagination);
      } catch (error) {
        setGames([]);
        setPagination(emptyPagination);
        setErrorMessage(
          getApiErrorMessage(error, "Não foi possível carregar os jogos."),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, searchQuery],
  );

  useEffect(() => {
    void fetchGamesPage();
  }, [fetchGamesPage]);

  const removeGame = async () => {
    if (!pendingDeleteGame) return;
    const gameId = pendingDeleteGame.id;

    try {
      setDeletingGameId(gameId);
      setErrorMessage("");
      await api.delete(`/games/${gameId}`);
      setPendingDeleteGame(null);

      if (games.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
        return;
      }

      await fetchGamesPage();
    } catch (error) {
      setPendingDeleteGame(null);
      setErrorMessage(
        getApiErrorMessage(error, "Não foi possível excluir o jogo."),
      );
    } finally {
      setDeletingGameId(null);
    }
  };

  const emptyText = searchQuery.trim()
    ? "Nenhum jogo encontrado para essa busca."
    : "Nenhum jogo cadastrado.";

  return (
    <AdminLayout
      title="Jogos"
      description="Cadastre jogos, ajuste o editorial e abra o monitor por plataforma para controlar preço, status e estoque."
      backTo="/admin"
      backLabel="Voltar ao painel"
      backClassName={adminBackToPanelClass}
      actions={
        <AdminLinkButton to="/admin/games/new" tone="primary">
          Novo jogo
        </AdminLinkButton>
      }
    >
      <div className="nexus-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <label className="block text-sm font-medium text-gray-200">
            Buscar jogo
          </label>
          <span className="text-sm text-slate-400">
            {pagination.total} resultado{pagination.total === 1 ? "" : "s"}
          </span>
        </div>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={({ target }) => (
              setSearchQuery(target.value),
              setCurrentPage(1)
            )}
            placeholder="Pesquisar por título..."
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-slate-500"
          />
        </div>
      </div>

      <AdminPageState
        loading={isLoading}
        error={errorMessage}
        isEmpty={games.length === 0}
        loadingText="Carregando jogos..."
        emptyText={emptyText}
      >
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {games.map((game) => (
              <article
                key={game.id}
                className="nexus-card flex flex-col overflow-hidden p-4"
              >
                <img
                  src={resolveAssetUrl(game.coverImageUrl)}
                  alt={game.title}
                  className="h-48 w-full rounded-[22px] border border-slate-800 object-cover"
                />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{game.title}</h2>
                    <p className="mt-1 text-xs text-gray-400">
                      Lançamento: {formatReleaseDate(game.releaseDate)}
                    </p>
                  </div>
                  <AdminStatusBadge active={game.isActive} />
                </div>
                <p className="mt-3 min-h-16 text-sm leading-6 text-gray-300">
                  {game.description}
                </p>

                <div className="mt-4 grid gap-2 rounded-2xl border border-slate-800/90 bg-slate-900/45 p-2 sm:grid-cols-3">
                  <AdminLinkButton
                    to={`/admin/games/${game.id}/edit`}
                    tone="secondary"
                    className={editActionClass}
                  >
                    Editar
                  </AdminLinkButton>
                  <AdminLinkButton
                    to={`/admin/games/${game.id}/platforms`}
                    tone="secondary"
                    className={monitorActionClass}
                  >
                    Monitorar plataforma
                  </AdminLinkButton>
                  <AdminButton
                    type="button"
                    tone="subtleDanger"
                    className={deleteActionClass}
                    disabled={deletingGameId === game.id}
                    onClick={() => setPendingDeleteGame(game)}
                  >
                    {deletingGameId === game.id ? "Excluindo..." : "Excluir"}
                  </AdminButton>
                </div>
              </article>
            ))}
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
          />

          {pendingDeleteGame && (
            <AdminConfirmModal
              title="Excluir jogo"
              message={
                <>
                  Tem certeza que deseja excluir o jogo{" "}
                  <span className="font-semibold text-white">
                    {pendingDeleteGame.title}
                  </span>
                  ?
                </>
              }
              isProcessing={deletingGameId === pendingDeleteGame.id}
              onCancel={() => setPendingDeleteGame(null)}
              onConfirm={() => {
                void removeGame();
              }}
              tone="danger"
              confirmLabel="Excluir"
              processingLabel="Excluindo..."
            />
          )}
        </>
      </AdminPageState>
    </AdminLayout>
  );
}
