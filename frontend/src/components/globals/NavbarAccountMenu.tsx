import {
  ChevronDown,
  LogOut,
  ReceiptText,
  Settings,
  UserRound,
} from "lucide-react";
import {
  Menu as HeadlessMenu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resolveAssetUrl } from "../../services/assets";
import type { MenuAction } from "./globals.types";

const menuItemClass =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition data-focus:bg-slate-900 data-focus:text-white data-focus:outline-hidden";

function getActionClass(danger?: boolean) {
  return `${menuItemClass}${
    danger
      ? " text-rose-200 data-focus:bg-rose-500/10 data-focus:text-rose-100 hover:text-rose-100"
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
  const [avatarBroken, setAvatarBroken] = useState(false);
  const resolvedAvatarUrl = avatarUrl?.trim() ? resolveAssetUrl(avatarUrl, "") : "";
  const accountActions: MenuAction[] = [
    { label: "Configurações", to: "/configuracoes", icon: Settings },
    { label: "Meus pedidos e keys", to: "/meus-pedidos", icon: ReceiptText },
    { label: "Sair", icon: LogOut, onSelect: onLogout, danger: true },
  ];

  useEffect(() => {
    setAvatarBroken(false);
  }, [avatarUrl]);

  if (!isLoggedIn) {
    return (
      <Link
        to="/login"
        className="hidden rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 md:inline-block"
      >
        Entrar
      </Link>
    );
  }

  return (
    <HeadlessMenu as="div" className="relative hidden md:block">
      <MenuButton className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 px-2 py-1.5 text-left text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-900 focus:outline-none">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-900 text-slate-200">
          {resolvedAvatarUrl && !avatarBroken ? (
            <img
              src={resolvedAvatarUrl}
              alt="Foto do usuário"
              className="h-full w-full object-cover"
              onError={() => setAvatarBroken(true)}
            />
          ) : (
            <UserRound className="h-5 w-5" />
          )}
        </div>
        <span className="hidden max-w-28 truncate font-medium text-white sm:block">
          {profileLabel}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-3 w-64 origin-top-right rounded-2xl border border-slate-800 bg-slate-950/96 p-2 shadow-[0_18px_40px_rgba(2,6,23,0.3)] outline-none transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        {accountActions.map((action) => (
          <MenuItem key={action.label}>{renderAction(action)}</MenuItem>
        ))}
      </MenuItems>
    </HeadlessMenu>
  );
}
