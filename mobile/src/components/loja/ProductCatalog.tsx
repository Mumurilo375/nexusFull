import { Text, TextInput } from "@/src/components/ui/Typography";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Platform, Pressable, RefreshControl, StyleSheet, useWindowDimensions, View, type ListRenderItem } from "react-native";
import { useAuth } from "../../contexts/useAuth";
import api from "../../services/api";
import { resolveAssetUrl } from "../../services/assets";
import ProductCard from "./ProductCard";
import { loadCatalogData } from "./catalogData";
import type { GameSummary, ListingMap, OfferItem, PaginatedResponse, WishlistResponse } from "./store.types";
import { buildCatalogState, filterGames, getListingDiscountPercentage, getListingDisplayPrice, getListingPlatformName, getLowestAvailableListing, getRequestErrorMessage, normalizeText, PAGE_SIZE, toMoney } from "./store.utils";

type ProductCatalogProps = { selectedPlatforms: string[]; selectedCategories: string[] };
type DiscoveryItem = { id: number; title: string; price: number | null; coverImageUrl?: string; discount?: number };

export default function ProductCatalog({ selectedPlatforms, selectedCategories }: ProductCatalogProps) {
  const { isAuthenticated, isReady } = useAuth();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<GameSummary>>(null);
  const [games, setGames] = useState<GameSummary[]>([]);
  const [listingByGame, setListingByGame] = useState<ListingMap>(new Map());
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [pendingFavoriteId, setPendingFavoriteId] = useState<number | null>(null);
  const [searchDraft, setSearchDraft] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [offersError, setOffersError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const favoriteIdsRef = useRef<number[]>([]);

  const selectedPlatformSet = useMemo(() => new Set(selectedPlatforms.map(normalizeText)), [selectedPlatforms]);
  const filteredGames = useMemo(() => filterGames(games, selectedCategories, selectedPlatforms, query), [games, query, selectedCategories, selectedPlatforms]);
  const totalPages = Math.max(1, Math.ceil(filteredGames.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedGames = useMemo(() => filteredGames.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [currentPage, filteredGames]);
  const gridColumns = width >= 1040 ? 4 : width >= 700 ? 3 : 2;
  const contentPadding = width >= 700 ? 20 : 16;
  const contentWidth = Math.min(width, 1120) - contentPadding * 2;
  const gridGap = width >= 700 ? 16 : 12;
  const gridItemWidth = Math.max(0, Math.floor((contentWidth - (gridColumns - 1) * gridGap) / gridColumns));
  const railCardWidth = width >= 700 ? 200 : Math.min(174, Math.max(148, width - contentPadding * 2 - 84));

  useEffect(() => {
    let active = true;
    const loadCatalog = async () => {
      try {
        setLoading(true); setError("");
        const { games: gamesData, listings: listingsData } = await loadCatalogData({ forceRefresh: attempt > 0 });
        const catalog = buildCatalogState(gamesData, listingsData.filter((listing) => listing.isActive !== false));
        if (active) { setGames(catalog.games); setListingByGame(catalog.listingByGame); }
      } catch (loadError) {
        if (active) { setGames([]); setListingByGame(new Map()); setError(getRequestErrorMessage(loadError, "Não foi possível carregar os produtos no momento.")); }
      } finally { if (active) setLoading(false); }
    };
    void loadCatalog();
    return () => { active = false; };
  }, [attempt]);
  useEffect(() => {
    let active = true;
    const loadOffers = async () => {
      try {
        setOffersError(false);
        const data = await api.get<PaginatedResponse<OfferItem>>("/promotions?page=1&limit=100");
        if (active) setOffers((data.items ?? []).filter((offer) => offer.isActive && (offer.listings?.length ?? 0) > 0));
      } catch { if (active) { setOffers([]); setOffersError(true); } }
    };
    void loadOffers();
    return () => { active = false; };
  }, [attempt]);

  const loadFavorites = useCallback(async () => {
    if (!isReady || !isAuthenticated) { favoriteIdsRef.current = []; setFavoriteIds([]); return; }
    try {
      const wishlist = await api.get<WishlistResponse>("/wishlists");
      const ids = (wishlist.items ?? []).map((item) => item.gameId);
      favoriteIdsRef.current = ids;
      setFavoriteIds(ids);
    } catch { favoriteIdsRef.current = []; setFavoriteIds([]); }
  }, [isAuthenticated, isReady]);
  useEffect(() => { void Promise.resolve().then(loadFavorites); }, [loadFavorites]);
  useFocusEffect(useCallback(() => { void loadFavorites(); }, [loadFavorites]));

  const askLogin = useCallback(() => Alert.alert("Entre para continuar", "Para adicionar jogos aos favoritos, faça login na sua conta.", [{ text: "Agora não", style: "cancel" }, { text: "Entrar", onPress: () => router.push({ pathname: "/login", params: { from: "/(tabs)/loja" } } as never) }]), []);
  const openGameDetails = useCallback((gameId: number) => router.push({ pathname: "/loja/[gameId]", params: { gameId: String(gameId) } } as never), []);
  const getListingsForGame = useCallback((gameId: number) => {
    const listings = listingByGame.get(gameId) ?? [];
    return selectedPlatformSet.size === 0 ? listings : listings.filter((listing) => selectedPlatformSet.has(normalizeText(getListingPlatformName(listing))));
  }, [listingByGame, selectedPlatformSet]);
  const updateFavoriteIds = useCallback((updater: (current: number[]) => number[]) => {
    setFavoriteIds((current) => {
      const next = updater(current);
      favoriteIdsRef.current = next;
      return next;
    });
  }, []);
  const toggleFavorite = useCallback(async (gameId: number) => {
    if (!isAuthenticated) { askLogin(); return; }
    const isFavorite = favoriteIdsRef.current.includes(gameId);
    try {
      setPendingFavoriteId(gameId);
      if (isFavorite) { await api.delete(`/wishlists/${gameId}`); updateFavoriteIds((current) => current.filter((id) => id !== gameId)); }
      else { await api.post(`/wishlists/${gameId}`, {}); updateFavoriteIds((current) => [...current, gameId]); }
    } catch {
      Alert.alert("Não foi possível atualizar os favoritos", "Tente novamente em instantes.");
    } finally { setPendingFavoriteId(null); }
  }, [askLogin, isAuthenticated, updateFavoriteIds]);

  const highlightGames = useMemo<DiscoveryItem[]>(() => filteredGames.map((game) => {
    const listings = getListingsForGame(game.id);
    const soldCount = listings.reduce((sum, listing) => sum + Math.max(0, Number(listing.stock?.sold ?? 0)), 0);
    const lowestListing = getLowestAvailableListing(listings);
    const lowestPrice = lowestListing ? getListingDisplayPrice(lowestListing) : null;
    const discount = listings.reduce(
      (largest, listing) => Math.max(largest, Math.round(getListingDiscountPercentage(listing))),
      0,
    );
    return { id: game.id, title: game.title, coverImageUrl: game.coverImageUrl, price: lowestPrice, discount: discount || undefined, soldCount };
  }).sort((first, second) => second.soldCount - first.soldCount || first.id - second.id).slice(0, 8), [filteredGames, getListingsForGame]);
  const discountHighlights = useMemo<DiscoveryItem[]>(() => {
    const filteredGameIds = new Set(filteredGames.map((game) => game.id));
    const bestByGame = new Map<number, DiscoveryItem>();
    offers.forEach((offer) => offer.listings?.forEach((listing) => {
      const gameId = listing.game?.id ?? listing.gameId;
      const discount = Number(offer.discountPercentage ?? getListingDiscountPercentage(listing));
      const price = getListingDisplayPrice(listing);
      const platformName = normalizeText(getListingPlatformName(listing));
      if (!gameId || !filteredGameIds.has(gameId) || (selectedPlatformSet.size > 0 && !selectedPlatformSet.has(platformName)) || discount <= 0 || price <= 0) return;
      const current = bestByGame.get(gameId);
      const next = { id: gameId, title: listing.game?.title ?? offer.name ?? "Jogo em oferta", discount, price, coverImageUrl: listing.game?.coverImageUrl };
      if (!current || (next.discount ?? 0) > (current.discount ?? 0) || (next.discount === current.discount && next.price < (current.price ?? Infinity))) bestByGame.set(gameId, next);
    }));
    return Array.from(bestByGame.values()).sort((first, second) => (second.discount ?? 0) - (first.discount ?? 0) || (first.price ?? Infinity) - (second.price ?? Infinity)).slice(0, 8);
  }, [filteredGames, offers, selectedPlatformSet]);
  const shouldShowHighlightRail = discountHighlights.length === 0 || width >= 700;

  const handleSearch = useCallback((value: string) => { setSearchDraft(value); setQuery(value.trim().toLowerCase()); }, []);
  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);
  const refresh = async () => { setRefreshing(true); setAttempt((current) => current + 1); setRefreshing(false); };

  const renderGame = useCallback<ListRenderItem<GameSummary>>(({ item }) => (
    <View style={{ width: gridItemWidth, minWidth: 0 }}>
      <ProductCard
        game={item}
        listings={getListingsForGame(item.id)}
        isFavorite={favoriteIds.includes(item.id)}
        pendingFavorite={pendingFavoriteId === item.id}
        onOpen={openGameDetails}
        onToggleFavorite={toggleFavorite}
      />
    </View>
  ), [favoriteIds, getListingsForGame, gridItemWidth, openGameDetails, pendingFavoriteId, toggleFavorite]);

  const catalogHeader = useMemo(() => (
    <>
      {games.length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyTitle}>Nenhum jogo disponível.</Text><Text style={styles.muted}>O catálogo ainda não possui jogos para mostrar.</Text></View> : null}
      {games.length > 0 ? <>
        <View style={styles.searchField}><Ionicons name="search" size={19} color="#67e8f9" /><TextInput value={searchDraft} onChangeText={handleSearch} returnKeyType="search" placeholder="Busque um jogo, gênero ou categoria" placeholderTextColor="#94a3b8" style={styles.searchInput} accessibilityLabel="Buscar no catálogo" />{searchDraft ? <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => handleSearch("")} style={styles.clearSearch}><Ionicons name="close-circle" size={20} color="#cbd5e1" /></Pressable> : null}</View>
        {filteredGames.length > 0 && (discountHighlights.length > 0 || highlightGames.length > 0) ? <View style={styles.discovery}>{discountHighlights.length > 0 ? <DiscoveryRail title="Ofertas para explorar" items={discountHighlights} cardWidth={railCardWidth} onOpen={openGameDetails} /> : null}{highlightGames.length > 0 && shouldShowHighlightRail ? <DiscoveryRail title="Em alta no catálogo" items={highlightGames} cardWidth={railCardWidth} onOpen={openGameDetails} /> : null}{offersError ? <Text style={styles.offerWarning}>As ofertas podem estar incompletas. Puxe a tela para atualizar.</Text> : null}</View> : null}
        {filteredGames.length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyTitle}>Nenhum jogo encontrado.</Text><Text style={styles.muted}>Tente outro termo ou remova alguns filtros para ampliar os resultados.</Text></View> : null}
        {filteredGames.length > 0 ? <View style={styles.resultHeader}><View><Text accessibilityRole="header" style={styles.sectionTitle}>Todos os jogos</Text><Text style={styles.resultText}>{filteredGames.length} {filteredGames.length === 1 ? "jogo encontrado" : "jogos encontrados"}{query ? ` para “${searchDraft.trim()}”` : ""}</Text></View><Text style={styles.pageText}>{currentPage}/{totalPages}</Text></View> : null}
      </> : null}
    </>
  ), [currentPage, discountHighlights, filteredGames.length, games.length, handleSearch, highlightGames, openGameDetails, offersError, query, railCardWidth, searchDraft, shouldShowHighlightRail, totalPages]);

  const catalogFooter = useMemo(() => filteredGames.length > 0 && totalPages > 1 ? (
    <View style={styles.pagination}><Pressable accessibilityRole="button" accessibilityLabel="Página anterior" disabled={currentPage <= 1} onPress={() => handlePageChange(Math.max(1, currentPage - 1))} style={[styles.pageButton, currentPage <= 1 && styles.disabled]}><Ionicons name="chevron-back" size={18} color="#e2e8f0" /></Pressable><Text style={styles.pageIndicator}>Página {currentPage} de {totalPages}</Text><Pressable accessibilityRole="button" accessibilityLabel="Próxima página" disabled={currentPage >= totalPages} onPress={() => handlePageChange(Math.min(totalPages, currentPage + 1))} style={[styles.pageButton, currentPage >= totalPages && styles.disabled]}><Ionicons name="chevron-forward" size={18} color="#e2e8f0" /></Pressable></View>
  ) : null, [currentPage, filteredGames.length, handlePageChange, totalPages]);

  if (loading) return <View style={styles.stateCard}><ActivityIndicator color="#67e8f9" /><Text style={styles.stateText}>Preparando o catálogo...</Text></View>;
  if (error) return <View style={styles.errorCard}><Ionicons name="cloud-offline-outline" size={28} color="#fda4af" /><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => setAttempt((current) => current + 1)} style={styles.retryButton}><Text style={styles.retryButtonText}>Tentar novamente</Text></Pressable></View>;
  return <FlatList
    ref={listRef}
    key={gridColumns}
    data={games.length > 0 ? paginatedGames : []}
    renderItem={renderGame}
    keyExtractor={(item) => String(item.id)}
    numColumns={games.length > 0 ? gridColumns : 1}
    ListHeaderComponent={catalogHeader}
    ListFooterComponent={catalogFooter}
    contentContainerStyle={[styles.content, { paddingHorizontal: contentPadding }]}
    columnWrapperStyle={games.length > 0 ? [styles.gridRow, { columnGap: gridGap }] : undefined}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor="#67e8f9" colors={["#2563eb"]} />}
    initialNumToRender={Math.min(PAGE_SIZE, gridColumns * 2)}
    maxToRenderPerBatch={gridColumns * 2}
    windowSize={5}
    removeClippedSubviews={Platform.OS === "android"}
  />;
}

function DiscoveryRail({ title, items, cardWidth, onOpen }: { title: string; items: DiscoveryItem[]; cardWidth: number; onOpen: (gameId: number) => void }) {
  const renderItem = useCallback<ListRenderItem<DiscoveryItem>>(({ item }) => (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${item.title}`} onPress={() => onOpen(item.id)} style={({ pressed }) => [styles.railCard, { width: cardWidth }, pressed && styles.pressed]}>
      {item.coverImageUrl ? <Image source={{ uri: resolveAssetUrl(item.coverImageUrl, "") }} style={styles.railCover} resizeMethod="resize" fadeDuration={0} resizeMode="cover" /> : <View style={styles.railCover} />}
      <View style={styles.railScrim} />
      {item.discount ? <Text style={styles.railDiscount}>-{item.discount}%</Text> : null}
      <View style={styles.railCopy}><Text style={styles.railGame} numberOfLines={2}>{item.title}</Text><Text style={styles.railPrice}>{item.price ? `A partir de ${toMoney(item.price)}` : "Sem estoque"}</Text></View>
    </Pressable>
  ), [cardWidth, onOpen]);

  return <View style={styles.rail}><Text accessibilityRole="header" style={styles.railTitle}>{title}</Text><FlatList data={items} renderItem={renderItem} keyExtractor={(item) => `${title}-${item.id}`} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railList} initialNumToRender={4} maxToRenderPerBatch={4} windowSize={3} removeClippedSubviews getItemLayout={(_, index) => ({ length: cardWidth + 12, offset: (cardWidth + 12) * index, index })} /></View>;
}

const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 1120, alignSelf: "center", paddingBottom: 36 }, stateCard: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#020617" }, stateText: { color: "#cbd5e1", fontSize: 14 },
  errorCard: { flex: 1, margin: 16, padding: 24, alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderColor: "rgba(244,63,94,0.35)", borderRadius: 18, backgroundColor: "rgba(127,29,29,0.2)" }, errorText: { color: "#fecdd3", fontSize: 14, lineHeight: 21, textAlign: "center" }, retryButton: { minHeight: 44, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(253,164,175,0.5)", borderRadius: 12 }, retryButtonText: { color: "#fff1f2", fontSize: 13, fontWeight: "800" },
  emptyCard: { marginTop: 4, padding: 20, borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#0f172a" }, emptyTitle: { color: "#ffffff", fontSize: 16, fontWeight: "800" }, muted: { marginTop: 6, color: "#94a3b8", fontSize: 14, lineHeight: 21 },
  searchField: { minHeight: 54, paddingHorizontal: 14, borderWidth: 1, borderColor: "#334155", borderRadius: 14, backgroundColor: "#0f172a", flexDirection: "row", alignItems: "center", gap: 9 }, searchInput: { flex: 1, minHeight: 50, color: "#ffffff", fontSize: 15 }, clearSearch: { width: 38, height: 42, alignItems: "center", justifyContent: "center" },
  discovery: { marginTop: 26 }, rail: { marginBottom: 24 }, railTitle: { marginBottom: 11, color: "#f8fafc", fontSize: 19, lineHeight: 24, fontWeight: "900", letterSpacing: -0.35 }, railList: { gap: 12, paddingRight: 16 }, railCard: { height: 144, overflow: "hidden", justifyContent: "flex-end", borderWidth: 1, borderColor: "#334155", borderRadius: 16, backgroundColor: "#0f172a" }, railCover: { ...StyleSheet.absoluteFill, width: undefined, height: undefined, backgroundColor: "#081120" }, railScrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(2,6,23,0.24)" }, railCopy: { padding: 12 }, railGame: { color: "#ffffff", fontSize: 14, lineHeight: 18, fontWeight: "900" }, railPrice: { marginTop: 4, color: "#a7f3d0", fontSize: 11, fontWeight: "800" }, railDiscount: { position: "absolute", top: 10, left: 10, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 8, backgroundColor: "#047857", color: "#ecfdf5", fontSize: 11, fontWeight: "900" }, offerWarning: { marginTop: -13, color: "#fde68a", fontSize: 12, lineHeight: 18 },
  resultHeader: { marginTop: 2, marginBottom: 14, paddingTop: 18, borderTopWidth: 1, borderTopColor: "#1e293b", flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }, sectionTitle: { color: "#ffffff", fontSize: 23, lineHeight: 28, fontWeight: "900", letterSpacing: -0.5 }, resultText: { marginTop: 4, color: "#94a3b8", fontSize: 12, lineHeight: 18 }, pageText: { minWidth: 38, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: "#172554", color: "#bfdbfe", fontSize: 11, fontWeight: "800", textAlign: "center" },
  gridRow: { justifyContent: "flex-start" }, pagination: { marginTop: 22, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 }, pageButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a" }, pageIndicator: { minWidth: 88, color: "#cbd5e1", fontSize: 13, fontWeight: "800", textAlign: "center" }, disabled: { opacity: 0.45 }, pressed: { opacity: 0.76 },
});
