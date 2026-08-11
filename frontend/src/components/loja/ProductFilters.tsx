import { FilterIcon, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import type { GamesResponse, ListingsResponse } from "./store.types";
import {
  type FilterOption,
  collectFilterOptions,
  normalizeText,
  toggleNormalizedValue,
  updateSearchListParam,
} from "./store.utils";

type FilterKey = "platform" | "category";

function ProductFilters() {
  const [menuAbertoMobile, setMenuAbertoMobile] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [platforms, setPlatforms] = useState<FilterOption[]>([]);
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedPlatforms = useMemo(
    () => searchParams.getAll("platform").map((value) => value.trim()).filter(Boolean),
    [searchParams],
  );
  const selectedCategories = useMemo(
    () => searchParams.getAll("category").map((value) => value.trim()).filter(Boolean),
    [searchParams],
  );
  const activeFilterCount = selectedPlatforms.length + selectedCategories.length;
  const activeFilters = useMemo(
    () => [
      ...selectedPlatforms.map((label) => ({
        key: "platform" as const,
        label,
        group: "Plataforma",
      })),
      ...selectedCategories.map((label) => ({
        key: "category" as const,
        label,
        group: "Categoria",
      })),
    ],
    [selectedCategories, selectedPlatforms],
  );

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateSelection = (key: FilterKey, values: string[]) => {
    setSearchParams(updateSearchListParam(searchParams, key, values));
    if (!menuAbertoMobile) {
      scrollTop();
    }
  };

  const clearFilters = () => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("platform");
    nextSearchParams.delete("category");
    setSearchParams(nextSearchParams);

    if (!menuAbertoMobile) {
      scrollTop();
    }
  };

  const removeActiveFilter = (key: FilterKey, label: string) => {
    const selectedValues = key === "platform" ? selectedPlatforms : selectedCategories;
    updateSelection(
      key,
      selectedValues.filter((value) => normalizeText(value) !== normalizeText(label)),
    );
  };

  const applyMobileFilters = () => {
    setMenuAbertoMobile(false);
    scrollTop();
  };

  const renderSection = (
    title: string,
    options: FilterOption[],
    selectedValues: string[],
    key: FilterKey,
  ) => {
    const selectedSet = new Set(selectedValues.map(normalizeText));

    return (
      <fieldset className="border-t border-slate-800/80 py-5 first:border-t-0 first:pt-0">
        <legend className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-200">
          {title}
        </legend>
        {selectedValues.length > 0 && (
          <button
            type="button"
            onClick={() => updateSelection(key, [])}
            className="mb-3 text-xs font-semibold text-blue-200 transition hover:text-white"
          >
            Limpar {title.toLowerCase()}
          </button>
        )}

        <ul className="space-y-2">
          {options.map((option) => (
            <li key={option.label}>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition focus-within:ring-2 focus-within:ring-blue-400/60 ${
                  selectedSet.has(normalizeText(option.label))
                    ? "border-blue-400/60 bg-blue-500/15 text-blue-100"
                    : "border-slate-800 bg-slate-950/55 text-slate-300 hover:border-slate-600 hover:text-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSet.has(normalizeText(option.label))}
                  onChange={() =>
                    updateSelection(
                      key,
                      toggleNormalizedValue(selectedValues, option.label),
                    )
                  }
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    selectedSet.has(normalizeText(option.label))
                      ? "border-blue-300 bg-blue-500"
                      : "border-slate-600 bg-slate-950"
                  }`}
                >
                  {selectedSet.has(normalizeText(option.label)) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                <span className="rounded-full border border-slate-700 bg-black/25 px-2 py-0.5 text-xs text-slate-300">
                  {option.count}
                </span>
              </label>
            </li>
          ))}

          {options.length === 0 && !loading && (
            <li className="rounded-2xl border border-slate-800 bg-slate-950/50 px-3 py-2.5 text-sm text-slate-400">
              Nenhuma opção disponível.
            </li>
          )}
        </ul>
      </fieldset>
    );
  };

  useEffect(() => {
    const loadFilters = async () => {
      try {
        setLoading(true);

        const [{ data: gamesData }, { data: listingsData }] = await Promise.all([
          api.get<GamesResponse>("/games", { params: { page: 1, limit: 60 } }),
          api.get<ListingsResponse>("/listings", { params: { page: 1, limit: 200 } }),
        ]);

        const options = collectFilterOptions(
          gamesData.items ?? [],
          listingsData.items ?? [],
        );

        setCategories(options.categories);
        setPlatforms(options.platforms);
      } catch {
        setCategories([]);
        setPlatforms([]);
      } finally {
        setLoading(false);
      }
    };

    void loadFilters();
  }, []);

  return (
    <aside className="w-full lg:w-64 lg:shrink-10 lg:self-start lg:sticky lg:top-24">
      <button
        type="button"
        onClick={() => setMenuAbertoMobile((current) => !current)}
        className="mb-3 flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-left font-semibold text-gray-100 lg:hidden"
        aria-expanded={menuAbertoMobile}
        aria-controls="filtro-categorias"
      >
        <span>{menuAbertoMobile ? "Fechar filtros" : "Abrir filtros"}</span>
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      <nav
        id="filtro-categorias"
        className={`nexus-card nexus-scrollbar max-h-[calc(100vh-7rem)] overflow-y-auto p-5 text-gray-300 ${
          menuAbertoMobile ? "block" : "hidden"
        } lg:block`}
        aria-label="Filtros da loja"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
            <FilterIcon className="h-5 w-5" />
            Filtros
          </h2>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-slate-300 transition hover:text-white"
            >
              Limpar tudo
            </button>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="mb-5 rounded-2xl border border-blue-500/25 bg-blue-500/10 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
              Filtros ativos
            </p>
            <div className="flex flex-wrap gap-2" aria-live="polite">
              {activeFilters.map((filter) => (
                <button
                  key={`${filter.key}-${filter.label}`}
                  type="button"
                  onClick={() => removeActiveFilter(filter.key, filter.label)}
                  className="inline-flex max-w-full items-center gap-1 rounded-full border border-blue-400/35 bg-slate-950/70 px-3 py-1 text-xs text-blue-100 transition hover:border-blue-200 hover:text-white"
                  title={`Remover ${filter.group}: ${filter.label}`}
                >
                  <span className="truncate">{filter.label}</span>
                  <X className="h-3 w-3 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && <p className="px-4 text-sm text-slate-400">Carregando...</p>}

        {renderSection("Plataformas", platforms, selectedPlatforms, "platform")}
        {renderSection("Categorias", categories, selectedCategories, "category")}

        <button
          type="button"
          onClick={applyMobileFilters}
          className="sticky bottom-0 mt-4 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:bg-blue-700 lg:hidden"
        >
          Ver resultados
        </button>
      </nav>
    </aside>
  );
}

export default ProductFilters;
