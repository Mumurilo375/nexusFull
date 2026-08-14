import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/useAuth";
import api from "../services/api";
import { resolveAssetUrl } from "../services/assets";
import DetailsGallery from "../components/loja/DetailsGallery";
import DetailsSidebar from "../components/loja/DetailsSidebar";
import Rating from "../components/loja/Rating";
import type { CartResponse, GameDetails } from "../components/loja/store.types";
import { formatDate, getGalleryImages, getListingAvailableStock, getRequestErrorMessage, getSelectedListing } from "../components/loja/store.utils";

export default function GameDetailsPage() {
  const { gameId } = useLocalSearchParams<{ gameId?: string | string[] }>();
  const { isAuthenticated, isReady } = useAuth();
  const parsedGameId = Number(Array.isArray(gameId) ? gameId[0] : gameId);
  const validId = Number.isInteger(parsedGameId) && parsedGameId > 0;
  const [details, setDetails] = useState<GameDetails | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [cartListingIds, setCartListingIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyCart, setBusyCart] = useState(false);
  const [busyBuyNow, setBusyBuyNow] = useState(false);
  const listings = useMemo(() => details?.platformListings ?? [], [details?.platformListings]);
  const currentListing = useMemo(() => getSelectedListing(listings, selectedListingId), [listings, selectedListingId]);
  const currentListingId = Number(currentListing?.id ?? 0);
  const availableStock = getListingAvailableStock(currentListing);
  const coverImage = resolveAssetUrl(details?.coverImageUrl, "");
  const galleryImages = useMemo(() => getGalleryImages(coverImage, (details?.images ?? []).map((image) => ({ ...image, imageUrl: resolveAssetUrl(image.imageUrl, "") }))), [coverImage, details?.images]);
  const title = details?.title ?? "Detalhes do jogo";
  const description = details?.description ?? "Escolha sua plataforma e veja as opções disponíveis para este jogo.";
  const longDescription = details?.longDescription ?? description;
  const labels = [...(details?.categories ?? []), ...(details?.tags ?? [])];
  const inCart = currentListingId > 0 && cartListingIds.includes(currentListingId);

  const loadDetails = useCallback(async () => {
    if (!validId) { setError("Jogo inválido."); setLoading(false); return; }
    try {
      setLoading(true);
      setError("");
      const data = await api.get<GameDetails>(`/games/${parsedGameId}/details`);
      setDetails(data);
    } catch (loadError) {
      setDetails(null);
      setError(getRequestErrorMessage(loadError, "Não foi possível carregar os detalhes do jogo."));
    } finally { setLoading(false); }
  }, [parsedGameId, validId]);

  useEffect(() => { void loadDetails(); }, [loadDetails]);

  useEffect(() => {
    if (!isReady || !isAuthenticated) { setCartListingIds([]); return; }
    let active = true;
    const loadCart = async () => {
      try {
        const data = await api.get<CartResponse>("/cart");
        if (active) setCartListingIds((data.items ?? []).map((item) => item.listingId));
      } catch { if (active) setCartListingIds([]); }
    };
    void loadCart();
    return () => { active = false; };
  }, [isAuthenticated, isReady, parsedGameId]);

  useEffect(() => { setSelectedListingId((current) => getSelectedListing(listings, current)?.id ?? null); }, [listings]);
  useEffect(() => { setSelectedImage(galleryImages[0] ?? coverImage); }, [coverImage, galleryImages]);

  const askLogin = () => Alert.alert("Entre para continuar", "Essa ação exige login. Deseja entrar agora?", [{ text: "Agora não", style: "cancel" }, { text: "Entrar", onPress: () => router.push({ pathname: "/login", params: { from: `/loja/${parsedGameId}` } } as never) }]);
  const goBack = () => router.canGoBack() ? router.back() : router.replace("/(tabs)/loja" as never);
  const syncCart = (listingId: number) => setCartListingIds((current) => current.includes(listingId) ? current : [...current, listingId]);

  const addCurrentToCart = async () => {
    if (!currentListingId || inCart) return;
    if (!isAuthenticated) { askLogin(); return; }
    try { setActionError(""); setBusyCart(true); await api.post(`/cart/${currentListingId}`, {}); syncCart(currentListingId); }
    catch (cartError) { setActionError(getRequestErrorMessage(cartError, "Não foi possível adicionar o item ao carrinho.")); }
    finally { setBusyCart(false); }
  };

  const buyNow = async () => {
    if (!currentListingId) return;
    if (!isAuthenticated) { askLogin(); return; }
    try { setActionError(""); setBusyBuyNow(true); if (!inCart) { await api.post(`/cart/${currentListingId}`, {}); syncCart(currentListingId); } router.push("/(tabs)/carrinho" as never); }
    catch (buyError) { setActionError(getRequestErrorMessage(buyError, "Não foi possível iniciar a compra agora.")); }
    finally { setBusyBuyNow(false); }
  };

  const stepImage = (direction: -1 | 1) => { if (galleryImages.length <= 1) return; const current = Math.max(0, galleryImages.findIndex((image) => image === selectedImage)); setSelectedImage(galleryImages[(current + direction + galleryImages.length) % galleryImages.length] ?? coverImage); };
  const refresh = async () => { setRefreshing(true); await loadDetails(); setRefreshing(false); };

  return <SafeAreaView style={styles.safeArea} edges={["top"]}><StatusBar barStyle="light-content" /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor="#67e8f9" colors={["#2563eb"]} />}><Pressable onPress={goBack} style={styles.backButton}><Ionicons name="arrow-back" size={18} color="#cbd5e1" /><Text style={styles.backText}>Voltar para loja</Text></Pressable>{loading ? <View style={styles.loading}><ActivityIndicator color="#67e8f9" /><Text style={styles.loadingText}>Carregando detalhes do jogo...</Text></View> : null}{!loading && error ? <View style={styles.errorCard}><Text style={styles.errorTitle}>Falha ao carregar</Text><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => void loadDetails()} style={styles.retryButton}><Text style={styles.retryText}>Tentar novamente</Text></Pressable></View> : null}{!loading && !error && details ? <><DetailsGallery gameTitle={title} galleryImages={galleryImages} selectedImage={selectedImage} onSelectImage={setSelectedImage} onStepImage={stepImage} /><View style={styles.infoPanel}><Text style={styles.gameTitle}>{title}</Text><Text style={styles.description}>{description}</Text>{labels.length > 0 ? <View style={styles.chips}>{labels.map((label) => <Text key={`${label.id}-${label.name}`} style={styles.chip}>{label.name}</Text>)}</View> : null}<View style={styles.infoGrid}><View style={styles.infoItem}><Ionicons name="calendar-outline" size={17} color="#67e8f9" /><View><Text style={styles.infoLabel}>Lançamento</Text><Text style={styles.infoValue}>{formatDate(details.releaseDate)}</Text></View></View><View style={styles.infoItem}><Ionicons name="star-outline" size={17} color="#67e8f9" /><View><Text style={styles.infoLabel}>Avaliação</Text><Text style={styles.infoValue}>{details.reviewStats?.totalReviews ? `${Number(details.reviewStats.averageRating ?? 0).toFixed(1)} / 5 (${details.reviewStats.totalReviews})` : "Ainda sem avaliações"}</Text></View></View></View></View><DetailsSidebar details={details} currentListingId={currentListingId} availableStock={availableStock} inCart={inCart} busyCart={busyCart} busyBuyNow={busyBuyNow} actionError={actionError} onSelectListing={(listingId) => { setSelectedListingId(listingId); setActionError(""); }} onAddToCart={() => void addCurrentToCart()} onBuyNow={() => void buyNow()} /><View style={styles.about}><Text style={styles.aboutTitle}>Sobre {title}</Text><Text style={styles.aboutText}>{longDescription}</Text></View><Rating /></> : null}</ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 20, paddingBottom: 36 },
  backButton: { minHeight: 44, alignSelf: "flex-start", paddingHorizontal: 12, borderWidth: 1, borderColor: "#1e293b", borderRadius: 11, backgroundColor: "#020617", flexDirection: "row", alignItems: "center", gap: 8 },
  backText: { color: "#cbd5e1", fontSize: 13, fontWeight: "700" },
  loading: { minHeight: 260, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: "#cbd5e1", fontSize: 14 },
  errorCard: { marginTop: 18, padding: 20, borderWidth: 1, borderColor: "rgba(244,63,94,0.35)", borderRadius: 20, backgroundColor: "rgba(127,29,29,0.2)" },
  errorTitle: { color: "#ffffff", fontSize: 22, fontWeight: "900" },
  errorText: { marginTop: 7, color: "#fecdd3", fontSize: 14, lineHeight: 21 },
  retryButton: { minHeight: 44, alignSelf: "flex-start", marginTop: 16, paddingHorizontal: 15, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: "#2563eb" },
  retryText: { color: "#ffffff", fontSize: 13, fontWeight: "800" },
  infoPanel: { marginTop: 14, padding: 18, borderWidth: 1, borderColor: "#1e293b", borderRadius: 20, backgroundColor: "#020617" },
  gameTitle: { color: "#ffffff", fontSize: 31, fontWeight: "900", lineHeight: 34, letterSpacing: -0.7 },
  description: { marginTop: 12, color: "#cbd5e1", fontSize: 14, lineHeight: 22 },
  chips: { marginTop: 15, flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(34,211,238,0.25)", borderRadius: 999, backgroundColor: "rgba(34,211,238,0.1)", color: "#cffafe", fontSize: 11, fontWeight: "700" },
  infoGrid: { marginTop: 18, paddingTop: 15, borderTopWidth: 1, borderTopColor: "#1e293b", flexDirection: "row", flexWrap: "wrap", gap: 18 },
  infoItem: { minWidth: 130, flexDirection: "row", alignItems: "center", gap: 8 },
  infoLabel: { color: "#64748b", fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 },
  infoValue: { marginTop: 3, color: "#e2e8f0", fontSize: 12, fontWeight: "700" },
  about: { marginTop: 14, padding: 18, borderWidth: 1, borderColor: "#1e293b", borderRadius: 20, backgroundColor: "#020617" },
  aboutTitle: { color: "#ffffff", fontSize: 21, fontWeight: "900" },
  aboutText: { marginTop: 12, color: "#cbd5e1", fontSize: 14, lineHeight: 23 },
});
