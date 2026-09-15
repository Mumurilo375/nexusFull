import {
  ChevronDown,
  LogOut,
  ReceiptText,
  Settings,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { resolveAssetUrl } from "../../services/assets";
import type { MenuAction } from "./globals.types";

const menuItemClass =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition hover:bg-slate-900 hover:text-white focus-visible:bg-slate-900 focus-visible:text-white";

function getActionClass(danger?: boolean) {
  return `${menuItemClass}${
    danger
      ? " text-rose-200 hover:bg-rose-500/10 hover:text-rose-100 focus-visible:bg-rose-500/10 focus-visible:text-rose-100"
      : ""
  }`;
}

function renderAction(action: MenuAction) {
  const Icon = action.icon;
  const content = (
    <>
      <Icon className={action.danger ? "h-4 w-4 text-rose-300" : "h-4 w-4"} />
      {action.label}
    </>
  );

  if (action.to) {
    return (
      <Link to={action.to} className={getActionClass(action.danger)}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onSelect} className={getActionClass(action.danger)}>
      {content}
    </button>
  );
}

export default function NavbarAccountMenu({
  isLoggedIn,
  profileLabel,
  avatarUrl,
  onLogout,
}: {
  isLoggedIn: boolean;
  profileLabel: string;
  avatarUrl?: string | null;
  onLogout: () => void;
}) {
  const [brokenAvatarUrl, setBrokenAvatarUrl] = useState<string | null>(null);
  const normalizedAvatarUrl = String(avatarUrl ?? "").trim();
  const resolvedAvatarUrl = normalizedAvatarUrl
    ? resolveAssetUrl(normalizedAvatarUrl, "")
    : "";
  const avatarIsBroken = Boolean(resolvedAvatarUrl) && brokenAvatarUrl === resolvedAvatarUrl;
  const accountActions: MenuAction[] = [
    { label: "Configurações", to: "/configuracoes", icon: Settings },
    { label: "Meus pedidos e keys", to: "/meus-pedidos", icon: ReceiptText },
    { label: "Sair", icon: LogOut, onSelect: onLogout, danger: true },
  ];

  if (!isLoggedIn) {
    return (
      <Link
        to="/login"
        className="hidden min-h-11 items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 md:inline-flex"
      >
        Entrar
      </Link>
    );
  }

  return (
    <details className="group relative block">
      <summary
        className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-1.5 py-1 text-left text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:gap-2 sm:px-2 sm:py-1.5 [&::-webkit-details-marker]:hidden"
        aria-label={`Abrir menu da conta de ${profileLabel}`}
      >
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-900 text-slate-200">
          {resolvedAvatarUrl && !avatarIsBroken ? (
            <img
              src={resolvedAvatarUrl}
              alt="Foto do usuário"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              onError={() => setBrokenAvatarUrl(resolvedAvatarUrl)}
            />
          ) : (
            <UserRound className="h-5 w-5" />
          )}
        </div>
        <span className="hidden max-w-28 truncate font-medium text-white sm:block">
          {profileLabel}
        </span>
        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
      </summary>

      <div
        className="absolute right-0 z-10 mt-3 w-64 rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-[0_18px_40px_rgba(2,6,23,0.3)]"
      >
        {accountActions.map((action) => (
          <div key={action.label}>{renderAction(action)}</div>
        ))}
      </div>
    </details>
  );
}
