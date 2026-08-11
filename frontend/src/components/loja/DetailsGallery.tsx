import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { useState } from "react";

type DetailsGalleryProps = {
  coverImage: string;
  gameTitle: string;
  galleryImages: string[];
  selectedImage: string;
  onSelectImage: (imageUrl: string) => void;
  onStepImage: (direction: -1 | 1) => void;
};

export default function DetailsGallery({
  coverImage,
  gameTitle,
  galleryImages,
  selectedImage,
  onSelectImage,
  onStepImage,
}: DetailsGalleryProps) {
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const selectedIndex = Math.max(0, galleryImages.findIndex((imageUrl) => imageUrl === selectedImage));
  const activeImage = selectedImage || coverImage;
  const activeImageFailed = failedImages.includes(activeImage);

  const markImageAsFailed = (imageUrl: string) => {
    setFailedImages((current) => (current.includes(imageUrl) ? current : [...current, imageUrl]));
  };

  const renderThumbnail = (imageUrl: string, index: number) => {
    const selected = selectedImage === imageUrl;
    const imageFailed = failedImages.includes(imageUrl);

    return (
      <button
        key={`${imageUrl}-${index}`}
        type="button"
        onClick={() => onSelectImage(imageUrl)}
        className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-950 transition sm:h-[4.75rem] sm:w-[7rem] lg:h-20 lg:w-28 ${
          selected
            ? "border-cyan-300 shadow-[0_0_0_1px_rgba(34,211,238,0.35)]"
            : "border-slate-700 opacity-75 hover:border-slate-500 hover:opacity-100"
        }`}
        aria-label={`Abrir imagem ${index + 1} de ${galleryImages.length}`}
        aria-pressed={selected}
      >
        {imageFailed ? (
          <span className="flex h-full items-center justify-center text-slate-600">
            <ImageOff className="h-5 w-5" aria-hidden="true" />
          </span>
        ) : (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            onError={() => markImageAsFailed(imageUrl)}
          />
        )}
      </button>
    );
  };

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 shadow-[0_18px_48px_rgba(2,6,23,0.28)]" aria-label={`Galeria de ${gameTitle}`}>
      <div className="grid gap-3 p-3 sm:p-4 lg:grid-cols-[7rem_minmax(0,1fr)]">
        <div className="order-2 flex gap-2 overflow-x-auto pb-1 lg:order-1 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto">
          {galleryImages.length > 0 ? galleryImages.map(renderThumbnail) : (
            <div className="flex h-16 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 px-3 text-center text-xs text-slate-500 lg:h-20">
              Sem imagens
            </div>
          )}
        </div>

        <div className="relative order-1 aspect-[16/10] min-h-[250px] overflow-hidden rounded-2xl bg-[#050b18] sm:min-h-[360px] lg:order-2 lg:min-h-[520px]">
          {activeImageFailed || !activeImage ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-500">
              <ImageOff className="h-10 w-10" aria-hidden="true" />
              <p className="max-w-xs text-sm">A imagem deste jogo não está disponível.</p>
            </div>
          ) : (
            <img
              src={activeImage}
              alt={`${gameTitle}, imagem ${selectedIndex + 1}`}
              className="h-full w-full object-cover"
              onError={() => markImageAsFailed(activeImage)}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

          {galleryImages.length > 1 && (
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-between sm:inset-x-4 sm:bottom-4">
              <button
                type="button"
                onClick={() => onStepImage(-1)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/15 bg-black/60 text-white transition hover:border-cyan-300/60 hover:bg-black/80"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-xs font-semibold tabular-nums text-slate-200">
                {selectedIndex + 1} / {galleryImages.length}
              </span>
              <button
                type="button"
                onClick={() => onStepImage(1)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/15 bg-black/60 text-white transition hover:border-cyan-300/60 hover:bg-black/80"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
