import type { AdminOfferFormState, AdminOfferListingOption } from "../shared/admin.types";
export function createEmptyOfferFormState(): AdminOfferFormState { return { name: "", description: "", coverImageUrl: "", bannerImageUrl: "", discountPercentage: "", startDate: "", endDate: "", isActive: true, platformId: "" }; }
export function normalizeDateInput(value?: string) { return value ? String(value).slice(0, 10) : ""; }
export function normalizeDiscountInput(value: string) { return value ? String(Math.min(100, Math.max(1, Number(value) || 0))) : ""; }
export function buildListingLabel(listing: { game?: { title?: string | null } | null; platform?: { name?: string | null } | null }) { return `${listing.game?.title || "Jogo"} · ${listing.platform?.name || "Plataforma"}`; }
export function matchesListingSearch(listing: AdminOfferListingOption, searchText: string) { const query = searchText.trim().toLowerCase(); if (!query) return true; return String(listing.game?.title ?? "").toLowerCase().includes(query) || String(listing.platform?.name ?? "").toLowerCase().includes(query); }
export function mergeListingIds(current: number[], next: number[]) { return Array.from(new Set([...current, ...next])); }
export function buildPlatformOptions(listings: AdminOfferListingOption[]) { const map = new Map<number, { id: number; name: string }>(); listings.forEach((listing) => { const id = Number(listing.platform?.id ?? 0); if (id && !map.has(id)) map.set(id, { id, name: listing.platform?.name || "Plataforma" }); }); return Array.from(map.values()); }
