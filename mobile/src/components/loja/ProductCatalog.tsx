import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useAuth } from "../../contexts/useAuth";
import api from "../../services/api";
import { ApiError } from "../../services/http";
import ProductCard from "./ProductCard";
import { loadCatalogData } from "./catalogData";
import type { CartFeedback, GameSummary, ListingMap, OfferItem, PaginatedResponse, WishlistResponse } from "./store.types";
import { buildCatalogState, filterGames, getListingDiscountPercentage, getListingDisplayPrice, getRequestErrorMessage, getExplicitlySelectedListing, normalizeText, PAGE_SIZE, toMoney } from "./store.utils";

type ProductCatalogProps = { selectedPlatforms: string[]; selectedCategories: string[] };

export default function ProductCatalog({ selectedPlatforms, selectedCategories }: ProductCatalogProps) {
  const { isAuthenticated, isReady } = useAuth();
  const { width } = useWindowDimensions();
  const [games, setGames] = useState<GameSummary[]>([]);
  const [listingByGame, setListingByGame] = useState<ListingMap>(new Map());
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [cartListingIds, setCartListingIds] = useState<number[]>([]);
  const [selectedListingByGame, setSelectedListingByGame] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState<CartFeedback | null>(null);
  const [pendingFavoriteId, setPendingFavoriteId] = useState<number | null>(null);
  const [pendingCartGameId, setPendingCartGameId] = useState<number | null>(null);
  const [searchDraft, setSearchDraft] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [offersError, setOffersError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const selectedPlatformSet = useMemo(() => new Set(selectedPlatforms.map(normalizeText)), [selectedPlatforms]);
  const filteredGames = useMemo(() => filterGames(games, selectedCategories, selectedPlatforms, query), [games, query, selectedCategories, selectedPlatforms]);
  const totalPages = Math.max(1, Math.ceil(filteredGames.length / PAGE_SIZE));
  const paginatedGames = useMemo(() => filteredGames.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredGames, page]);
  const isExpanded = width >= 700;

  useEffect(() => { setPage(1); }, [query, selectedCategories, selectedPlatforms, games]);

  useEffect(() => {
    let active = true;
    const loadCatalog = async () => {
      try {
        setLoading(true);
        setError("");
        const { games: gamesData, listings: listingsData } = await loadCatalogData();
        const catalog = buildCatalogState(gamesData, listingsData.filter((listing) => listing.isActive !== false));
        if (active) {
          setGames(catalog.games);
          setListingByGame(catalog.listingByGame);
          setFeedback(null);
        }
      } catch (loadError) {
        if (active) {
          setGames([]);
          setListingByGame(new Map());
          setError(getRequestErrorMessage(loadError, "Não foi possível carregar os produtos no momento."));
        }
      } finally {
        if (active) setLoading(false);
      }
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
      } catch {
        if (active) {
          setOffers([]);
          setOffersError(true);
        }
      }
    };
    void loadOffers();
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      setFavoriteIds([]);
      setCartListingIds([]);
      return;
    }

    let active = true;
    const loadUserSelections = async () => {
      try {
        const [wishlist, cart] = await Promise.all([
          api.get<WishlistResponse>("/wishlists"),
          api.get<{ items: { listingId: number }[] }>("/cart"),
        ]);
        if (active) {
          setFavoriteIds((wishlist.items ?? []).map((item) => item.gameId));
          setCartListingIds((cart.items ?? []).map((item) => item.listingId));
        }
      } catch {
        if (active) {
          setFavoriteIds([]);
          setCartListingIds([]);
        }
      }
    };
    void loadUserSelections();
    return () => { active = false; };
  }, [isAuthenticated, isReady]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback((current) => current?.gameId === feedback.gameId ? null : current), 3500);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const askLogin = () => {
    Alert.alert("Entre para continuar", "Para adicionar aos favoritos ou ao carrinho, faça login na sua conta.", [
      { text: "Agora não", style: "cancel" },
      { text: "Entrar", onPress: () => router.push({ pathname: "/login", params: { from: "/(tabs)/loja" } } as never) },
    ]);
  };

  const openGameDetails = (gameId: number) => {
    router.push({ pathname: "/loja/[gameId]", params: { gameId: String(gameId) } } as never);
  };

  const getListingsForGame = (gameId: number) => {
    const listings = listingByGame.get(gameId) ?? [];
    if (selectedPlatformSet.size === 0) return listings;
    return listings.filter((listing) => selectedPlatformSet.has(normalizeText(String(listing.platform?.name ?? ""))));
  };

  const toggleFavorite = async (gameId: number) => {
    if (!isAuthenticated) { askLogin(); return; }
    const isFavorite = favoriteIds.includes(gameId);
    try {
      setPendingFavoriteId(gameId);
      if (isFavorite) {
        await api.delete(`/wishlists/${gameId}`);
        setFavoriteIds((current) => current.filter((id) => id !== gameId));
      } else {
        await api.post(`/wishlists/${gameId}`, {});
        setFavoriteIds((current) => [...current, gameId]);
      }
    } catch (favoriteError) {
      setFeedback({ gameId, tone: "error", message: getRequestErrorMessage(favoriteError, "Não foi possível atualizar os favoritos agora.") });
    } finally {
      setPendingFavoriteId(null);
    }
  };

  const selectListing = (gameId: number, listingId: number) => {
    setSelectedListingByGame((current) => ({ ...current, [gameId]: listingId }));
    setFeedback((current) => current?.gameId === gameId ? null : current);
  };

  const markOutOfStock = (gameId: number, listingId: number) => {
    setListingByGame((current) => {
      const listings = current.get(gameId);
      if (!listings) return current;
      const next = new Map(current);
      next.set(gameId, listings.map((listing) => listing.id === listingId ? { ...listing, stock: { ...listing.stock, available: 0 } } : listing));
      return next;
    });
  };

  const addToCart = async (gameId: number, listingId: number) => {
    if (!isAuthenticated) { askLogin(); return; }
    try {
      setFeedback(null);
      setPendingCartGameId(gameId);
      await api.post(`/cart/${listingId}`, {});
      setCartListingIds((current) => current.includes(listingId) ? current : [...current, listingId]);
      setFeedback({ gameId, tone: "success", message: "Item adicionado ao carrinho." });
    } catch (cartError) {
      if (cartError instanceof ApiError && cartError.payload?.code === "OUT_OF_STOCK") markOutOfStock(gameId, listingId);
      setFeedback({ gameId, tone: "error", message: getRequestErrorMessage(cartError, "Não foi possível adicionar o item ao carrinho.") });
    } finally {
      setPendingCartGameId(null);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    setAttempt((current) => current + 1);
    setRefreshing(false);
  };

  const highlightGames = useMemo(() => filteredGames.map((game) => {
    const listings = listingByGame.get(game.id) ?? [];
    const soldCount = listings.reduce((sum, listing) => sum + Math.max(0, Number(listing.stock?.sold ?? 0)), 0);
    const lowestPrice = listings.reduce<number | null>((lowest, listing) => {
      const price = getListingDisplayPrice(listing);
      return Number.isFinite(price) && price > 0 && (lowest === null || price < lowest) ? price : lowest;
    }, null);
    return { game, soldCount, lowestPrice };
  }).sort((a, b) => b.soldCount - a.soldCount || a.game.id - b.game.id).slice(0, 8), [filteredGames, listingByGame]);

  const discountHighlights = useMemo(() => {
    type DiscountHighlight = { id: number; title: string; discount: number; price: number; coverImageUrl?: string };
    const bestByGame = new Map<number, DiscountHighlight>();
    offers.forEach((offer) => offer.listings?.forEach((listing) => {
      const gameId = listing.game?.id ?? listing.gameId;
      const discount = Number(offer.discountPercentage ?? getListingDiscountPercentage(listing));
      const price = getListingDisplayPrice(listing);
      if (!gameId || discount <= 0 || price <= 0) return;
      const current = bestByGame.get(gameId);
      const next = { id: gameId, title: listing.game?.title ?? offer.name ?? "Jogo em oferta", discount, price, coverImageUrl: listing.game?.coverImageUrl };
      if (!current || discount > current.discount || (discount === current.discount && price < current.price)) bestByGame.set(gameId, next);
    }));
    return Array.from(bestByGame.values()).sort((a, b) => b.discount - a.discount || a.price - b.price).slice(0, 8);
  }, [offers]);

  if (loading) {
    return <View style={styles.stateCard}><ActivityIndicator color="#67e8f9" /><Text style={styles.stateText}>Carregando produtos...</Text></View>;
  }

  if (error) {
    return <View style={styles.errorCard}><Ionicons name="cloud-offline-outline" size={28} color="#fda4af" /><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => setAttempt((current) => current + 1)} style={styles.retryButton}><Text style={styles.retryButtonText}>Tentar novamente</Text></Pressable></View>;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor="#67e8f9" colors={["#2563eb"]} />}
    >
      {games.length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyTitle}>Nenhum produto encontrado.</Text><Text style={styles.muted}>O catálogo ainda não possui jogos disponíveis.</Text></View> : null}
      {games.length > 0 ? (
        <>
          <View style={styles.searchRow}>
            <View style={styles.searchField}>
              <Ionicons name="search" size={19} color="#64748b" />
              <TextInput value={searchDraft} onChangeText={setSearchDraft} onSubmitEditing={() => { setQuery(searchDraft.trim().toLowerCase()); setPage(1); }} returnKeyType="search" placeholder="Buscar por nome, gênero ou categoria" placeholderTextColor="#64748b" style={styles.searchInput} accessibilityLabel="Buscar no catálogo" />
              {searchDraft ? <Pressable accessibilityLabel="Limpar busca" onPress={() => { setSearchDraft(""); setQuery(""); }} style={styles.clearSearch}><Ionicons name="close-circle" size={19} color="#94a3b8" /></Pressable> : null}
            </View>
            <Pressable onPress={() => { setQuery(searchDraft.trim().toLowerCase()); setPage(1); }} style={styles.searchButton}><Text style={styles.searchButtonText}>Buscar</Text></Pressable>
          </View>

          {filteredGames.length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyTitle}>Nenhum jogo encontrado.</Text><Text style={styles.muted}>Tente outro termo ou remova alguns filtros para ampliar os resultados.</Text></View> : null}

          {filteredGames.length > 0 ? (
            <>
              <View style={styles.resultHeader}><Text style={styles.resultText}><Text style={styles.resultStrong}>{filteredGames.length}</Text> {filteredGames.length === 1 ? "jogo encontrado" : "jogos encontrados"}{query ? ` para “${searchDraft.trim()}”` : ""}.</Text><Text style={styles.pageText}>Página {page} de {totalPages}</Text></View>
              <View style={styles.sectionIntro}><Text style={styles.sectionTitle}>Todos os jogos</Text><Text style={styles.sectionSubtitle}>Escolha uma plataforma para comparar preço e disponibilidade.</Text></View>
              {offersError ? <View style={styles.offerWarning}><Text style={styles.offerWarningText}>Não foi possível carregar as ofertas agora.</Text><Pressable onPress={() => setAttempt((current) => current + 1)}><Text style={styles.offerRetry}>Tentar novamente</Text></Pressable></View> : null}
              <View style={styles.grid}>
                {paginatedGames.map((game) => {
                  const listings = getListingsForGame(game.id);
                  const selectedListing = getExplicitlySelectedListing(listings, selectedListingByGame[game.id]);
                  return <View key={game.id} style={[styles.gridItem, isExpanded && styles.gridItemExpanded]}><ProductCard game={game} listings={listings} selectedListing={selectedListing} inCart={Boolean(selectedListing && cartListingIds.includes(selectedListing.id))} isFavorite={favoriteIds.includes(game.id)} pendingFavorite={pendingFavoriteId === game.id} pendingCart={pendingCartGameId === game.id} feedback={feedback?.gameId === game.id ? feedback : null} onOpen={openGameDetails} onToggleFavorite={(gameId) => void toggleFavorite(gameId)} onSelectListing={selectListing} onAddToCart={(gameId, listingId) => void addToCart(gameId, listingId)} /></View>;
                })}
              </View>
              {totalPages > 1 ? <View style={styles.pagination}><Pressable disabled={page <= 1} onPress={() => setPage((current) => Math.max(1, current - 1))} style={[styles.pageButton, page <= 1 && styles.disabled]}><Ionicons name="chevron-back" size={18} color="#e2e8f0" /></Pressable><Text style={styles.pageIndicator}>{page} / {totalPages}</Text><Pressable disabled={page >= totalPages} onPress={() => setPage((current) => Math.min(totalPages, current + 1))} style={[styles.pageButton, page >= totalPages && styles.disabled]}><Ionicons name="chevron-forward" size={18} color="#e2e8f0" /></Pressable></View> : null}

              {(highlightGames.length > 0 || discountHighlights.length > 0) ? <View style={styles.discovery}><Text style={styles.discoveryTitle}>Descobrir destaques e ofertas</Text>{highlightGames.length > 0 ? <><Text style={styles.discoveryLabel}>Mais procurados</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightList}>{highlightGames.map(({ game, lowestPrice }) => <Pressable key={`top-${game.id}`} onPress={() => openGameDetails(game.id)} style={styles.highlightCard}><Text style={styles.highlightTitle} numberOfLines={2}>{game.title}</Text><Text style={styles.highlightMeta}>{lowestPrice ? `a partir de ${toMoney(lowestPrice)}` : "Confira as opções"}</Text></Pressable>)}</ScrollView></> : null}{discountHighlights.length > 0 ? <><Text style={styles.discoveryLabel}>Ofertas</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightList}>{discountHighlights.map((item) => <Pressable key={`offer-${item.id}`} onPress={() => openGameDetails(item.id)} style={[styles.highlightCard, styles.offerCard]}><Text style={styles.offerTag}>-{item.discount}%</Text><Text style={styles.highlightTitle} numberOfLines={2}>{item.title}</Text><Text style={styles.highlightMeta}>{toMoney(item.price)}</Text></Pressable>)}</ScrollView></> : null}</View> : null}
            </>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 30 },
  stateCard: { minHeight: 180, alignItems: "center", justifyContent: "center", gap: 12, borderWidth: 1, borderColor: "#1e293b", borderRadius: 18, backgroundColor: "#0f172a" },
  stateText: { color: "#cbd5e1", fontSize: 14 },
  errorCard: { minHeight: 210, alignItems: "center", justifyContent: "center", gap: 10, padding: 24, borderWidth: 1, borderColor: "rgba(244,63,94,0.35)", borderRadius: 18, backgroundColor: "rgba(127,29,29,0.2)" },
  errorText: { color: "#fecdd3", fontSize: 14, lineHeight: 21, textAlign: "center" },
  retryButton: { minHeight: 44, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(253,164,175,0.5)", borderRadius: 12 },
  retryButtonText: { color: "#fff1f2", fontSize: 13, fontWeight: "800" },
  emptyCard: { marginTop: 4, padding: 20, borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#0f172a" },
  emptyTitle: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  muted: { marginTop: 6, color: "#94a3b8", fontSize: 14, lineHeight: 21 },
  searchRow: { marginBottom: 14, flexDirection: "row", gap: 8 },
  searchField: { flex: 1, minHeight: 52, paddingHorizontal: 13, borderWidth: 1, borderColor: "#334155", borderRadius: 13, backgroundColor: "#020617", flexDirection: "row", alignItems: "center", gap: 8 },
  searchInput: { flex: 1, minHeight: 50, color: "#ffffff", fontSize: 15 },
  clearSearch: { width: 36, height: 40, alignItems: "center", justifyContent: "center" },
  searchButton: { minHeight: 52, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#2563eb" },
  searchButtonText: { color: "#ffffff", fontSize: 13, fontWeight: "800" },
  resultHeader: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "#1e293b", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  resultText: { flex: 1, color: "#cbd5e1", fontSize: 13, lineHeight: 19 },
  resultStrong: { color: "#ffffff", fontWeight: "900" },
  pageText: { color: "#64748b", fontSize: 11, fontWeight: "700" },
  sectionIntro: { marginTop: 16, marginBottom: 12 },
  sectionTitle: { color: "#ffffff", fontSize: 20, fontWeight: "900", letterSpacing: -0.3 },
  sectionSubtitle: { marginTop: 4, color: "#94a3b8", fontSize: 13, lineHeight: 19 },
  offerWarning: { marginBottom: 12, padding: 12, borderWidth: 1, borderColor: "rgba(245,158,11,0.35)", borderRadius: 12, backgroundColor: "rgba(245,158,11,0.1)" },
  offerWarningText: { color: "#fde68a", fontSize: 13 },
  offerRetry: { marginTop: 6, color: "#fef3c7", fontSize: 13, fontWeight: "800", textDecorationLine: "underline" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: { width: "100%" },
  gridItemExpanded: { width: "48.3%" },
  pagination: { marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 },
  pageButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a" },
  pageIndicator: { minWidth: 58, color: "#cbd5e1", fontSize: 13, fontWeight: "800", textAlign: "center" },
  discovery: { marginTop: 26, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#1e293b" },
  discoveryTitle: { color: "#ffffff", fontSize: 18, fontWeight: "900" },
  discoveryLabel: { marginTop: 17, marginBottom: 9, color: "#94a3b8", fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  highlightList: { gap: 10 },
  highlightCard: { width: 150, minHeight: 92, padding: 12, borderWidth: 1, borderColor: "#334155", borderRadius: 14, backgroundColor: "#0f172a" },
  offerCard: { borderColor: "rgba(16,185,129,0.35)" },
  offerTag: { alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, backgroundColor: "rgba(16,185,129,0.16)", color: "#a7f3d0", fontSize: 11, fontWeight: "900" },
  highlightTitle: { marginTop: 7, color: "#f8fafc", fontSize: 13, fontWeight: "800", lineHeight: 17 },
  highlightMeta: { marginTop: 5, color: "#93c5fd", fontSize: 11, fontWeight: "700" },
  disabled: { opacity: 0.45 },
});
