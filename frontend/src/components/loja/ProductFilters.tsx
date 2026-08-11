import { Check, FilterIcon, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { loadCatalogData } from "./catalogData";
import {
  type FilterOption,
  collectFilterOptions,
  normalizeText,
  toggleNormalizedValue,
  updateSearchListParam,
} from "./store.utils";

type FilterKey = "platform" | "category";

function ProductFilters() {
  const [mobileSheetIsOpen, setMobileSheetIsOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [platforms, setPlatforms] = useState<FilterOption[]>([]);
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const sheetRef = useRef<HTMLElement | null>(null);
  const closeSheetButtonRef = useRef<HTMLButtonElement | null>(null);

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

  const scrollToResults = () => {
    document.getElementById("catalog-results")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  const updateSelection = (key: FilterKey, values: string[]) => {
    setSearchParams(updateSearchListParam(searchParams, key, values));
    if (!mobileSheetIsOpen) {
      window.requestAnimationFrame(scrollToResults);
    }
  };

  const clearFilters = () => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("platform");
    nextSearchParams.delete("category");
    setSearchParams(nextSearchParams);

    if (!mobileSheetIsOpen) {
      window.requestAnimationFrame(scrollToResults);
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
    setMobileSheetIsOpen(false);
    window.requestAnimationFrame(scrollToResults);
  };

  const renderSection = (
    title: string,
    options: FilterOption[],
    selectedValues: string[],
    key: FilterKey,
  ) => {
    const selectedSet = new Set(selectedValues.map(normalizeText));

    return (
      <fieldset className="border-t border-slate-800 py-5 first:border-t-0 first:pt-0">
        <div className="mb-3 flex items-center justify-between gap-3">
          <legend className="text-sm font-bold text-slate-100">{title}</legend>
          {selectedValues.length > 0 && (
            <button
              type="button"
              onClick={() => updateSelection(key, [])}
              className="min-h-10 rounded-lg px-2 text-xs font-semibold text-blue-200 transition hover:bg-slate-900 hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>

        <ul className="space-y-2">
          {options.map((option) => {
            const isSelected = selectedSet.has(normalizeText(option.label));

            return (
              <li key={option.label}>
                <label
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition focus-within:ring-2 focus-within:ring-blue-400/60 ${
                    isSelected
                      ? "border-blue-400/60 bg-blue-500/15 text-blue-100"
                      : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
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
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      isSelected
                        ? "border-blue-300 bg-blue-600"
                        : "border-slate-600 bg-slate-950"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  <span className="text-xs tabular-nums text-slate-500">{option.count}</span>
                </label>
              </li>
            );
          })}

          {options.length === 0 && !loading && (
            <li className="px-1 py-2 text-sm text-slate-400">
              Nenhuma opção disponível.
            </li>
          )}
        </ul>
      </fieldset>
    );
  };

  const renderActiveFilters = () => {
    if (activeFilters.length === 0) return null;

    return (
      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold text-slate-400">Filtros ativos</p>
        <div className="flex flex-wrap gap-2" aria-live="polite">
          {activeFilters.map((filter) => (
            <button
              key={`${filter.key}-${filter.label}`}
              type="button"
              onClick={() => removeActiveFilter(filter.key, filter.label)}
              className="inline-flex min-h-10 max-w-full items-center gap-1.5 rounded-xl border border-blue-400/35 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-100 transition hover:border-blue-200 hover:text-white"
              title={`Remover ${filter.group}: ${filter.label}`}
            >
              <span className="truncate">{filter.label}</span>
              <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderFilterBody = (isMobile: boolean) => (
    <>
      <div className={`${isMobile ? "sticky top-0 z-10 bg-slate-950 pb-4" : "mb-5"} flex items-center justify-between gap-3`}>
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <FilterIcon className="h-5 w-5" aria-hidden="true" />
          Filtrar jogos
        </h2>

        <div className="flex items-center gap-1">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-10 rounded-lg px-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Limpar tudo
            </button>
          )}
          {isMobile && (
            <button
              ref={closeSheetButtonRef}
              type="button"
              onClick={() => setMobileSheetIsOpen(false)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-700 text-slate-200 transition hover:bg-slate-900 hover:text-white"
              aria-label="Fechar filtros"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {renderActiveFilters()}

      {loading && (
        <p className="py-4 text-sm text-slate-400" role="status">
          Carregando filtros...
        </p>
      )}

      {loadError && !loading && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm text-amber-100" role="alert">
          <p>Não foi possível carregar os filtros.</p>
          <button
            type="button"
            onClick={() => setLoadAttempt((current) => current + 1)}
            className="mt-2 min-h-10 rounded-lg px-2 font-semibold underline underline-offset-4 hover:text-white"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {renderSection("Plataformas", platforms, selectedPlatforms, "platform")}
      {renderSection("Categorias", categories, selectedCategories, "category")}

      {isMobile && (
        <div className="sticky bottom-0 -mx-5 border-t border-slate-800 bg-slate-950 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={applyMobileFilters}
            className="min-h-12 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          >
            Ver {activeFilterCount > 0 ? "resultados filtrados" : "todos os jogos"}
          </button>
        </div>
      )}
    </>
  );

  useEffect(() => {
    const loadFilters = async () => {
      try {
        setLoading(true);
        setLoadError(false);
        const { games, listings } = await loadCatalogData();
        const options = collectFilterOptions(games, listings);

        setCategories(options.categories);
        setPlatforms(options.platforms);
      } catch {
        setCategories([]);
        setPlatforms([]);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    void loadFilters();
  }, [loadAttempt]);

  useEffect(() => {
    if (!mobileSheetIsOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => closeSheetButtonRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileSheetIsOpen(false);
        return;
      }

      if (event.key !== "Tab" || !sheetRef.current) return;

      const focusableElements = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileSheetIsOpen]);

  return (
    <aside className="w-full lg:sticky lg:top-24 lg:w-64 lg:shrink-0 lg:self-start">
      <button
        type="button"
        onClick={() => setMobileSheetIsOpen(true)}
        className="flex min-h-12 w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-left font-semibold text-white transition hover:border-slate-500 lg:hidden"
        aria-expanded={mobileSheetIsOpen}
        aria-controls="filtros-mobile"
      >
        <span className="flex items-center gap-2">
          <FilterIcon className="h-5 w-5 text-blue-300" aria-hidden="true" />
          Filtrar jogos
        </span>
        {activeFilterCount > 0 && (
          <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {activeFilters.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {activeFilters.map((filter) => (
            <button
              key={`mobile-${filter.key}-${filter.label}`}
              type="button"
              onClick={() => removeActiveFilter(filter.key, filter.label)}
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-blue-400/35 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-100"
            >
              {filter.label}
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      <div className="nexus-subtle-panel nexus-scrollbar hidden max-h-[calc(100vh-7rem)] overflow-y-auto p-5 lg:block">
        {renderFilterBody(false)}
      </div>

      {mobileSheetIsOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileSheetIsOpen(false)}
            aria-label="Fechar filtros"
          />
          <section
            ref={sheetRef}
            id="filtros-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Filtros da loja"
            className="nexus-scrollbar absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-3xl border-t border-slate-700 bg-slate-950 px-5 pt-5 shadow-[0_-18px_48px_rgba(2,6,23,0.45)]"
          >
            {renderFilterBody(true)}
          </section>
        </div>
      )}
    </aside>
  );
}

export default ProductFilters;
