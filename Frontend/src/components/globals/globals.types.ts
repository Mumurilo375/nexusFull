import type { LucideIcon } from "lucide-react";

export type AuthRequiredModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export type PaginationProps = {
  page: number;
  totalPages: number;
  scrollToTop?: boolean;
  onPageChange: (page: number) => void;
};

export type GameSuggestion = {
  id: number;
  title: string;
  coverImageUrl?: string;
};

export type GamesResponse = {
  items: GameSuggestion[];
};

export type NavbarCartResponse = {
  items?: Array<{ listingId?: number; quantity?: number }>;
  meta?: { totalItems?: number };
};

export type NavLinkItem = {
  to: string;
  label: string;
  adminOnly?: boolean;
};

export type MenuAction = {
  label: string;
  icon: LucideIcon;
  to?: string;
  onSelect?: () => void;
  danger?: boolean;
};
