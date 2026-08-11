import { ChevronLeft, ChevronRight } from "lucide-react";

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
  return (
    <article className="nexus-panel px-3 pb-3 pt-3 sm:px-4 sm:pb-3 sm:pt-4">
      <div className="overflow-hidden border border-white/12 bg-slate-950/80">
        <img
          src={selectedImage || coverImage}
          alt={gameTitle}
          className="aspect-21/10 w-full object-cover"
        />
      </div>

      <div className="nexus-scrollbar mt-1.5 flex gap-2 overflow-x-auto">
        {galleryImages.map((imageUrl, index) => {
          const selected = selectedImage === imageUrl;

          return (
            <button
              key={`${imageUrl}-${index}`}
              type="button"
              onClick={() => onSelectImage(imageUrl)}
              className={`shrink-0 overflow-hidden border transition ${
                selected
                  ? "border-blue-400 shadow-[0_0_0_2px_rgba(96,165,250,0.3)]"
                  : "border-white/10 hover:border-blue-300/60"
              }`}
            >
              <img
                src={imageUrl}
                alt={`${gameTitle} miniatura ${index + 1}`}
                className="h-14 w-24 object-cover sm:h-16 sm:w-28"
              />
            </button>
          );
        })}
      </div>

      <div className="mt-1.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onStepImage(-1)}
          disabled={galleryImages.length <= 1}
          className="border border-white/10 bg-black/35 p-1 text-zinc-300 transition hover:border-blue-400/50 hover:text-white disabled:opacity-40"
          aria-label="Imagem anterior"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onStepImage(1)}
          disabled={galleryImages.length <= 1}
          className="border border-white/10 bg-black/35 p-1 text-zinc-300 transition hover:border-blue-400/50 hover:text-white disabled:opacity-40"
          aria-label="Proxima imagem"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}
