import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/src/components/ui/Typography";
import api from "../../../services/api";
import { getApiErrorMessage } from "../../../services/http";
import AdminOffersForm from "./AdminOffersForm";
import AdminOffersList from "./AdminOffersList";
import AdminOffersListingPicker from "./AdminOffersListingPicker";
import AdminLayout, {
  AdminButton,
  AdminConfirmModal,
  AdminPageState,
  adminColors,
  adminStyles,
  createEmptyMeta,
} from "../shared/adminShared";
import type {
  AdminOfferFormState,
  AdminOfferItem,
  AdminOfferListingOption,
  PaginatedResponse,
  UploadFile,
} from "../shared/admin.types";
import {
  buildPlatformOptions,
  createEmptyOfferFormState,
  matchesListingSearch,
  mergeListingIds,
  normalizeDateInput,
} from "./adminOffers.helpers";

const PROMOTIONS_PAGE_SIZE = 12;
type ViewMode = "list" | "form";

export default function AdminOffers() {
  const [items, setItems] = useState<AdminOfferItem[]>([]);
  const [meta, setMeta] = useState(createEmptyMeta(PROMOTIONS_PAGE_SIZE));
  const [page, setPage] = useState(1);
  const [listings, setListings] = useState<AdminOfferListingOption[]>([]);
  const [state, setState] = useState<AdminOfferFormState>(createEmptyOfferFormState());
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [initialIds, setInitialIds] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [coverFile, setCoverFile] = useState<UploadFile | null>(null);
  const [bannerFile, setBannerFile] = useState<UploadFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [mode, setMode] = useState<ViewMode>("list");

  const platformOptions = useMemo(() => buildPlatformOptions(listings), [listings]);
  const filteredListings = useMemo(
    () => listings.filter((item) => matchesListingSearch(item, pickerSearch)),
    [listings, pickerSearch],
  );
  const selectedListings = useMemo(
    () => listings.filter((item) => selectedIds.includes(item.id)),
    [listings, selectedIds],
  );
  const activeCount = useMemo(() => items.filter((item) => item.isActive).length, [items]);

  const load = useCallback(
    async (targetPage = page) => {
      try {
        setLoading(true);
        setError("");
        const [promotionData, listingData] = await Promise.all([
          api.get<PaginatedResponse<AdminOfferItem>>(
            `/promotions?page=${targetPage}&limit=${PROMOTIONS_PAGE_SIZE}`,
          ),
          api.get<PaginatedResponse<AdminOfferListingOption>>("/listings?page=1&limit=100"),
        ]);
        setItems(promotionData.items ?? []);
        setMeta(promotionData.meta ?? createEmptyMeta(PROMOTIONS_PAGE_SIZE));
        setListings(listingData.items ?? []);
      } catch (requestError) {
        setItems([]);
        setListings([]);
        setError(getApiErrorMessage(requestError, "Não foi possível carregar as ofertas."));
      } finally {
        setLoading(false);
      }
    },
    [page],
  );

  useEffect(() => {
    void Promise.resolve().then(() => load(page));
  }, [load, page]);

  const setField = (field: keyof AdminOfferFormState, value: string | boolean) => {
    setState((current) => ({ ...current, [field]: value }));
  };

  const reset = (clearFeedback = true) => {
    setState(createEmptyOfferFormState());
    setSelectedIds([]);
    setInitialIds([]);
    setEditingId(null);
    setCoverFile(null);
    setBannerFile(null);
    setSubmitError("");
    if (clearFeedback) setMessage("");
  };

  const startCreate = () => {
    reset();
    setMode("form");
  };

  const edit = (item: AdminOfferItem) => {
    setEditingId(item.id);
    setInitialIds(item.listingIds);
    setSelectedIds(item.listingIds);
    setState({
      name: item.name ?? "",
      description: item.description ?? "",
      coverImageUrl: item.coverImageUrl ?? "",
      bannerImageUrl: item.bannerImageUrl ?? "",
      discountPercentage: String(item.discountPercentage ?? ""),
      startDate: normalizeDateInput(item.startDate),
      endDate: normalizeDateInput(item.endDate),
      isActive: Boolean(item.isActive),
      platformId: "",
    });
    setSubmitError("");
    setMessage("");
    setMode("form");
  };

  const cancelForm = () => {
    reset();
    setMode("list");
  };

  const addPlatform = () => {
    const platformId = Number(state.platformId);
    if (!platformId) return;
    setSelectedIds((current) =>
      mergeListingIds(
        current,
        listings
          .filter((item) => Number(item.platform?.id ?? 0) === platformId)
          .map((item) => item.id),
      ),
    );
    setField("platformId", "");
  };

  const submit = async () => {
    if (!state.name.trim() || !state.discountPercentage || !state.startDate || !state.endDate) {
      setSubmitError("Preencha nome, desconto e período da oferta.");
      return;
    }
    if (selectedIds.length === 0) {
      setSubmitError("Selecione pelo menos uma oferta para a promoção.");
      return;
    }

    try {
      setSaving(true);
      setSubmitError("");
      setMessage("");
      const payload = new FormData();
      payload.append("name", state.name.trim());
      payload.append("description", state.description.trim());
      payload.append("coverImageUrl", state.coverImageUrl.trim());
      payload.append("bannerImageUrl", state.bannerImageUrl.trim());
      payload.append("discountPercentage", String(Number(state.discountPercentage)));
      payload.append("startDate", state.startDate);
      payload.append("endDate", state.endDate);
      payload.append("isActive", String(state.isActive));

      if (coverFile) {
        payload.append(
          "coverFile",
          coverFile.file ??
            ({ uri: coverFile.uri, type: coverFile.type, name: coverFile.name } as unknown as Blob),
        );
      }
      if (bannerFile) {
        payload.append(
          "bannerFile",
          bannerFile.file ??
            ({ uri: bannerFile.uri, type: bannerFile.type, name: bannerFile.name } as unknown as Blob),
        );
      }

      const nextIds = Array.from(new Set(selectedIds));
      let promotionId = editingId;
      if (promotionId) {
        await api.put(`/promotions/${promotionId}`, payload);
      } else {
        const created = await api.post<{ id: number }>("/promotions", payload);
        promotionId = created.id;
      }

      if (promotionId) {
        const toAdd = nextIds.filter((id) => !initialIds.includes(id));
        const toRemove = initialIds.filter((id) => !nextIds.includes(id));
        await Promise.all([
          ...toAdd.map((id) => api.post(`/promotions/${promotionId}/listings/${id}`)),
          ...toRemove.map((id) => api.delete(`/promotions/${promotionId}/listings/${id}`)),
        ]);
      }

      const feedback = editingId ? "Oferta atualizada com sucesso." : "Oferta criada com sucesso.";
      const wasEditing = editingId !== null;
      reset(false);
      setMessage(feedback);
      setMode("list");
      await load(wasEditing ? page : 1);
      if (!wasEditing) setPage(1);
    } catch (requestError) {
      setSubmitError(getApiErrorMessage(requestError, "Não foi possível salvar a oferta."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    try {
      setDeletingId(pendingDelete);
      await api.delete(`/promotions/${pendingDelete}`);
      setPendingDelete(null);
      if (items.length === 1 && page > 1) setPage((current) => current - 1);
      else await load(page);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Não foi possível remover a oferta."));
      setPendingDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  if (mode === "form") {
    return (
      <AdminLayout
        title={editingId !== null ? "Editar oferta" : "Nova oferta"}
        description={
          editingId !== null
            ? "Atualize a campanha, o período e os jogos vinculados."
            : "Monte uma campanha e publique o desconto nos jogos escolhidos."
        }
        backTo="/admin/ofertas"
        actions={<AdminButton tone="secondary" onPress={cancelForm}>Cancelar</AdminButton>}
      >
        <AdminOffersForm
          state={state}
          platformOptions={platformOptions}
          selectedListings={selectedListings}
          editing={editingId !== null}
          error={submitError}
          message=""
          saving={saving}
          onField={setField}
          onSubmit={() => void submit()}
          onReset={reset}
          onAddPlatform={addPlatform}
          onPickListings={() => setPickerOpen(true)}
          onRemoveListing={(id) => setSelectedIds((current) => current.filter((item) => item !== id))}
          coverFile={coverFile}
          bannerFile={bannerFile}
          onCover={setCoverFile}
          onBanner={setBannerFile}
        />
        <AdminOffersListingPicker
          visible={pickerOpen}
          search={pickerSearch}
          options={filteredListings}
          selectedIds={selectedIds}
          onClose={() => {
            setPickerOpen(false);
            setPickerSearch("");
          }}
          onSearch={setPickerSearch}
          onToggle={(id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Ofertas"
      description="Crie campanhas, aplique descontos e mantenha os vínculos do catálogo sob controle."
      backTo="/admin"
      actions={
        <AdminButton onPress={startCreate}>
          <View style={styles.buttonContent}>
            <Ionicons name="add" size={18} color={adminColors.white} />
            <Text style={styles.buttonText}>Nova oferta</Text>
          </View>
        </AdminButton>
      }
    >
      {message ? (
        <View style={styles.successSummary}>
          <Ionicons name="checkmark-circle" size={18} color="#6ee7b7" />
          <Text style={styles.successText}>{message}</Text>
        </View>
      ) : null}

      <View style={styles.summaryRow}>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>Campanhas cadastradas</Text>
          <Text style={adminStyles.muted}>{meta.total} no total · {activeCount} ativa(s) nesta página</Text>
        </View>
        <AdminButton tone="secondary" onPress={() => router.push("/admin/games" as never)}>Ver catálogo</AdminButton>
      </View>

      <AdminPageState loading={loading} error={error} isEmpty={false} loadingText="Carregando ofertas..." emptyText="Nenhuma oferta cadastrada." loadingContent={<OffersListSkeleton />}>
        <AdminOffersList
          items={items}
          meta={meta}
          deletingId={deletingId}
          onCreate={startCreate}
          onEdit={edit}
          onDelete={(id) => setPendingDelete(id)}
          onPageChange={setPage}
        />
      </AdminPageState>

      <AdminConfirmModal
        visible={pendingDelete !== null}
        title="Remover oferta"
        message="A campanha e seus vínculos serão removidos. Deseja continuar?"
        tone="danger"
        processing={deletingId !== null}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void remove()}
      />
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  buttonContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  buttonText: { color: adminColors.white, fontSize: 13, fontWeight: "700" },
  successSummary: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(16,185,129,0.42)", borderRadius: 12, backgroundColor: adminColors.successSoft, padding: 13 },
  successText: { flex: 1, color: "#a7f3d0", fontSize: 14, lineHeight: 20, fontWeight: "600" },
  summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  summaryCopy: { flex: 1, minWidth: 0, gap: 4 },
  summaryTitle: { color: adminColors.white, fontSize: 16, fontWeight: "700" },
});

function OffersListSkeleton() {
  return <View style={skeletonStyles.list} accessibilityLabel="Carregando ofertas">
    {[1, 2, 3].map((item) => <View key={item} style={skeletonStyles.card}><View style={skeletonStyles.top}><View style={skeletonStyles.cover} /><View style={skeletonStyles.copy}><View style={skeletonStyles.title} /><View style={skeletonStyles.line} /><View style={skeletonStyles.discount} /></View></View><View style={skeletonStyles.longLine} /><View style={skeletonStyles.shortLine} /></View>)}
  </View>;
}

const skeletonStyles = StyleSheet.create({
  list: { gap: 12 },
  card: { borderWidth: 1, borderColor: adminColors.softBorder, borderRadius: 16, backgroundColor: adminColors.surface, padding: 14, gap: 12 },
  top: { flexDirection: "row", gap: 12 },
  cover: { width: 68, height: 82, borderRadius: 11, backgroundColor: "#172554" },
  copy: { flex: 1, gap: 9 },
  title: { width: "72%", height: 18, borderRadius: 5, backgroundColor: "#1e293b" },
  line: { width: "52%", height: 12, borderRadius: 4, backgroundColor: "#1e293b" },
  discount: { width: "38%", height: 16, borderRadius: 5, backgroundColor: "#064e3b" },
  longLine: { width: "92%", height: 12, borderRadius: 4, backgroundColor: "#1e293b" },
  shortLine: { width: "48%", height: 12, borderRadius: 4, backgroundColor: "#1e293b" },
});
