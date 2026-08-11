import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationProps } from "./globals.types";

type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

function getPaginationItems(page: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PaginationItem[] = [1];

  if (page > 4) {
    items.push("ellipsis-start");
  }

  const firstVisiblePage = Math.max(2, page - 1);
  const lastVisiblePage = Math.min(totalPages - 1, page + 1);

  for (let currentPage = firstVisiblePage; currentPage <= lastVisiblePage; currentPage += 1) {
    items.push(currentPage);
  }

  if (page < totalPages - 3) {
    items.push("ellipsis-end");
  }

  items.push(totalPages);
  return items;
}

export default function Pagination({
  page,
  totalPages,
  scrollToTop = true,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const handleChange = (nextPage: number) => {
    onPageChange(nextPage);
    if (scrollToTop) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  const paginationItems = getPaginationItems(page, totalPages);

  return (
    <nav className="mt-5 flex max-w-full justify-center overflow-x-auto px-1" aria-label="Paginação do catálogo">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => handleChange(page - 1)}
          disabled={page === 1}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/85 px-3 text-slate-200 transition hover:border-blue-400/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        {paginationItems.map((item) => {
          if (typeof item !== "number") {
            return (
              <span key={item} className="px-1 text-slate-500" aria-hidden="true">
                …
              </span>
            );
          }

          const isCurrentPage = item === page;

          return (
            <button
              key={item}
              type="button"
              onClick={() => handleChange(item)}
              aria-current={isCurrentPage ? "page" : undefined}
              aria-label={`Ir para a página ${item}`}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                isCurrentPage
                  ? "border-blue-400/70 bg-blue-500/20 text-white"
                  : "border-slate-700 bg-slate-950/85 text-slate-200 hover:border-blue-400/60 hover:text-white"
              }`}
            >
              {item}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => handleChange(page + 1)}
          disabled={page === totalPages}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/85 px-3 text-slate-200 transition hover:border-blue-400/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          aria-label="Próxima página"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
