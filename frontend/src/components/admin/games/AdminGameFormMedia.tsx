import { ChevronDown, ChevronUp, ImagePlus, Link2, Trash2, Upload } from "lucide-react";
import { AdminButton, AdminTextField } from "../shared/adminShared";
import type { GalleryItem, GameValues, SetGameField } from "../shared/admin.types";

type AdminGameFormMediaProps = {
  values: GameValues;
  coverFile: File | null;
  galleryItems: GalleryItem[];
  galleryUrlInput: string;
  onSetField: SetGameField;
  onCoverFileChange: (file: File | null) => void;
  onClearCoverFile: () => void;
  onGalleryUrlInputChange: (value: string) => void;
  onAddGalleryUrl: () => void;
  onAddGalleryFiles: (files: FileList | null) => void;
  onMoveGalleryItem: (itemKey: string, direction: -1 | 1) => void;
  onRemoveGalleryItem: (itemKey: string) => void;
};

function getGalleryItemLabel(galleryItem: GalleryItem) {
  if (galleryItem.kind === "existing") {
    return "Imagem atual";
  }

  if (galleryItem.kind === "file") {
    return galleryItem.file?.name || "Imagem enviada";
  }

  return "Imagem por URL";
}

export default function AdminGameFormMedia({
  values,
  coverFile,
  galleryItems,
  galleryUrlInput,
  onSetField,
  onCoverFileChange,
  onClearCoverFile,
  onGalleryUrlInputChange,
  onAddGalleryUrl,
  onAddGalleryFiles,
  onMoveGalleryItem,
  onRemoveGalleryItem,
}: AdminGameFormMediaProps) {
  return (
    <>
      <section className="rounded-[28px] border border-slate-800 bg-slate-950/82 p-5">
        <div className="flex items-center gap-3">
          <Upload className="h-5 w-5 text-blue-200" />
          <div>
            <h2 className="text-lg font-semibold text-white">Capa principal</h2>
            <p className="text-sm text-slate-400">
              O fluxo principal é por arquivo. A URL fica como alternativa discreta.
            </p>
          </div>
        </div>

        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-700 bg-slate-900/45 px-6 py-8 text-center text-slate-300 transition hover:border-blue-400/45 hover:bg-slate-900/70">
          <ImagePlus className="h-8 w-8 text-blue-200" />
          <span className="mt-3 text-base font-medium text-white">
            {coverFile ? coverFile.name : "Clique para enviar a capa"}
          </span>
          <span className="mt-1 text-sm text-slate-400">
            JPG, PNG ou WEBP. O arquivo enviado tem prioridade sobre a URL.
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={({ target }) => onCoverFileChange(target.files?.[0] ?? null)}
          />
        </label>

        {coverFile && (
          <div className="mt-3 flex justify-end">
            <AdminButton type="button" tone="secondary" onClick={onClearCoverFile}>
              Remover arquivo da capa
            </AdminButton>
          </div>
        )}

        <details className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <summary className="cursor-pointer list-none text-sm font-medium text-slate-200">
            Usar URL de fallback
          </summary>
          <div className="mt-4">
            <AdminTextField
              label="URL da capa"
              type="text"
              value={values.coverImageUrl}
              onChange={({ target }) => onSetField("coverImageUrl", target.value)}
              note="Use apenas quando não quiser enviar um arquivo agora."
            />
          </div>
        </details>
      </section>

      <section className="rounded-[28px] border border-slate-800 bg-slate-950/82 p-5">
        <div className="flex items-center gap-3">
          <ImagePlus className="h-5 w-5 text-blue-200" />
          <div>
            <h2 className="text-lg font-semibold text-white">Galeria</h2>
            <p className="text-sm text-slate-400">
              Envie imagens extras, adicione URLs quando necessário e organize a ordem visual da página do jogo.
            </p>
          </div>
        </div>

        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-700 bg-slate-900/45 px-6 py-7 text-center text-slate-300 transition hover:border-blue-400/45 hover:bg-slate-900/70">
          <Upload className="h-7 w-7 text-blue-200" />
          <span className="mt-3 text-base font-medium text-white">
            Adicionar imagens da galeria
          </span>
          <span className="mt-1 text-sm text-slate-400">
            Você pode selecionar várias imagens de uma vez.
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={({ target }) => onAddGalleryFiles(target.files)}
          />
        </label>

        <details className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <summary className="cursor-pointer list-none text-sm font-medium text-slate-200">
            Adicionar imagem da galeria por URL
          </summary>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <AdminTextField
                label="URL da galeria"
                type="url"
                value={galleryUrlInput}
                onChange={({ target }) => onGalleryUrlInputChange(target.value)}
              />
            </div>
            <div className="flex items-end">
              <AdminButton type="button" tone="secondary" onClick={onAddGalleryUrl}>
                <Link2 className="mr-2 h-4 w-4" />
                Adicionar URL
              </AdminButton>
            </div>
          </div>
        </details>

        {galleryItems.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/35 p-4 text-sm text-slate-300">
            Nenhuma imagem extra adicionada. A galeria é opcional.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {galleryItems.map((galleryItem, index) => (
              <article
                key={galleryItem.key}
                className="rounded-[24px] border border-slate-800 bg-slate-900/50 p-4"
              >
                <img
                  src={galleryItem.previewUrl}
                  alt={`Galeria ${index + 1}`}
                  className="h-40 w-full rounded-[18px] border border-slate-800 object-cover"
                />

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-white">{getGalleryItemLabel(galleryItem)}</p>
                    <p className="mt-1 text-xs text-slate-400">Ordem {index + 1}</p>
                  </div>

                  <div className="flex gap-2">
                    <AdminButton
                      type="button"
                      tone="secondary"
                      disabled={index === 0}
                      onClick={() => onMoveGalleryItem(galleryItem.key, -1)}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </AdminButton>
                    <AdminButton
                      type="button"
                      tone="secondary"
                      disabled={index === galleryItems.length - 1}
                      onClick={() => onMoveGalleryItem(galleryItem.key, 1)}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </AdminButton>
                    <AdminButton
                      type="button"
                      tone="subtleDanger"
                      onClick={() => onRemoveGalleryItem(galleryItem.key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </AdminButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

