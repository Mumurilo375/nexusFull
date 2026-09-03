import { Text } from "@/src/components/ui/Typography";
import { router } from "expo-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, View } from "react-native";
import api from "../../../services/api";
import { resolveAssetUrl } from "../../../services/assets";
import { getApiErrorMessage } from "../../../services/http";
import AdminLayout, {
  AdminButton,
  AdminNotice,
  AdminPageState,
  AdminTextField,
  AdminTextareaField,
  AdminToggleField,
  adminStyles,
} from "../shared/adminShared";
import type { Category, GalleryItem, GameResponse, GameValues, PaginatedResponse, UploadFile } from "../shared/admin.types";
import AdminGameFormMedia from "./AdminGameFormMedia";
import {
  buildGameFormData,
  createExistingGalleryItem,
  createUploadGalleryItem,
  createUrlGalleryItem,
  emptyGame,
  mapGameToValues,
  moveItem,
} from "./AdminGameForm.helpers";

export default function AdminGameForm({ id }: { id?: string }) {
  const editing = Boolean(id);
  const [values, setValues] = useState<GameValues>(emptyGame);
  const [categories, setCategories] = useState<Category[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [coverFile, setCoverFile] = useState<UploadFile | null>(null);
  const [galleryUrl, setGalleryUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const [categoryData, gameData] = await Promise.all([
          api.get<PaginatedResponse<Category>>("/categories?page=1&limit=100"),
          id ? api.get<GameResponse>(`/games/${id}`) : Promise.resolve(null),
        ]);
        if (!active) return;
        setCategories(categoryData.items ?? []);
        if (gameData) {
          setValues(mapGameToValues(gameData));
          setGallery((gameData.images ?? []).map(createExistingGalleryItem));
        } else {
          setValues(emptyGame);
          setGallery([]);
        }
        setCoverFile(null);
      } catch (requestError) {
        if (active) setLoadError(getApiErrorMessage(requestError, "Não foi possível carregar o formulário do jogo."));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [id]);

  const selectedCategories = useMemo(
    () => categories.filter((category) => values.categoryIds.includes(category.id)),
    [categories, values.categoryIds],
  );

  const clearFeedback = () => {
    setSubmitError("");
    setSuccess("");
  };

  const setField = <Field extends keyof GameValues>(field: Field, value: GameValues[Field]) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (field === "title") setTitleError("");
    clearFeedback();
  };

  const toggleCategory = (categoryId: number) => {
    setValues((current) => ({
      ...current,
      categoryIds: current.categoryIds.includes(categoryId)
        ? current.categoryIds.filter((item) => item !== categoryId)
        : [...current.categoryIds, categoryId],
    }));
    clearFeedback();
  };

  const addGalleryUrl = () => {
    const value = galleryUrl.trim();
    if (!value) return;
    setGallery((current) => [...current, createUrlGalleryItem(value)]);
    setGalleryUrl("");
    clearFeedback();
  };

  const setValidationError = (message: string) => {
    setSubmitError(message);
    setSuccess("");
    void AccessibilityInfo.announceForAccessibility(message);
  };

  const submit = async () => {
    if (!values.title.trim()) {
      setTitleError("Digite o título do jogo.");
      setValidationError("Revise o título antes de salvar o jogo.");
      return;
    }
    if (!values.releaseDate.trim()) {
      setValidationError("Informe a data de lançamento no formato AAAA-MM-DD.");
      return;
    }
    if (!values.description.trim() || !values.longDescription.trim()) {
      setValidationError("Preencha as descrições curta e completa do jogo.");
      return;
    }
    if (values.categoryIds.length === 0) {
      setValidationError("Selecione pelo menos uma categoria.");
      return;
    }
    if (!coverFile && !values.coverImageUrl.trim()) {
      setValidationError("Escolha uma capa ou informe uma URL de fallback.");
      return;
    }

    try {
      setSaving(true);
      setSubmitError("");
      const data = buildGameFormData(values, coverFile, gallery);
      if (editing) {
        await api.put(`/games/${id}`, data);
        router.replace("/admin/games" as never);
      } else {
        const created = await api.post<GameResponse>("/games", data);
        setValues(emptyGame);
        setGallery([]);
        setCoverFile(null);
        setSuccess(`Jogo criado: ${created.title}`);
      }
    } catch (requestError) {
      setSubmitError(getApiErrorMessage(requestError, "Não foi possível salvar o jogo."));
    } finally {
      setSaving(false);
    }
  };

  const preview = coverFile?.uri || resolveAssetUrl(values.coverImageUrl);

  return (
    <AdminLayout title={editing ? "Editar jogo" : "Novo jogo"} description="Organize o conteúdo da loja em blocos claros antes de publicar." backTo="/admin/games">
      <AdminPageState loading={loading} error={loadError} loadingText="Carregando formulário..." emptyText="">
        <View style={styles.formFlow}>
          <FormSection title="Informações básicas" description="Identificação, data e visibilidade no catálogo.">
            <AdminTextField label="Título" value={values.title} onChangeText={(value) => setField("title", value)} placeholder="Ex.: Hollow Knight" />
            {titleError ? <Text accessibilityRole="alert" style={styles.fieldError}>{titleError}</Text> : null}
            <View style={styles.fieldGrid}>
              <View style={styles.gridField}><AdminTextField label="Data de lançamento" value={values.releaseDate} onChangeText={(value) => setField("releaseDate", value)} placeholder="AAAA-MM-DD" keyboardType="numeric" /></View>
              <View style={styles.gridField}><AdminToggleField label="Jogo ativo" checked={values.isActive} onChange={(value) => setField("isActive", value)} /></View>
            </View>
          </FormSection>

          <FormSection title="Conteúdo da loja" description="Escreva primeiro o resumo e depois os detalhes da página do jogo.">
            <AdminTextareaField label="Descrição curta" value={values.description} onChangeText={(value) => setField("description", value)} placeholder="Resumo exibido nos cards e resultados" />
            <AdminTextareaField label="Descrição completa" value={values.longDescription} onChangeText={(value) => setField("longDescription", value)} placeholder="História, jogabilidade e informações importantes" />
          </FormSection>

          <FormSection title="Categorias" description={selectedCategories.length ? `${selectedCategories.length} selecionada(s)` : "Selecione pelo menos uma categoria."}>
            <View style={styles.categoryList}>
              {categories.map((category) => {
                const selected = values.categoryIds.includes(category.id);
                return <Pressable key={category.id} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => toggleCategory(category.id)} style={({ pressed }) => [styles.category, selected && styles.categorySelected, pressed && styles.pressed]}><Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{category.name}</Text></Pressable>;
              })}
            </View>
          </FormSection>

          <AdminGameFormMedia
            values={values}
            coverFile={coverFile}
            coverPreviewUrl={preview}
            galleryItems={gallery}
            galleryUrlInput={galleryUrl}
            onCoverFile={(file) => { setCoverFile(file); clearFeedback(); }}
            onClearCover={() => { setCoverFile(null); clearFeedback(); }}
            onSetCoverUrl={(value) => setField("coverImageUrl", value)}
            onGalleryUrlChange={setGalleryUrl}
            onAddGalleryUrl={addGalleryUrl}
            onAddGalleryFile={(file) => { setGallery((current) => [...current, createUploadGalleryItem(file)]); clearFeedback(); }}
            onMoveGallery={(key, direction) => setGallery((current) => {
              const index = current.findIndex((item) => item.key === key);
              const nextIndex = index + direction;
              return index < 0 || nextIndex < 0 || nextIndex >= current.length ? current : moveItem(current, index, nextIndex);
            })}
            onRemoveGallery={(key) => setGallery((current) => current.filter((item) => item.key !== key))}
          />

          <View style={styles.actionArea}>
            {submitError ? <AdminNotice>{submitError}</AdminNotice> : null}
            {success ? <AdminNotice tone="success">{success}</AdminNotice> : null}
            <Text style={styles.actionHint}>Confira os campos e finalize quando o cadastro estiver pronto.</Text>
            <View style={styles.actions}>
              <AdminButton disabled={saving} onPress={() => void submit()} style={styles.submitAction}>{saving ? "Salvando..." : "Salvar jogo"}</AdminButton>
              <AdminButton tone="secondary" disabled={saving} onPress={() => router.replace("/admin/games" as never)} style={styles.cancelAction}>Cancelar</AdminButton>
            </View>
          </View>
        </View>
      </AdminPageState>
    </AdminLayout>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <View style={[adminStyles.card, styles.formSection]}><View style={styles.sectionHeader}><Text style={adminStyles.sectionTitle}>{title}</Text><Text style={styles.sectionDescription}>{description}</Text></View><View style={styles.sectionBody}>{children}</View></View>;
}

const styles = StyleSheet.create({
  formFlow: { gap: 14 },
  formSection: { padding: 18 },
  sectionHeader: { paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  sectionDescription: { marginTop: 4, color: "#94a3b8", fontSize: 12, lineHeight: 18 },
  sectionBody: { marginTop: 16, gap: 15 },
  fieldGrid: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end", gap: 12 },
  gridField: { minWidth: 220, flex: 1 },
  fieldError: { marginTop: -7, color: "#fda4af", fontSize: 12, lineHeight: 18 },
  categoryList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  category: { minHeight: 42, justifyContent: "center", paddingHorizontal: 13, borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#020617" },
  categorySelected: { borderColor: "#3b82f6", backgroundColor: "rgba(37,99,235,0.18)" },
  categoryText: { color: "#cbd5e1", fontSize: 13, lineHeight: 18, fontWeight: "600" },
  categoryTextSelected: { color: "#dbeafe" },
  actionArea: { gap: 12, paddingTop: 18, borderTopWidth: 1, borderTopColor: "#334155" },
  actionHint: { color: "#94a3b8", fontSize: 12, lineHeight: 18 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  submitAction: { minWidth: 170, flex: 1 },
  cancelAction: { minWidth: 120 },
  pressed: { opacity: 0.72 },
});
