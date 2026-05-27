import { resolvePlatformLogoUrl } from "../../../../services/assets";
import type { PlatformMonitorItem } from "../../shared/admin.types";
import { getPlatformPriceLabel } from "./AdminGamePlatforms.helpers";
import { AdminButton, AdminLinkButton, AdminStatusBadge } from "../../shared/adminShared";

export default function AdminGamePlatformCard({
  platform,
  onManage,
}: {
  platform: PlatformMonitorItem;
  onManage: () => void;
}) {
  return (
    <article className="rounded-[24px] border border-slate-800 bg-slate-950/82 p-4 shadow-[0_18px_45px_rgba(2,6,23,0.28)]">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/90 p-2">
          <img
            src={resolvePlatformLogoUrl(platform.platform.name, platform.platform.iconUrl)}
            alt={platform.platform.name}
            className="h-full w-full object-contain"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-white">
            {platform.platform.name}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
              {getPlatformPriceLabel(platform.price)}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
              {platform.stock.available} disponíveis
            </span>
            <AdminStatusBadge
              active={platform.isActive}
              activeLabel="Plataforma ativa"
              inactiveLabel="Plataforma inativa"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {platform.listingId ? (
            <AdminLinkButton to={`/admin/price-history?listingId=${platform.listingId}`} tone="secondary">
              Histórico
            </AdminLinkButton>
          ) : null}
          <AdminButton type="button" tone="secondary" onClick={onManage}>
            Gerenciar
          </AdminButton>
        </div>
      </div>
    </article>
  );
}



