import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { resolveAssetUrl } from "../../services/assets";
import PlatformLogo from "./PlatformLogo";
import type { CartFeedback, GameSummary, ListingItem } from "./store.types";
import { getListingAvailableStock, getListingDiscountPercentage, getListingDisplayPrice, toMoney } from "./store.utils";

type ProductCardProps = {
  game: GameSummary;
  listings: ListingItem[];
  selectedListing: ListingItem | null;
  inCart: boolean;
  isFavorite: boolean;
  pendingFavorite: boolean;
  pendingCart: boolean;
  feedback?: CartFeedback | null;
  onOpen: (gameId: number) => void;
  onToggleFavorite: (gameId: number) => void;
  onSelectListing: (gameId: number, listingId: number) => void;
  onAddToCart: (gameId: number, listingId: number) => void;
};

export default function ProductCard({ game, listings, selectedListing, inCart, isFavorite, pendingFavorite, pendingCart, feedback, onOpen, onToggleFavorite, onSelectListing, onAddToCart }: ProductCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const discount = getListingDiscountPercentage(selectedListing);
  const finalPrice = getListingDisplayPrice(selectedListing);
  const basePrice = Number(selectedListing?.pricing?.basePrice ?? selectedListing?.price ?? 0);
  const hasStockInfo = Boolean(selectedListing?.stock);
  const availableStock = getListingAvailableStock(selectedListing);
  const isOutOfStock = hasStockInfo && availableStock <= 0;
  const platformName = selectedListing?.platform?.name ?? "";
  const imageUrl = resolveAssetUrl(game.coverImageUrl, "");
  const lowestPrice = listings.reduce<number | null>((lowest, listing) => {
    const price = getListingDisplayPrice(listing);
    return Number.isFinite(price) && price > 0 && (lowest === null || price < lowest) ? price : lowest;
  }, null);

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Abrir detalhes de ${game.title}`} onPress={() => onOpen(game.id)} style={({ pressed }) => [styles.coverButton, pressed && styles.pressed]}>
          {imageUrl && !imageFailed ? <Image source={{ uri: imageUrl }} onError={() => setImageFailed(true)} style={styles.cover} resizeMode="cover" /> : <View style={styles.imageFallback}><Ionicons name="image-outline" size={34} color="#475569" /><Text style={styles.imageFallbackText}>Sem capa</Text></View>}
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} accessibilityState={{ disabled: pendingFavorite, selected: isFavorite }} onPress={() => onToggleFavorite(game.id)} disabled={pendingFavorite} style={({ pressed }) => [styles.favoriteButton, pressed && styles.pressed]}>
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={21} color={isFavorite ? "#fb7185" : "#e2e8f0"} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.category} numberOfLines={1}>{game.categories?.[0]?.name ?? "Sem categoria"}</Text>
        <Pressable accessibilityRole="button" onPress={() => onOpen(game.id)} style={styles.titleButton}>
          <Text style={styles.title} numberOfLines={2}>{game.title}</Text>
        </Pressable>
        {!selectedListing && lowestPrice !== null ? <Text style={styles.startingPrice}>A partir de {toMoney(lowestPrice)}</Text> : null}

        <Text style={styles.fieldLabel}>Plataforma</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={platformName ? `Plataforma ${platformName}` : "Escolher plataforma"} onPress={() => setPickerOpen(true)} disabled={listings.length === 0} style={({ pressed }) => [styles.platformPicker, pressed && styles.pressed, listings.length === 0 && styles.disabled]}>
          {selectedListing ? <PlatformLogo platformName={platformName} iconUrl={selectedListing.platform?.iconUrl} size={32} /> : <Ionicons name="game-controller-outline" size={18} color="#67e8f9" />}
          <Text style={styles.platformText} numberOfLines={1}>{platformName || (listings.length > 0 ? "Escolha uma plataforma" : "Sem plataformas")}</Text>
          <Ionicons name="chevron-down" size={17} color="#64748b" />
        </Pressable>

        {selectedListing ? (
          <View style={styles.priceRow}>
            <View style={styles.priceBlock}>
              {discount > 0 ? <Text style={styles.oldPrice}>{toMoney(basePrice)}</Text> : null}
              <Text style={styles.price}>{Number.isFinite(finalPrice) && finalPrice > 0 ? toMoney(finalPrice) : "Preço indisponível"}</Text>
              <Text style={[styles.stock, isOutOfStock && styles.stockOut]}>{isOutOfStock ? "Sem estoque" : hasStockInfo ? `${availableStock} disponíveis` : "Disponível"}</Text>
            </View>
            {discount > 0 ? <Text style={styles.discount}>-{discount}%</Text> : null}
          </View>
        ) : null}

        <Pressable accessibilityRole="button" accessibilityState={{ disabled: pendingCart || inCart || isOutOfStock }} onPress={() => selectedListing && onAddToCart(game.id, selectedListing.id)} disabled={!selectedListing || pendingCart || inCart || isOutOfStock} style={({ pressed }) => [styles.cartButton, pressed && styles.pressed, (!selectedListing || pendingCart || inCart || isOutOfStock) && styles.disabled]}>
          <Ionicons name={inCart ? "checkmark-circle-outline" : "cart-outline"} size={18} color="#ffffff" />
          <Text style={styles.cartButtonText}>{inCart ? "Já está no carrinho" : pendingCart ? "Adicionando..." : "Adicionar ao carrinho"}</Text>
        </Pressable>

        {feedback ? <Text style={[styles.feedback, feedback.tone === "error" ? styles.feedbackError : styles.feedbackSuccess]}>{feedback.message}</Text> : null}
      </View>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.pickerBackdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.pickerSheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.pickerHeader}><Text style={styles.pickerTitle}>Escolha a plataforma</Text><Pressable onPress={() => setPickerOpen(false)} style={styles.pickerClose}><Ionicons name="close" size={20} color="#e2e8f0" /></Pressable></View>
            {listings.map((listing) => {
              const selected = listing.id === selectedListing?.id;
              const stock = getListingAvailableStock(listing);
              return (
                <Pressable key={listing.id} onPress={() => { onSelectListing(game.id, listing.id); setPickerOpen(false); }} style={({ pressed }) => [styles.listingOption, selected && styles.listingOptionSelected, pressed && styles.pressed]}>
                  <PlatformLogo platformName={listing.platform?.name} iconUrl={listing.platform?.iconUrl} size={42} />
                  <View style={styles.listingInfo}><Text style={styles.listingName}>{listing.platform?.name ?? "Plataforma"}</Text><Text style={styles.listingPrice}>{toMoney(getListingDisplayPrice(listing))} · {stock > 0 ? `${stock} disponíveis` : "Sem estoque"}</Text></View>
                  {selected ? <Ionicons name="checkmark-circle" size={21} color="#60a5fa" /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: "hidden", borderWidth: 1, borderColor: "#1e293b", borderRadius: 18, backgroundColor: "#0f172a" },
  imageWrap: { position: "relative", borderBottomWidth: 1, borderBottomColor: "#1e293b", backgroundColor: "#020617" },
  coverButton: { aspectRatio: 16 / 9, minHeight: 178, alignItems: "center", justifyContent: "center" },
  cover: { width: "100%", height: "100%" },
  imageFallback: { alignItems: "center", gap: 6 },
  imageFallbackText: { color: "#64748b", fontSize: 12 },
  favoriteButton: { position: "absolute", top: 12, right: 12, width: 44, height: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "rgba(2,6,23,0.94)" },
  body: { padding: 16 },
  category: { color: "#93c5fd", fontSize: 12, fontWeight: "700" },
  titleButton: { minHeight: 48, marginTop: 4, justifyContent: "center" },
  title: { color: "#ffffff", fontSize: 18, fontWeight: "800", lineHeight: 23 },
  startingPrice: { marginTop: 5, color: "#a7f3d0", fontSize: 13, fontWeight: "800" },
  fieldLabel: { marginTop: 10, marginBottom: 6, color: "#94a3b8", fontSize: 11, fontWeight: "700" },
  platformPicker: { minHeight: 52, paddingHorizontal: 9, borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#020617", flexDirection: "row", alignItems: "center", gap: 9 },
  platformText: { flex: 1, color: "#cbd5e1", fontSize: 13, fontWeight: "700" },
  priceRow: { marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderTopColor: "#1e293b", flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 8 },
  priceBlock: { minWidth: 0 },
  oldPrice: { color: "#64748b", fontSize: 12, textDecorationLine: "line-through" },
  price: { color: "#ffffff", fontSize: 21, fontWeight: "900" },
  stock: { marginTop: 4, color: "#a7f3d0", fontSize: 12, fontWeight: "700" },
  stockOut: { color: "#fecdd3" },
  discount: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, backgroundColor: "rgba(16,185,129,0.16)", color: "#a7f3d0", fontSize: 11, fontWeight: "800" },
  cartButton: { minHeight: 50, marginTop: 14, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "#2563eb", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  cartButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "800", textAlign: "center" },
  feedback: { marginTop: 9, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  feedbackError: { color: "#fda4af" },
  feedbackSuccess: { color: "#86efac" },
  pickerBackdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 22, backgroundColor: "rgba(0,0,0,0.68)" },
  pickerSheet: { width: "100%", maxWidth: 480, padding: 18, borderWidth: 1, borderColor: "#334155", borderRadius: 20, backgroundColor: "#020617" },
  pickerHeader: { marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pickerTitle: { color: "#ffffff", fontSize: 19, fontWeight: "900" },
  pickerClose: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#0f172a" },
  listingOption: { minHeight: 66, marginTop: 8, padding: 10, borderWidth: 1, borderColor: "#1e293b", borderRadius: 14, backgroundColor: "#0f172a", flexDirection: "row", alignItems: "center", gap: 10 },
  listingOptionSelected: { borderColor: "#60a5fa", backgroundColor: "rgba(37,99,235,0.16)" },
  platformIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "rgba(34,211,238,0.1)" },
  listingInfo: { flex: 1 },
  listingName: { color: "#f8fafc", fontSize: 14, fontWeight: "800" },
  listingPrice: { marginTop: 3, color: "#94a3b8", fontSize: 12 },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.72 },
});
