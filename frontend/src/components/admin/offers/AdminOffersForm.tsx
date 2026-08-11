import {
  AdminButton,
  AdminNotice,
  AdminSelectField,
  AdminTextareaField,
  AdminTextField,
  AdminToggleField,
} from "../shared/adminShared";
import { resolveAssetUrl } from "../../../services/assets";
import {
  getListingPlatformName,
  getListingTitle,
  normalizeDiscountInput,
} from "./adminOffers.helpers";
import type {
  AdminOfferFormState,
  AdminOfferListingOption,
} from "../shared/admin.types";

export default function AdminOffersForm({
  formState,
  platformOptions,
  selectedListingIds,
  selectedListings,
  editingPromotionId,
  submitError,
  submitMessage,
  isSaving,
  onSubmit,
  onFieldChange,
  onAddPlatformListings,
  onOpenListingPicker,
  onRemoveListing,
  coverFile,
  coverPreviewUrl,
  onCoverFileChange,
  onClearCoverFile,
  bannerFile,
  bannerPreviewUrl,
  onBannerFileChange,
  onClearBannerFile,
  onReset,
}: {
  formState: AdminOfferFormState;
  platformOptions: Array<{ id: number; name: string }>;
  selectedListingIds: number[];
  selectedListings: AdminOfferListingOption[];
  editingPromotionId: number | null;
  submitError: string;
  submitMessage: string;
  isSaving: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onFieldChange: (field: keyof AdminOfferFormState, value: string | boolean) => void;
  onAddPlatformListings: () => void;
  onOpenListingPicker: () => void;
  onRemoveListing: (listingId: number) => void;
  coverFile: File | null;
  coverPreviewUrl: string;
  onCoverFileChange: (file: File | null) => void;
  onClearCoverFile: () => void;
  bannerFile: File | null;
  bannerPreviewUrl: string;
  onBannerFileChange: (file: File | null) => void;
  onClearBannerFile: () => void;
  onReset: () => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[28px] border border-slate-800 bg-slate-950/78 p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <AdminTextField
            label="Nome da oferta"
            value={formState.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
            required
          />
        </div>

        <div className="md:col-span-2">
          <AdminTextareaField
            label="Descrição"
            value={formState.description}
            onChange={(event) => onFieldChange("description", event.target.value)}
            className="min-h-28"
          />
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 md:col-span-2">
          <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <img
              src={resolveAssetUrl(coverPreviewUrl)}
              alt="Preview da capa da oferta"
              className="h-36 w-full rounded-2xl border border-slate-800 object-cover"
            />

            <div className="space-y-3">
              <p className="text-sm font-medium text-white">Capa principal da oferta</p>
              <p className="text-xs text-slate-400">
                Enviar imagem ou usar URL. O arquivo enviado tem prioridade.
              </p>

              <label className="inline-flex cursor-pointer rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white">
                Enviar imagem
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={({ target }) => onCoverFileChange(target.files?.[0] ?? null)}
                />
              </label>

              {coverFile && (
                <div>
                  <AdminButton type="button" tone="secondary" onClick={onClearCoverFile}>
                    Remover arquivo enviado
                  </AdminButton>
                </div>
              )}

              <AdminTextField
                label="URL da capa"
                type="text"
                value={formState.coverImageUrl}
                onChange={(event) => onFieldChange("coverImageUrl", event.target.value)}
                note="Use URL quando não quiser enviar arquivo agora."
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 md:col-span-2">
          <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <img
              src={resolveAssetUrl(bannerPreviewUrl)}
              alt="Preview do banner da oferta"
              className="h-36 w-full rounded-2xl border border-slate-800 object-cover"
            />

            <div className="space-y-3">
              <p className="text-sm font-medium text-white">Banner da página da oferta</p>
              <p className="text-xs text-slate-400">
                Esta imagem será usada na página /ofertas/ID.
              </p>

              <label className="inline-flex cursor-pointer rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white">
                Enviar banner
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={({ target }) => onBannerFileChange(target.files?.[0] ?? null)}
                />
              </label>

              {bannerFile && (
                <div>
                  <AdminButton type="button" tone="secondary" onClick={onClearBannerFile}>
                    Remover banner enviado
                  </AdminButton>
                </div>
              )}

              <AdminTextField
                label="URL do banner"
                type="text"
                value={formState.bannerImageUrl}
                onChange={(event) => onFieldChange("bannerImageUrl", event.target.value)}
                note="Use URL quando não quiser enviar arquivo agora."
              />
            </div>
          </div>
        </section>

        <AdminTextField
          label="Desconto (%)"
          type="number"
          min="1"
          max="100"
          value={formState.discountPercentage}
          onChange={(event) =>
            onFieldChange("discountPercentage", normalizeDiscountInput(event.target.value))
          }
          className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          required
        />

        <div className="self-end">
          <AdminToggleField
            label="Oferta ativa"
            checked={formState.isActive}
            onChange={(isActive) => onFieldChange("isActive", isActive)}
          />
        </div>

        <AdminTextField
          label="Data inicial"
          type="date"
          value={formState.startDate}
          onChange={(event) => onFieldChange("startDate", event.target.value)}
          required
        />

        <AdminTextField
          label="Data final"
          type="date"
          value={formState.endDate}
          onChange={(event) => onFieldChange("endDate", event.target.value)}
          required
        />

        <AdminSelectField
          label="Plataforma"
          value={formState.platformId}
          onChange={(event) => onFieldChange("platformId", event.target.value)}
        >
          <option value="">Selecione uma plataforma</option>
          {platformOptions.map((platform) => (
            <option key={platform.id} value={platform.id}>
              {platform.name}
            </option>
          ))}
        </AdminSelectField>

        <div className="self-end">
          <AdminButton type="button" tone="secondary" onClick={onAddPlatformListings}>
            Adicionar plataforma
          </AdminButton>
        </div>

        <section className="rounded-[28px] border border-slate-800 bg-slate-950/82 p-5 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Listings da oferta</h2>
              <p className="mt-1 text-sm text-slate-400">
                {selectedListingIds.length === 0
                  ? "Nenhum listing selecionado."
                  : `${selectedListingIds.length} listing(s) selecionado(s).`}
              </p>
            </div>

            <AdminButton type="button" tone="secondary" onClick={onOpenListingPicker}>
              Escolher jogos
            </AdminButton>
          </div>
        </section>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-white">Listings selecionados</p>
            <p className="text-sm text-slate-400">{selectedListingIds.length}</p>
          </div>

          {selectedListings.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Nenhum listing selecionado.</p>
          ) : (
            <div className="nexus-scrollbar mt-3 max-h-56 space-y-2 overflow-y-auto pr-2">
              {selectedListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {getListingTitle(listing)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {getListingPlatformName(listing)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveListing(listing.id)}
                    className="shrink-0 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-200 transition hover:bg-rose-500/15"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {submitError && <AdminNotice>{submitError}</AdminNotice>}
      {submitMessage && <AdminNotice tone="success">{submitMessage}</AdminNotice>}

      <div className="mt-5 flex flex-wrap gap-3">
        <AdminButton type="submit" disabled={isSaving}>
          {isSaving
            ? "Salvando..."
            : editingPromotionId !== null
              ? "Salvar alterações"
              : "Criar oferta"}
        </AdminButton>
        <AdminButton type="button" tone="secondary" onClick={onReset}>
          Limpar formulário
        </AdminButton>
      </div>
    </form>
  );
}

