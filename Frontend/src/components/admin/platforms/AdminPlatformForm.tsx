import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../shared/AdminLayout";
import {
  AdminFormActions,
  AdminNotice,
  AdminSideCard,
  AdminTextField,
  AdminToggleField,
  adminFormClass,
} from "../shared/adminShared";
import api from "../../../services/api";
import { resolveAssetUrl } from "../../../services/assets";
import { getApiErrorMessage } from "../../../services/http";
import type { AdminPlatform } from "../shared/admin.types";

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildPlatformPayload(
  name: string,
  slug: string,
  iconUrl: string,
  isActive: boolean,
  iconFile: File | null,
) {
  const payload = new FormData();

  payload.append("name", name.trim());
  payload.append("slug", slug.trim());
  payload.append("iconUrl", iconUrl.trim());
  payload.append("isActive", String(isActive));

  if (iconFile) {
    payload.append("iconFile", iconFile);
  }

  return payload;
}

export default function AdminPlatformForm({ id }: { id?: string }) {
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreviewUrl, setIconPreviewUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [slugWasEdited, setSlugWasEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchPlatform = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const { data } = await api.get<AdminPlatform>(`/platforms/${id}`);
        setName(data.name ?? "");
        setSlug(data.slug ?? "");
        setIconUrl(data.iconUrl ?? "");
        setIconFile(null);
        setIsActive(data.isActive !== false);
        setSlugWasEdited(true);
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, "Não foi possível carregar a plataforma."),
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPlatform();
  }, [id]);

  useEffect(() => {
    if (iconFile) {
      const objectUrl = URL.createObjectURL(iconFile);
      setIconPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }

    setIconPreviewUrl(resolveAssetUrl(iconUrl));
  }, [iconFile, iconUrl]);

  const updateName = (value: string) => {
    setName(value);

    if (!slugWasEdited) {
      setSlug(createSlug(value));
    }
  };

  const updateSlug = (value: string) => {
    setSlugWasEdited(true);
    setSlug(createSlug(value));
  };

  const savePlatform = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();

    if (!trimmedName) {
      setErrorMessage("Informe o nome da plataforma.");
      return;
    }

    if (!trimmedSlug) {
      setErrorMessage("Informe o slug da plataforma.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      const payload = buildPlatformPayload(
        trimmedName,
        trimmedSlug,
        iconUrl,
        isActive,
        iconFile,
      );

      if (isEditing) {
        await api.put<AdminPlatform>(`/platforms/${id}`, payload);
      } else {
        await api.post<AdminPlatform>("/platforms", payload);
      }

      void navigate("/admin/platforms");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Não foi possível salvar a plataforma."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout
      title={isEditing ? "Editar plataforma" : "Nova plataforma"}
      description="Cadastre a plataforma com identificador único e imagem por arquivo ou URL."
      backTo="/admin/platforms"
      backLabel="Voltar para plataformas"
    >
      {isLoading ? (
        <p className="text-gray-300">Carregando formulário...</p>
      ) : (
        <form onSubmit={savePlatform} className={adminFormClass}>
          <div className="grid gap-5 lg:grid-cols-[1fr,280px]">
            <div className="grid gap-4">
              <AdminTextField
                label="Nome"
                type="text"
                value={name}
                onChange={({ target }) => updateName(target.value)}
                placeholder="Ex: PlayStation 5"
                required
              />
              <AdminTextField
                label="Slug"
                type="text"
                value={slug}
                onChange={({ target }) => updateSlug(target.value)}
                placeholder="Ex: playstation-5"
                note="Identificador único salvo no banco. Use letras, números e hífen."
                required
              />
              <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)]">
                  <img
                    src={iconPreviewUrl}
                    alt={name || "Preview da plataforma"}
                    className="h-32 w-full rounded-2xl border border-slate-800 bg-slate-950 object-contain p-4"
                  />

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-white">
                      Imagem da plataforma
                    </p>
                    <p className="text-xs text-slate-400">
                      Envie uma imagem ou informe uma URL. O arquivo enviado tem
                      prioridade sobre a URL.
                    </p>

                    <label className="inline-flex cursor-pointer rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white">
                      Enviar imagem
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={({ target }) => {
                          setIconFile(target.files?.[0] ?? null);
                        }}
                      />
                    </label>

                    {iconFile && (
                      <button
                        type="button"
                        className="block text-sm font-medium text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
                        onClick={() => setIconFile(null)}
                      >
                        Remover arquivo enviado
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <AdminTextField
                    label="URL do ícone"
                    type="text"
                    value={iconUrl}
                    onChange={({ target }) => setIconUrl(target.value)}
                    placeholder="/plataforms/playstationConsole.png"
                    note="Use URL quando não quiser enviar um arquivo agora."
                  />
                </div>
              </section>

              <AdminToggleField
                label="Plataforma ativa"
                checked={isActive}
                onChange={setIsActive}
              />
            </div>

            <AdminSideCard eyebrow="Sobre o slug">
              <p className="mt-3 text-sm leading-7 text-slate-300">
                O slug já existe na tabela de plataformas e serve como um nome
                técnico curto, sem espaços, para identificar a plataforma de
                forma estável.
              </p>
            </AdminSideCard>
          </div>

          {errorMessage && <AdminNotice>{errorMessage}</AdminNotice>}
          <AdminFormActions
            backTo="/admin/platforms"
            saving={isSaving}
            submitLabel="Salvar plataforma"
          />
        </form>
      )}
    </AdminLayout>
  );
}
