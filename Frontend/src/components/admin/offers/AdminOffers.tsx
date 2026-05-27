import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { resolveAssetUrl } from "../../../services/assets";
import {
  getApiErrorMessage,
  type PaginatedResponse,
  type PaginationMeta,
} from "../../../services/http";
import AdminLayout from "../shared/AdminLayout";
import AdminOffersForm from "./AdminOffersForm";
import AdminOffersList from "./AdminOffersList";
import AdminOffersListingPicker from "./AdminOffersListingPicker";
import {
  AdminButton,
  AdminPageState,
  adminBackToPanelClass,
} from "../shared/adminShared";
import {
  buildPlatformOptions,
  createEmptyOfferFormState,
  matchesListingSearch,
  mergeListingIds,
  normalizeDateInput,
} from "./adminOffers.helpers";
import {
  type AdminOfferFormState,
  type AdminOfferItem,
  type AdminOfferListingOption,
} from "../shared/admin.types";

const PROMOTIONS_PAGE_SIZE = 12;
const LISTINGS_PAGE_SIZE = 100;
const emptyMeta: PaginationMeta = {
  page: 1,
  limit: PROMOTIONS_PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

export default function AdminOffers() {
  const [promotions, setPromotions] = useState<AdminOfferItem[]>([]);
  const [promotionsMeta, setPromotionsMeta] =
    useState<PaginationMeta>(emptyMeta);
  const [promotionPage, setPromotionPage] = useState(1);
  const [listingOptions, setListingOptions] = useState<
    AdminOfferListingOption[]
  >([]);
  const [formState, setFormState] = useState<AdminOfferFormState>(
    createEmptyOfferFormState,
  );
  const [selectedListingIds, setSelectedListingIds] = useState<number[]>([]);
  const [initialListingIds, setInitialListingIds] = useState<number[]>([]);
  const [editingPromotionId, setEditingPromotionId] = useState<number | null>(
    null,
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingPromotionId, setDeletingPromotionId] = useState<number | null>(
    null,
  );
  const [isListingPickerOpen, setIsListingPickerOpen] = useState(false);
  const [listingSearchText, setListingSearchText] = useState("");

  const loadData = async (page = promotionPage) => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const [promotionsResponse, listingsResponse] = await Promise.all([
        api.get<PaginatedResponse<AdminOfferItem>>("/promotions", {
          params: { page, limit: PROMOTIONS_PAGE_SIZE },
        }),
        api.get<PaginatedResponse<AdminOfferListingOption>>("/listings", {
          params: { page: 1, limit: LISTINGS_PAGE_SIZE },
        }),
      ]);

      setPromotions(promotionsResponse.data.items ?? []);
      setPromotionsMeta(promotionsResponse.data.meta ?? emptyMeta);
      setListingOptions(listingsResponse.data.items ?? []);
    } catch (error) {
      setPromotions([]);
      setPromotionsMeta(emptyMeta);
      setListingOptions([]);
      setErrorMessage(
        getApiErrorMessage(error, "Não foi possível carregar as ofertas."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData(promotionPage);
  }, [promotionPage]);

  useEffect(() => {
    if (coverFile) {
      const objectUrl = URL.createObjectURL(coverFile);
      setCoverPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setCoverPreviewUrl(resolveAssetUrl(formState.coverImageUrl));
  }, [coverFile, formState.coverImageUrl]);

  useEffect(() => {
    if (bannerFile) {
      const objectUrl = URL.createObjectURL(bannerFile);
      setBannerPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setBannerPreviewUrl(resolveAssetUrl(formState.bannerImageUrl));
  }, [bannerFile, formState.bannerImageUrl]);

  const platformOptions = useMemo(
    () => buildPlatformOptions(listingOptions),
    [listingOptions],
  );
  const filteredListingOptions = useMemo(
    () =>
      listingOptions.filter((listing) =>
        matchesListingSearch(listing, listingSearchText),
      ),
    [listingOptions, listingSearchText],
  );
  const selectedListings = useMemo(
    () =>
      listingOptions.filter((listing) =>
        selectedListingIds.includes(listing.id),
      ),
    [listingOptions, selectedListingIds],
  );

  const setFormField = (
    field: keyof AdminOfferFormState,
    value: string | boolean,
  ) => {
    setFormState((currentState) => ({ ...currentState, [field]: value }));
  };

  const closeListingPicker = () => {
    setIsListingPickerOpen(false);
    setListingSearchText("");
  };

  const resetForm = (clearFeedback = true) => {
    setFormState(createEmptyOfferFormState());
    setCoverFile(null);
    setBannerFile(null);
    setSelectedListingIds([]);
    setInitialListingIds([]);
    setEditingPromotionId(null);
    closeListingPicker();
    if (clearFeedback) {
      setSubmitError("");
      setSubmitMessage("");
    }
  };

  const handleEditPromotion = (promotion: AdminOfferItem) => {
    setEditingPromotionId(promotion.id);
    setInitialListingIds(promotion.listingIds);
    setSelectedListingIds(promotion.listingIds);
    setCoverFile(null);
    setBannerFile(null);
    setSubmitError("");
    setSubmitMessage("");
    closeListingPicker();
    setFormState({
      name: promotion.name || "",
      description: promotion.description || "",
      coverImageUrl: promotion.coverImageUrl || "",
      bannerImageUrl: promotion.bannerImageUrl || "",
      discountPercentage: String(promotion.discountPercentage ?? ""),
      startDate: normalizeDateInput(promotion.startDate),
      endDate: normalizeDateInput(promotion.endDate),
      isActive: Boolean(promotion.isActive),
      platformId: "",
    });
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleAddPlatformListings = () => {
    const platformId = Number(formState.platformId);
    if (!platformId) return;

    const platformListingIds = listingOptions
      .filter((listing) => Number(listing.platform?.id ?? 0) === platformId)
      .map((listing) => listing.id);

    setSelectedListingIds((currentIds) =>
      mergeListingIds(currentIds, platformListingIds),
    );
    setFormField("platformId", "");
  };

  const handleDeletePromotion = async (promotionId: number) => {
    try {
      setDeletingPromotionId(promotionId);
      setSubmitError("");
      setSubmitMessage("");
      await api.delete(`/promotions/${promotionId}`);
      if (editingPromotionId === promotionId) {
        resetForm(false);
      }
      setSubmitMessage("Oferta removida com sucesso.");
      await loadData(promotionPage);
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, "Não foi possível remover a oferta."),
      );
    } finally {
      setDeletingPromotionId(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedListingIds.length === 0) {
      setSubmitError("Selecione pelo menos um listing para a oferta.");
      return;
    }

    const payload = new FormData();
    payload.append("name", formState.name.trim());
    payload.append("description", formState.description.trim());
    payload.append("coverImageUrl", formState.coverImageUrl.trim());
    payload.append("bannerImageUrl", formState.bannerImageUrl.trim());
    payload.append(
      "discountPercentage",
      String(Number(formState.discountPercentage)),
    );
    payload.append("startDate", formState.startDate);
    payload.append("endDate", formState.endDate);
    payload.append("isActive", String(formState.isActive));

    if (coverFile) {
      payload.append("coverFile", coverFile);
    }
    if (bannerFile) {
      payload.append("bannerFile", bannerFile);
    }
    const nextListingIds = Array.from(new Set(selectedListingIds));
    const currentEditingPromotionId = editingPromotionId;

    try {
      setIsSaving(true);
      setSubmitError("");
      setSubmitMessage("");

      if (currentEditingPromotionId !== null) {
        await api.put(`/promotions/${currentEditingPromotionId}`, payload);

        const listingIdsToAdd = nextListingIds.filter(
          (listingId) => !initialListingIds.includes(listingId),
        );
        const listingIdsToRemove = initialListingIds.filter(
          (listingId) => !nextListingIds.includes(listingId),
        );

        await Promise.all([
          ...listingIdsToAdd.map((listingId) =>
            api.post(
              `/promotions/${currentEditingPromotionId}/listings/${listingId}`,
            ),
          ),
          ...listingIdsToRemove.map((listingId) =>
            api.delete(
              `/promotions/${currentEditingPromotionId}/listings/${listingId}`,
            ),
          ),
        ]);

        setSubmitMessage("Oferta atualizada com sucesso.");
      } else {
        const { data } = await api.post<{ id: number }>("/promotions", payload);

        await Promise.all(
          nextListingIds.map((listingId) =>
            api.post(`/promotions/${data.id}/listings/${listingId}`),
          ),
        );

        setSubmitMessage("Oferta criada com sucesso.");
      }

      resetForm(false);
      await loadData(currentEditingPromotionId !== null ? promotionPage : 1);
      if (currentEditingPromotionId === null) {
        setPromotionPage(1);
      }
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, "Não foi possível salvar a oferta."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Ofertas"
      description="Cadastre promoções simples com vários listings e gerencie tudo em um só lugar."
      backTo="/admin"
      backLabel="Voltar ao painel"
      backClassName={adminBackToPanelClass}
      actions={
        editingPromotionId !== null ? (
          <AdminButton
            type="button"
            tone="secondary"
            onClick={() => resetForm()}
          >
            Nova oferta
          </AdminButton>
        ) : undefined
      }
    >
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminOffersForm
          formState={formState}
          platformOptions={platformOptions}
          selectedListingIds={selectedListingIds}
          selectedListings={selectedListings}
          editingPromotionId={editingPromotionId}
          submitError={submitError}
          submitMessage={submitMessage}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onFieldChange={setFormField}
          onAddPlatformListings={handleAddPlatformListings}
          onOpenListingPicker={() => setIsListingPickerOpen(true)}
          onRemoveListing={(listingId) =>
            setSelectedListingIds((currentIds) =>
              currentIds.filter((currentId) => currentId !== listingId),
            )
          }
          coverFile={coverFile}
          coverPreviewUrl={coverPreviewUrl}
          onCoverFileChange={setCoverFile}
          onClearCoverFile={() => setCoverFile(null)}
          bannerFile={bannerFile}
          bannerPreviewUrl={bannerPreviewUrl}
          onBannerFileChange={setBannerFile}
          onClearBannerFile={() => setBannerFile(null)}
          onReset={() => resetForm()}
        />

        <div className="rounded-[28px] border border-slate-800 bg-slate-950/78 p-6">
          <h2 className="text-xl font-semibold text-white">Resumo rápido</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Cada promoção pode ter vários listings. Você pode selecionar jogos
            manualmente ou adicionar todos os listings atuais de uma plataforma.
          </p>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Ofertas carregadas
              </p>
              <p className="mt-2 text-2xl font-semibold text-blue-100">
                {promotionsMeta.total}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Listings disponíveis
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {listingOptions.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Listings selecionados
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {selectedListingIds.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <AdminPageState
        loading={isLoading}
        error={errorMessage}
        isEmpty={promotions.length === 0}
        loadingText="Carregando ofertas..."
        emptyText="Nenhuma oferta cadastrada."
      >
        <AdminOffersList
          promotions={promotions}
          promotionsMeta={promotionsMeta}
          deletingPromotionId={deletingPromotionId}
          onEdit={handleEditPromotion}
          onDelete={(promotionId) => {
            void handleDeletePromotion(promotionId);
          }}
          onPageChange={setPromotionPage}
        />
      </AdminPageState>

      <AdminOffersListingPicker
        open={isListingPickerOpen}
        listingSearchText={listingSearchText}
        filteredListingOptions={filteredListingOptions}
        selectedListingIds={selectedListingIds}
        onClose={closeListingPicker}
        onSearchChange={setListingSearchText}
        onToggleListing={(listingId) =>
          setSelectedListingIds((currentIds) =>
            currentIds.includes(listingId)
              ? currentIds.filter((currentId) => currentId !== listingId)
              : [...currentIds, listingId],
          )
        }
      />
    </AdminLayout>
  );
}
