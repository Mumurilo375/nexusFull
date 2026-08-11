import { ArrowRight, Search, X } from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { resolveAssetUrl } from "../../services/assets";
import type { GameSuggestion, GamesResponse } from "./globals.types";

const normalizeSearchText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export default function NavbarSearchPopover() {
  const navigate = useNavigate();
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [games, setGames] = useState<GameSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const closeSearch = useCallback((restoreTriggerFocus = true) => {
    setIsOpen(false);
    if (restoreTriggerFocus) {
      triggerRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (!isOpen || games.length) return;

    let active = true;

    const loadGames = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const { data } = await api.get<GamesResponse>("/games", {
          params: { page: 1, limit: 100 },
        });

        if (active) {
          setGames(data?.items ?? []);
        }
      } catch {
        if (active) {
          setGames([]);
          setErrorMessage("Não foi possível carregar as sugestões agora.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadGames();

    return () => {
      active = false;
    };
  }, [games.length, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    searchInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearch();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (!searchBoxRef.current?.contains(event.target as Node)) {
        closeSearch(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeSearch, isOpen]);

  const filteredGames = useMemo(() => {
    const normalizedSearch = normalizeSearchText(searchTerm);

    return (normalizedSearch
      ? games.filter((game) => normalizeSearchText(game.title).includes(normalizedSearch))
      : games
    ).slice(0, 6);
  }, [games, searchTerm]);

  const resetSearch = () => {
    setSearchTerm("");
    setErrorMessage("");
    searchInputRef.current?.focus();
  };

  const openGame = (gameId: number) => {
    setSearchTerm("");
    setErrorMessage("");
    closeSearch(false);
    void navigate(`/loja/${gameId}`);
  };

  const showCatalogResults = () => {
    const term = searchTerm.trim();
    closeSearch(false);
    void navigate(term ? `/loja?q=${encodeURIComponent(term)}` : "/loja");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    showCatalogResults();
  };

  return (
    <div ref={searchBoxRef} className="relative">
      <button
        type="button"
        ref={triggerRef}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 text-slate-200 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 md:w-44 md:justify-start lg:w-56"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-label="Pesquisar jogos"
        aria-expanded={isOpen}
        aria-controls="painel-busca-jogos"
      >
        <Search className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="hidden truncate text-sm text-slate-400 md:inline">
          Pesquisar jogos
        </span>
      </button>

      {isOpen && (
        <div
          id="painel-busca-jogos"
          role="search"
          className="fixed inset-x-3 top-[4.9rem] overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 p-3 shadow-[0_20px_55px_rgba(2,6,23,0.5)] md:absolute md:inset-x-auto md:right-0 md:top-14 md:w-[34rem]"
        >
          <form onSubmit={handleSubmit}>
            <label htmlFor="navbar-game-search" className="mb-2 block text-sm font-semibold text-white">
              O que você quer jogar?
            </label>
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  id="navbar-game-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="Digite o nome de um jogo"
                  autoComplete="off"
                  className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-10 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
                />
                {searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={resetSearch}
                    className="absolute right-1 top-1/2 inline-flex min-h-10 min-w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
                    aria-label="Limpar busca"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-500"
              >
                Buscar
              </button>
            </div>
          </form>

          <div className="mt-3 border-t border-slate-800 pt-2">
            {isLoading && (
              <p className="px-2 py-4 text-sm text-slate-300" role="status" aria-live="polite">
                Carregando sugestões...
              </p>
            )}

            {!isLoading && errorMessage && (
              <p className="px-2 py-4 text-sm text-rose-200" role="alert">
                {errorMessage}
              </p>
            )}

            {!isLoading && !errorMessage && (
              <ul className="nexus-scrollbar max-h-[min(24rem,55svh)] space-y-1 overflow-y-auto">
                {filteredGames.map((game) => (
                  <li key={game.id}>
                    <button
                      type="button"
                      onClick={() => openGame(game.id)}
                      className="group flex min-h-14 w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                    >
                      <img
                        src={resolveAssetUrl(game.coverImageUrl)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-12 w-12 shrink-0 rounded-lg bg-slate-900 object-cover"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-200 group-hover:text-white">
                        {game.title}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-blue-300" aria-hidden="true" />
                    </button>
                  </li>
                ))}

                {filteredGames.length === 0 && searchTerm.trim() && (
                  <li className="px-2 py-4 text-sm text-slate-400">
                    Nenhuma sugestão exata. Busque no catálogo para conferir todos os resultados.
                  </li>
                )}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={showCatalogResults}
            className="mt-2 flex min-h-11 w-full items-center justify-between rounded-xl border border-slate-800 px-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white"
          >
            {searchTerm.trim() ? "Ver todos os resultados" : "Abrir catálogo completo"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
