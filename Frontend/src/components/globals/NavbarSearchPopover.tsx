import { Search, X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { resolveAssetUrl } from "../../services/assets";
import type { GameSuggestion, GamesResponse } from "./globals.types";

const iconButtonClass =
  "relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-950/75 text-slate-200 transition hover:border-slate-600 hover:text-white";

const normalizeSearchText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export default function NavbarSearchPopover() {
  const navigate = useNavigate();
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [games, setGames] = useState<GameSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen || games.length) return;

    const loadGames = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const { data } = await api.get<GamesResponse>("/games", {
          params: { page: 1, limit: 100 },
        });

        setGames(data?.items ?? []);
      } catch {
        setGames([]);
        setErrorMessage("Não foi possível carregar os jogos para a busca.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadGames();
  }, [games.length, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!searchBoxRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  };

  const openGame = (gameId: number) => {
    resetSearch();
    setIsOpen(false);
    void navigate(`/loja/${gameId}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedSearch = normalizeSearchText(searchTerm);

    if (!normalizedSearch) return;

    const matchedGame =
      games.find((game) => normalizeSearchText(game.title) === normalizedSearch) ??
      games.find((game) => normalizeSearchText(game.title).includes(normalizedSearch));

    if (!matchedGame) {
      setErrorMessage("Nenhum jogo encontrado para essa pesquisa.");
      return;
    }

    openGame(matchedGame.id);
  };

  return (
    <div ref={searchBoxRef} className="relative">
      <button
        type="button"
        className={iconButtonClass}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-label="Abrir busca"
      >
        <Search className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-[90vw] max-w-80 rounded-2xl border border-slate-800 bg-slate-950/96 p-3 shadow-[0_18px_40px_rgba(2,6,23,0.28)]">
          <form onSubmit={handleSubmit} className="mb-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  if (games.length > 0) {
                    setErrorMessage("");
                  }
                }}
                placeholder="Pesquisar jogos..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-slate-500"
              />

              {searchTerm.trim() && (
                <button
                  type="button"
                  onClick={resetSearch}
                  className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-300 transition hover:text-white"
                  aria-label="Limpar busca"
                  title="Limpar busca"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>

          {isLoading && (
            <p className="px-1 py-2 text-sm text-gray-300">Carregando sugestões...</p>
          )}

          {!isLoading && errorMessage && (
            <p className="px-1 py-2 text-sm text-red-300">{errorMessage}</p>
          )}

          {!isLoading && !errorMessage && (
            <ul className="nexus-scrollbar max-h-60 overflow-y-auto">
              {filteredGames.map((game) => (
                <li key={game.id}>
                  <button
                    type="button"
                    onClick={() => openGame(game.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-slate-900"
                  >
                    <img
                      src={resolveAssetUrl(game.coverImageUrl)}
                      alt={game.title}
                      className="h-9 w-9 rounded object-cover"
                    />
                    <span className="text-sm text-gray-200">{game.title}</span>
                  </button>
                </li>
              ))}

              {filteredGames.length === 0 && (
                <li className="px-2 py-2 text-sm text-gray-400">
                  Nenhum jogo encontrado para essa pesquisa.
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
