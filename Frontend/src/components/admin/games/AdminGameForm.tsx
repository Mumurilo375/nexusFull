import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../shared/AdminLayout";
import AdminSuccessToast from "../shared/AdminSuccessToast";
import AdminGameFormMedia from "./AdminGameFormMedia";
import {
  buildGameFormData,
  createExistingGalleryItem,
  createFileGalleryItem,
  createUrlGalleryItem,
  emptyGame,
  mapGameToValues,
  moveItem,
  revokeGalleryItemPreview,
} from "./AdminGameForm.helpers";
import type { Category, GalleryItem, GameResponse, GameValues } from "../shared/admin.types";
import {
  AdminButton,
  AdminFormActions,
  AdminNotice,
  AdminTextareaField,
  AdminTextField,
  AdminToggleField,
} from "../shared/adminShared";
import api from "../../../services/api";
import { resolveAssetUrl } from "../../../services/assets";
import { getApiErrorMessage, type PaginatedResponse } from "../../../services/http";

type CreatedGameState = {
  title: string;
};

function AdminErrorToast({
  title,
  message,
  details,
  onDismiss,
  
}: {
  title: string;
  message: string;
  details?: string;
  onDismiss: () => void;
  durationMs?: number;
}) {
  

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed left-1/2 top-24 z-140 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-rose-500/35 bg-slate-950/96 p-4 text-left shadow-[0_22px_60px_rgba(2,6,23,0.55)] backdrop-blur"
    >
      <p className="text-sm font-semibold text-rose-200">{title}</p>
      <div className="mt-2 text-base font-semibold text-white">{message}</div>
      {details && <div className="mt-2 text-sm leading-6 text-slate-300">{details}</div>}
    </div>
  );
}

export default function AdminGameForm({ id }: { id?: string }) {
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const galleryItemsRef = useRef<GalleryItem[]>([]);
  const [values, setValues] = useState<GameValues>(emptyGame);
  const [categories, setCategories] = useState<Category[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(resolveAssetUrl(emptyGame.coverImageUrl));
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdGame, setCreatedGame] = useState<CreatedGameState | null>(null);
  const [titleErrorMessage, setTitleErrorMessage] = useState("");
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const selectedCategories = useMemo(() => categories.filter((category) => values.categoryIds.includes(category.id)), [categories, values.categoryIds]);
  const categorySummary = selectedCategories.length === 0 ? "Nenhuma categoria selecionada." : `${selectedCategories.length} categoria(s) selecionada(s).`;
  const toggleCategoryPicker = () => setIsCategoryPickerOpen((currentState) => !currentState);

  useEffect(() => {
    galleryItemsRef.current = galleryItems;
  }, [galleryItems]);

  useEffect(() => () => galleryItemsRef.current.forEach(revokeGalleryItemPreview), []);

  useEffect(() => {
    if (coverFile) {
      const objectUrl = URL.createObjectURL(coverFile);
      setCoverPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setCoverPreviewUrl(resolveAssetUrl(values.coverImageUrl));
  }, [coverFile, values.coverImageUrl]);

  const replaceGalleryItems = (nextItems: GalleryItem[]) => {
    setGalleryItems((currentItems) => (currentItems.forEach(revokeGalleryItemPreview), nextItems));
  };

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [categoryResponse, gameResponse] = await Promise.all([
          api.get<PaginatedResponse<Category>>("/categories", {
            params: { page: 1, limit: 100 },
          }),
          id ? api.get<GameResponse>(`/games/${id}`) : Promise.resolve(null),
        ]);

        setCategories(categoryResponse.data.items ?? []);
        setGalleryUrlInput("");
        setIsCategoryPickerOpen(false);

        if (!gameResponse) {
          setValues(emptyGame);
          replaceGalleryItems([]);
          setCoverFile(null);
          return;
        }

        setValues(mapGameToValues(gameResponse.data));
        replaceGalleryItems((gameResponse.data.images ?? []).map(createExistingGalleryItem));
        setCoverFile(null);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar o formulário do jogo."));
      } finally {
        setIsLoading(false);
      }
    };

    void fetchFormData();
  }, [id]);

  const setField = <Field extends keyof GameValues>(field: Field, value: GameValues[Field]) => {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));

    if (field === "title" && titleErrorMessage) {
      setTitleErrorMessage("");
    }
  };

  const toggleCategory = (categoryId: number) => {
    setValues((currentValues) => ({
      ...currentValues,
      categoryIds: currentValues.categoryIds.includes(categoryId)
        ? currentValues.categoryIds.filter((currentId) => currentId !== categoryId)
        : [...currentValues.categoryIds, categoryId],
    }));
  };

  const addGalleryFiles = (files: FileList | null) => {
    if (!files?.length) return;

    setGalleryItems((currentItems) => [
      ...currentItems,
      ...Array.from(files).map(createFileGalleryItem),
    ]);
  };

  const addGalleryUrl = () => {
    const imageUrl = galleryUrlInput.trim();

    if (!imageUrl) return;

    setGalleryItems((currentItems) => [...currentItems, createUrlGalleryItem(imageUrl)]);
    setGalleryUrlInput("");
  };

  const removeGalleryItem = (itemKey: string) => {
    setGalleryItems((currentItems) => {
      const itemToRemove = currentItems.find((item) => item.key === itemKey);

      if (itemToRemove) {
        revokeGalleryItemPreview(itemToRemove);
      }

      return currentItems.filter((item) => item.key !== itemKey);
    });
  };

  const moveGalleryItem = (itemKey: string, direction: -1 | 1) => {
    setGalleryItems((currentItems) => {
      const currentIndex = currentItems.findIndex((item) => item.key === itemKey);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= currentItems.length) {
        return currentItems;
      }

      return moveItem(currentItems, currentIndex, nextIndex);
    });
  };

  const saveGame = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.title.trim()) {
      setTitleErrorMessage("Digite o título do jogo antes de salvar.");
      setErrorMessage("");
      setCreatedGame(null);
      return;
    }

    if (
      !values.description.trim() ||
      !values.longDescription.trim() ||
      !values.releaseDate.trim()
    ) {
      setTitleErrorMessage("");
      setErrorMessage("Preencha descrições e data de lançamento.");
      setCreatedGame(null);
      return;
    }

    if (values.categoryIds.length === 0) {
      setTitleErrorMessage("");
      setErrorMessage("Selecione pelo menos uma categoria.");
      setCreatedGame(null);
      return;
    }

    if (!coverFile && !values.coverImageUrl.trim()) {
      setTitleErrorMessage("");
      setErrorMessage("Envie uma capa ou informe uma URL de fallback.");
      setCreatedGame(null);
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setTitleErrorMessage("");
      setCreatedGame(null);

      const formData = buildGameFormData(values, coverFile, galleryItems);
      const createdTitle = values.title.trim();

      if (isEditing) {
        await api.put(`/games/${id}`, formData);
        void navigate("/admin/games");
      } else {
        const { data } = await api.post<GameResponse>("/games", formData);
        setValues(emptyGame);
        replaceGalleryItems([]);
        setCoverFile(null);
        setGalleryUrlInput("");
        setIsCategoryPickerOpen(false);
        setCreatedGame({
          title: data?.title ?? createdTitle,
        });
      }
    } catch (error) {
      setCreatedGame(null);
      setTitleErrorMessage("");
      setErrorMessage(getApiErrorMessage(error, "Não foi possível salvar o jogo."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout
      title={isEditing ? "Editar jogo" : "Novo jogo"}
      description="Edite os dados, a capa, a galeria e as categorias do jogo."
      backTo="/admin/games"
      backLabel="Voltar para jogos"
    >
      {isLoading ? (
        <p className="text-slate-300">Carregando formulário...</p>
      ) : (
        <form onSubmit={saveGame} noValidate className="grid gap-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_360px]">
            <div className="space-y-5">
              <section className="rounded-[28px] border border-slate-800 bg-slate-950/82 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <AdminTextField
                      label="Título"
                      type="text"
                      value={values.title}
                      onChange={({ target }) => setField("title", target.value)}
                      className={titleErrorMessage ? "border-rose-500/70 focus:border-rose-400" : undefined}
                    />
                    {titleErrorMessage && (
                      <div className="mt-3">
                        <AdminNotice>{titleErrorMessage}</AdminNotice>
                      </div>
                    )}
                  </div>

                  <AdminTextField
                    label="Data de lançamento"
                    type="date"
                    value={values.releaseDate}
                    onChange={({ target }) => setField("releaseDate", target.value)}
                  />

                  <div className="flex items-end">
                    <AdminToggleField
                      label="Jogo ativo"
                      checked={values.isActive}
                      onChange={(checked) => setField("isActive", checked)}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <AdminTextareaField
                    label="Descrição curta"
                    value={values.description}
                    onChange={({ target }) => setField("description", target.value)}
                    className="min-h-28"
                  />
                </div>

                <div className="mt-4">
                  <AdminTextareaField
                    label="Descrição longa"
                    value={values.longDescription}
                    onChange={({ target }) => setField("longDescription", target.value)}
                    className="min-h-44"
                  />
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-800 bg-slate-950/82 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Categorias</h2>
                    <p className="mt-1 text-sm text-slate-400">{categorySummary}</p>
                  </div>

                  <AdminButton
                    type="button"
                    tone="secondary"
                    onClick={toggleCategoryPicker}
                  >
                    {isCategoryPickerOpen ? "Ocultar categorias" : "Escolher categorias"}
                  </AdminButton>
                </div>

                {isCategoryPickerOpen && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {categories.map((category) => {
                      const selected = values.categoryIds.includes(category.id);

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                            selected
                              ? "border-blue-400/50 bg-blue-500/15 text-blue-100"
                              : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white"
                          }`}
                        >
                          {category.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              <AdminGameFormMedia
                values={values}
                coverFile={coverFile}
                galleryItems={galleryItems}
                galleryUrlInput={galleryUrlInput}
                onSetField={setField}
                onCoverFileChange={setCoverFile}
                onClearCoverFile={() => setCoverFile(null)}
                onGalleryUrlInputChange={setGalleryUrlInput}
                onAddGalleryUrl={addGalleryUrl}
                onAddGalleryFiles={addGalleryFiles}
                onMoveGalleryItem={moveGalleryItem}
                onRemoveGalleryItem={removeGalleryItem}
              />
            </div>

            <aside className="space-y-5 xl:sticky xl:top-28 xl:h-fit">
              <section className="rounded-[28px] border border-slate-800 bg-slate-950/82 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200/80">
                  Preview
                </p>
                <img
                  src={coverPreviewUrl}
                  alt={values.title || "Preview do jogo"}
                  className="mt-4 h-60 w-full rounded-3xl border border-slate-800 object-cover"
                />

                <h2 className="mt-4 text-2xl font-semibold text-white">
                  {values.title || "Título do jogo"}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {values.description || "A descrição curta aparecerá aqui para revisão rápida."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedCategories.length === 0 ? (
                    <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
                      Sem categorias
                    </span>
                  ) : (
                    selectedCategories.map((category) => (
                      <span
                        key={category.id}
                        className="rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-100"
                      >
                        {category.name}
                      </span>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-800 bg-slate-950/82 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200/80">
                  Galeria
                </p>
                <p className="mt-3 text-sm text-slate-400">
                  {galleryItems.length} imagem(ns) extra(s) configurada(s).
                </p>

                {galleryItems.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {galleryItems.slice(0, 6).map((galleryItem) => (
                      <img
                        key={galleryItem.key}
                        src={galleryItem.previewUrl}
                        alt="Miniatura da galeria"
                        className="h-20 w-full rounded-2xl border border-slate-800 object-cover"
                      />
                    ))}
                  </div>
                )}
              </section>
            </aside>
          </div>

          {errorMessage && <AdminNotice>{errorMessage}</AdminNotice>}

          <AdminFormActions
            backTo="/admin/games"
            saving={isSaving}
            submitLabel={isEditing ? "Salvar jogo" : "Criar jogo"}
          />
        </form>
      )}
      {!isSaving && titleErrorMessage && (
        <AdminErrorToast
          title="Título obrigatório"
          message={titleErrorMessage}
          details="Preencha o campo título para liberar o salvamento do cadastro do jogo."
          onDismiss={() => setTitleErrorMessage("")}
        />
      )}
      {!isEditing && createdGame && (
        <AdminSuccessToast
          title="Jogo criado com sucesso."
          message={createdGame.title}
          details="Configure as plataformas para liberar preço, estoque e chaves deste jogo na loja."
          onDismiss={() => setCreatedGame(null)}
        />
      )}
    </AdminLayout>
  );
}
