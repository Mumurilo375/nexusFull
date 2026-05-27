import Pagination from "../../globals/Pagination";
import { AdminButton } from "../shared/adminShared";
import { buildListingLabel, formatDateToPtBr } from "./adminOffers.helpers";
import type { AdminOfferItem } from "../shared/admin.types";
import type { PaginationMeta } from "../../../services/http";
import { resolveAssetUrl } from "../../../services/assets";

export default function AdminOffersList({
  promotions,
  promotionsMeta,
  deletingPromotionId,
  onEdit,
  onDelete,
  onPageChange,
}: {
  promotions: AdminOfferItem[];
  promotionsMeta: PaginationMeta;
  deletingPromotionId: number | null;
  onEdit: (promotion: AdminOfferItem) => void;
  onDelete: (promotionId: number) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <section className="space-y-4">
      {promotions.map((promotion) => (
        <article
          key={promotion.id}
          className="rounded-3xl border border-slate-800 bg-slate-950/82 p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <img
              src={resolveAssetUrl(promotion.coverImageUrl)}
              alt={promotion.name}
              className="h-28 w-full rounded-2xl border border-slate-800 object-cover lg:w-48"
            />

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-white">{promotion.name}</h2>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  -{promotion.discountPercentage}%
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                  {promotion.isActive ? "Ativa" : "Inativa"}
                </span>
              </div>

              <p className="text-sm text-slate-300">
                {promotion.description || "Sem descrição."}
              </p>

              <p className="text-xs text-slate-400">
                Banner: {promotion.bannerImageUrl ? "configurado" : "não configurado"}
              </p>

              <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                <span>De {formatDateToPtBr(promotion.startDate)}</span>
                <span>até {formatDateToPtBr(promotion.endDate)}</span>
                <span>{promotion.listings.length} listing(s) vinculados</span>
              </div>

              {promotion.listings.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {promotion.listings.slice(0, 5).map((listing) => (
                    <span
                      key={listing.id}
                      className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300"
                    >
                      {buildListingLabel(listing)}
                    </span>
                  ))}
                  {promotion.listings.length > 5 && (
                    <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
                      +{promotion.listings.length - 5} listing(s)
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Nenhum listing vinculado.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <AdminButton type="button" tone="secondary" onClick={() => onEdit(promotion)}>
                Editar
              </AdminButton>
              <AdminButton
                type="button"
                tone="subtleDanger"
                disabled={deletingPromotionId === promotion.id}
                onClick={() => onDelete(promotion.id)}
              >
                {deletingPromotionId === promotion.id ? "Removendo..." : "Excluir"}
              </AdminButton>
            </div>
          </div>
        </article>
      ))}

      <Pagination
        page={promotionsMeta.page}
        totalPages={promotionsMeta.totalPages}
        onPageChange={onPageChange}
      />
    </section>
  );
}

