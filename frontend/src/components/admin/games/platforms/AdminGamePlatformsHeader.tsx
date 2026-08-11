import { resolveAssetUrl } from "../../../../services/assets";

export default function AdminGamePlatformsHeader({
  gameTitle,
  coverImageUrl,
  availableKeysCount,
}: {
  gameTitle?: string;
  coverImageUrl?: string;
  availableKeysCount: number;
}) {
  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-950/82 p-4 shadow-[0_18px_45px_rgba(2,6,23,0.28)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <img
          src={resolveAssetUrl(coverImageUrl)}
          alt={gameTitle || "Jogo"}
          className="aspect-[21/10] w-full max-w-[170px] shrink-0 rounded-[24px] border border-slate-800 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Jogo
          </p>
          <h2 className="mt-2 truncate text-2xl font-semibold text-white">
            {gameTitle || "Jogo"}
          </h2>
        </div>
        <span className="shrink-0 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100">
          {availableKeysCount} keys disponíveis
        </span>
      </div>
    </section>
  );
}



