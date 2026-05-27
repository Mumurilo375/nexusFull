import { AdminButton } from "../shared/adminShared";
import { buildListingLabel } from "./adminOffers.helpers";
import type { AdminOfferListingOption } from "../shared/admin.types";

export default function AdminOffersListingPicker({
  open,
  listingSearchText,
  filteredListingOptions,
  selectedListingIds,
  onClose,
  onSearchChange,
  onToggleListing,
}: {
  open: boolean;
  listingSearchText: string;
  filteredListingOptions: AdminOfferListingOption[];
  selectedListingIds: number[];
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onToggleListing: (listingId: number) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 px-4 py-6">
      <div className="flex max-h-[75vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 shadow-[0_30px_80px_rgba(2,6,23,0.6)]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Escolher jogos</h2>
            <p className="mt-1 text-sm text-slate-400">
              Busque pelo nome do jogo ou pela plataforma.
            </p>
          </div>

          <AdminButton type="button" tone="secondary" onClick={onClose}>
            Fechar
          </AdminButton>
        </div>

        <div className="overflow-y-auto p-5">
          <label className="text-sm text-slate-200">
            Buscar jogos
            <input
              value={listingSearchText}
              onChange={(event) => onSearchChange(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500/70"
              placeholder="Ex.: Hollow Knight, Steam"
            />
          </label>

          {filteredListingOptions.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/45 p-4 text-sm text-slate-300">
              Nenhum jogo encontrado para essa busca.
            </p>
          ) : (
            <div className="mt-4 max-h-[45vh] overflow-y-auto pr-1">
              <div className="flex flex-wrap gap-3">
                {filteredListingOptions.map((listing) => {
                  const selected = selectedListingIds.includes(listing.id);

                  return (
                    <button
                      key={listing.id}
                      type="button"
                      onClick={() => onToggleListing(listing.id)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        selected
                          ? "border-blue-400/50 bg-blue-500/15 text-blue-100"
                          : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white"
                      }`}
                    >
                      {buildListingLabel(listing)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

