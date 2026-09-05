import { Text } from "@/src/components/ui/Typography";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { notifyCartChanged, subscribeToCartChanges } from "../../contexts/cartEvents";
import { useAuth } from "../../contexts/useAuth";
import DetailsGallery from "./DetailsGallery";
import DetailsSidebar from "./DetailsSidebar";
import Rating from "./Rating";
import type { CartResponse, GameDetails } from "./store.types";
import { getGalleryImages, getListingAvailableStock, getListingDisplayPrice, getRequestErrorMessage, getSelectedListing, toMoney } from "./store.utils";
import api from "../../services/api";
import { resolveAssetUrl } from "../../services/assets";

export default function ProductDetails() {
  const { gameId } = useLocalSearchParams<{ gameId?: string | string[] }>();
  const insets = useSafeAreaInsets();
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
  const [busyCheckout, setBusyCheckout] = useState(false);

  const listings = useMemo(() => details?.platformListings ?? [], [details?.platformListings]);
  const currentListing = useMemo(() => getSelectedListing(listings, selectedListingId), [listings, selectedListingId]);
  const currentListingId = Number(currentListing?.id ?? 0);
  const availableStock = getListingAvailableStock(currentListing);
  const coverImage = resolveAssetUrl(details?.coverImageUrl, "");
  const galleryImages = useMemo(() => getGalleryImages(coverImage, (details?.images ?? []).map((image) => ({ ...image, imageUrl: resolveAssetUrl(image.imageUrl, "") }))), [coverImage, details?.images]);
  const activeImage = galleryImages.includes(selectedImage) ? selectedImage : galleryImages[0] ?? coverImage;
  const title = details?.title ?? "Detalhes do jogo";
  const description = details?.description ?? "Escolha sua plataforma e veja as opções disponíveis para este jogo.";
  const longDescription = details?.longDescription ?? description;
  const labels = [...(details?.categories ?? []), ...(details?.tags ?? [])];
  const inCart = currentListingId > 0 && cartListingIds.includes(currentListingId);
  const canStartCheckout = Boolean(currentListing) && availableStock > 0;

  const loadDetails = useCallback(async () => {
    if (!validId) { setError("Jogo inválido."); setLoading(false); return; }
    try {
      setLoading(true);
      setError("");
      setDetails(await api.get<GameDetails>(`/games/${parsedGameId}/details`));
    } catch (loadError) {
      setDetails(null);
      setError(getRequestErrorMessage(loadError, "Não foi possível carregar os detalhes do jogo."));
    } finally { setLoading(false); }
  }, [parsedGameId, validId]);

  useEffect(() => { void Promise.resolve().then(loadDetails); }, [loadDetails]);
  const loadCartSelections = useCallback(async () => {
    if (!isReady || !isAuthenticated) {
      setCartListingIds([]);
      return;
    }

    try {
      const data = await api.get<CartResponse>("/cart");
      setCartListingIds((data.items ?? []).map((item) => item.listingId));
    } catch {
      setCartListingIds([]);
    }
  }, [isAuthenticated, isReady]);

  useEffect(() => {
    void Promise.resolve().then(loadCartSelections);
    return subscribeToCartChanges(() => void loadCartSelections());
  }, [loadCartSelections]);

  useFocusEffect(useCallback(() => {
    void loadCartSelections();
  }, [loadCartSelections]));

  const askLogin = () => Alert.alert("Entre para continuar", "Essa ação exige login. Deseja entrar agora?", [{ text: "Agora não", style: "cancel" }, { text: "Entrar", onPress: () => router.push({ pathname: "/login", params: { from: `/loja/${parsedGameId}` } } as never) }]);
  const goBack = () => router.canGoBack() ? router.back() : router.replace("/(tabs)/loja" as never);
  const syncCart = (listingId: number) => setCartListingIds((current) => current.includes(listingId) ? current : [...current, listingId]);

  const addCurrentToCart = async () => {
    if (!currentListingId || inCart) return;
    if (!isAuthenticated) { askLogin(); return; }
    try {
      setActionError("");
      setBusyCart(true);
      await api.post(`/cart/${currentListingId}`, {});
      syncCart(currentListingId);
      notifyCartChanged();
    } catch (cartError) {
      setActionError(getRequestErrorMessage(cartError, "Não foi possível adicionar o item ao carrinho."));
    } finally { setBusyCart(false); }
  };

  const startCheckout = async () => {
    if (!currentListingId) return;
    if (!isAuthenticated) { askLogin(); return; }
    try {
      setActionError("");
      setBusyCheckout(true);
      if (!inCart) {
        await api.post(`/cart/${currentListingId}`, {});
        syncCart(currentListingId);
        notifyCartChanged();
      }
      router.push("/checkout" as never);
    } catch (checkoutError) {
      setActionError(getRequestErrorMessage(checkoutError, "Não foi possível abrir o checkout agora."));
    } finally { setBusyCheckout(false); }
  };

  const stepImage = (direction: -1 | 1) => {
    if (galleryImages.length <= 1) return;
    const current = Math.max(0, galleryImages.findIndex((image) => image === activeImage));
    setSelectedImage(galleryImages[(current + direction + galleryImages.length) % galleryImages.length] ?? coverImage);
  };
  const refresh = async () => { setRefreshing(true); await loadDetails(); setRefreshing(false); };

  return <SafeAreaView style={styles.safeArea} edges={["top"]}>
    <StatusBar barStyle="light-content" />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor="#67e8f9" colors={["#2563eb"]} />}>
      <Pressable onPress={goBack} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Voltar para loja"><Ionicons name="arrow-back" size={18} color="#cbd5e1" /><Text style={styles.backText}>Voltar para loja</Text></Pressable>
      {loading ? <View style={styles.loading}><ActivityIndicator color="#67e8f9" /><Text style={styles.loadingText}>Carregando detalhes do jogo...</Text></View> : null}
      {!loading && error ? <View style={styles.errorCard}><Text style={styles.errorTitle}>Falha ao carregar</Text><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => void loadDetails()} style={styles.retryButton}><Text style={styles.retryText}>Tentar novamente</Text></Pressable></View> : null}
      {!loading && !error && details ? <>
        <DetailsGallery gameTitle={title} galleryImages={galleryImages} selectedImage={activeImage} onSelectImage={setSelectedImage} onStepImage={stepImage} />
        <View style={styles.infoPanel}><Text style={styles.gameTitle}>{title}</Text><Text style={styles.description}>{description}</Text>{labels.length > 0 ? <View style={styles.chips}>{labels.map((label) => <Text key={`${label.id}-${label.name}`} style={styles.chip}>{label.name}</Text>)}</View> : null}</View>
        <DetailsSidebar details={details} currentListingId={currentListingId} availableStock={availableStock} inCart={inCart} busyCart={busyCart} actionError={actionError} onSelectListing={(listingId) => { setSelectedListingId(listingId); setActionError(""); }} onAddToCart={() => void addCurrentToCart()} />
        <View style={styles.about}><View style={styles.aboutHeader}><Text style={styles.aboutTitle} numberOfLines={1}>Sobre {title}</Text><View accessible accessibilityLabel={details.reviewStats?.totalReviews ? `Avaliação ${Number(details.reviewStats.averageRating ?? 0).toFixed(1)} de 5` : "Ainda sem avaliações"} style={styles.aboutRating}><Ionicons name="star" size={13} color="#64748b" /><Text style={styles.aboutRatingText}>{details.reviewStats?.totalReviews ? Number(details.reviewStats.averageRating ?? 0).toFixed(1).replace(".", ",") : "—"}</Text></View></View><Text style={styles.aboutText}>{longDescription}</Text></View><Rating />
      </> : null}
    </ScrollView>
    {!loading && !error && details ? <View style={[styles.purchaseDock, { paddingBottom: Math.max(insets.bottom, 12) }]}><View style={styles.purchaseSummary}><Text style={styles.purchasePlatform} numberOfLines={1}>{currentListing?.platform?.name ?? "Escolha uma plataforma"}</Text><Text style={styles.purchasePrice}>{currentListing ? toMoney(getListingDisplayPrice(currentListing)) : "Indisponível"}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Finalizar simulação" accessibilityState={{ disabled: busyCheckout || busyCart || !canStartCheckout, busy: busyCheckout }} onPress={() => void startCheckout()} disabled={busyCheckout || busyCart || !canStartCheckout} style={({ pressed }) => [styles.purchaseButton, (pressed || busyCheckout) && styles.pressed, !canStartCheckout && styles.disabled]}><Ionicons name="flash-outline" size={18} color="#ffffff" /><Text style={styles.purchaseButtonText}>{busyCheckout ? "Abrindo checkout..." : "Finalizar simulação"}</Text></Pressable></View> : null}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" }, content: { width: "100%", maxWidth: 920, alignSelf: "center", padding: 20, paddingBottom: 128 },
  backButton: { minHeight: 44, alignSelf: "flex-start", paddingHorizontal: 12, borderWidth: 1, borderColor: "#1e293b", borderRadius: 11, backgroundColor: "#020617", flexDirection: "row", alignItems: "center", gap: 8 }, backText: { color: "#cbd5e1", fontSize: 13, fontWeight: "700" },
  loading: { minHeight: 260, alignItems: "center", justifyContent: "center", gap: 12 }, loadingText: { color: "#cbd5e1", fontSize: 14 }, errorCard: { marginTop: 18, padding: 20, borderWidth: 1, borderColor: "rgba(244,63,94,0.35)", borderRadius: 20, backgroundColor: "rgba(127,29,29,0.2)" }, errorTitle: { color: "#ffffff", fontSize: 22, fontWeight: "900" }, errorText: { marginTop: 7, color: "#fecdd3", fontSize: 14, lineHeight: 21 }, retryButton: { minHeight: 44, alignSelf: "flex-start", marginTop: 16, paddingHorizontal: 15, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: "#2563eb" }, retryText: { color: "#ffffff", fontSize: 13, fontWeight: "800" },
  infoPanel: { marginTop: 14, padding: 18, borderWidth: 1, borderColor: "#1e293b", borderRadius: 20, backgroundColor: "#020617" }, gameTitle: { color: "#ffffff", fontSize: 31, fontWeight: "900", lineHeight: 34, letterSpacing: -0.7 }, description: { marginTop: 12, color: "#cbd5e1", fontSize: 14, lineHeight: 22 }, chips: { marginTop: 15, flexDirection: "row", flexWrap: "wrap", gap: 7 }, chip: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(34,211,238,0.25)", borderRadius: 999, backgroundColor: "rgba(34,211,238,0.1)", color: "#cffafe", fontSize: 11, fontWeight: "700" },
  about: { marginTop: 14, padding: 18, borderWidth: 1, borderColor: "#1e293b", borderRadius: 20, backgroundColor: "#020617" }, aboutHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }, aboutTitle: { flex: 1, color: "#ffffff", fontSize: 21, fontWeight: "900" }, aboutRating: { flexDirection: "row", alignItems: "center", gap: 4 }, aboutRatingText: { color: "#64748b", fontSize: 12, fontWeight: "700" }, aboutText: { marginTop: 12, color: "#cbd5e1", fontSize: 14, lineHeight: 23 },
  purchaseDock: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: 1, borderTopColor: "#334155", backgroundColor: "#020617", paddingTop: 12, paddingHorizontal: 20 }, purchaseSummary: { flex: 1, minWidth: 0 }, purchasePlatform: { color: "#94a3b8", fontSize: 12, fontWeight: "700" }, purchasePrice: { marginTop: 2, color: "#ffffff", fontSize: 19, fontWeight: "900" }, purchaseButton: { minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 13, backgroundColor: "#2563eb", paddingHorizontal: 16 }, purchaseButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "900" }, disabled: { opacity: 0.55 }, pressed: { opacity: 0.72 },
});
