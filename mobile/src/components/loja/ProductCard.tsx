import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { resolveAssetUrl } from "../../services/assets";
import type { GameSummary, ListingItem } from "./store.types";
import { getListingAvailableStock, getListingDiscountPercentage, getListingDisplayPrice, getLowestAvailableListing, toMoney } from "./store.utils";

type ProductCardProps = {
  game: GameSummary;
  listings: ListingItem[];
  isFavorite: boolean;
  pendingFavorite: boolean;
  onOpen: (gameId: number) => void;
  onToggleFavorite: (gameId: number) => void;
};

export default function ProductCard({ game, listings, isFavorite, pendingFavorite, onOpen, onToggleFavorite }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = resolveAssetUrl(game.coverImageUrl, "");
  const lowestListing = getLowestAvailableListing(listings);
  const price = lowestListing ? getListingDisplayPrice(lowestListing) : 0;
  const discount = getListingDiscountPercentage(lowestListing);
  const platformNames = Array.from(new Set(listings.map((listing) => listing.platform?.name?.trim()).filter(Boolean))) as string[];
  const hasAvailableListing = listings.some((listing) => getListingAvailableStock(listing) > 0);
  const platformSummary = platformNames.length > 2 ? `${platformNames.slice(0, 2).join(" · ")} +${platformNames.length - 2}` : platformNames.join(" · ");

  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Abrir detalhes de ${game.title}`} onPress={() => onOpen(game.id)} style={({ pressed }) => [styles.coverButton, pressed && styles.pressed]}>
        {imageUrl && !imageFailed ? <Image source={{ uri: imageUrl }} onError={() => setImageFailed(true)} style={styles.cover} resizeMode="cover" /> : <View style={styles.imageFallback}><Ionicons name="image-outline" size={28} color="#64748b" /><Text style={styles.imageFallbackText}>Capa indisponível</Text></View>}
        <View style={styles.coverShade} />
        {discount > 0 ? <Text style={styles.discount}>-{discount}%</Text> : null}
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={isFavorite ? `Remover ${game.title} dos favoritos` : `Adicionar ${game.title} aos favoritos`} accessibilityState={{ disabled: pendingFavorite, selected: isFavorite }} onPress={() => onToggleFavorite(game.id)} disabled={pendingFavorite} hitSlop={8} style={({ pressed }) => [styles.favoriteButton, pressed && styles.pressed, pendingFavorite && styles.disabled]}>
        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={19} color={isFavorite ? "#fb7185" : "#e2e8f0"} />
      </Pressable>
      <View style={styles.body}>
        <Text style={styles.category} numberOfLines={1}>{game.categories?.[0]?.name ?? "Jogo digital"}</Text>
        <Pressable accessibilityRole="button" onPress={() => onOpen(game.id)} style={({ pressed }) => [styles.titleButton, pressed && styles.pressed]}><Text style={styles.title} numberOfLines={2}>{game.title}</Text></Pressable>
        <View style={styles.priceRow}><View><Text style={styles.priceLabel}>A partir de</Text><Text style={styles.price}>{price > 0 ? toMoney(price) : "Sem estoque"}</Text></View><View accessible accessibilityLabel={hasAvailableListing ? "Disponível" : "Sem estoque"} style={[styles.stockDot, !hasAvailableListing && styles.stockDotOut]} /></View>
        <View style={styles.platformRow}><Ionicons name="game-controller-outline" size={13} color="#67e8f9" /><Text style={styles.platforms} numberOfLines={1}>{platformSummary || "Plataforma não informada"}</Text></View>
        <Pressable accessibilityRole="button" onPress={() => onOpen(game.id)} style={({ pressed }) => [styles.detailsButton, pressed && styles.pressed]}><Text style={styles.detailsText}>Ver detalhes</Text><Ionicons name="arrow-forward" size={15} color="#bfdbfe" /></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: "hidden", position: "relative", borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#0f172a" },
  coverButton: { position: "relative", aspectRatio: 0.88, alignItems: "center", justifyContent: "center", backgroundColor: "#081120" },
  cover: { width: "100%", height: "100%" }, coverShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(2,6,23,0.08)" },
  imageFallback: { alignItems: "center", gap: 7 }, imageFallbackText: { color: "#94a3b8", fontSize: 11, fontWeight: "700" },
  favoriteButton: { position: "absolute", top: 9, right: 9, width: 36, height: 36, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(226,232,240,0.24)", borderRadius: 12, backgroundColor: "rgba(2,6,23,0.84)" },
  discount: { position: "absolute", left: 9, bottom: 9, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 8, backgroundColor: "#047857", color: "#ecfdf5", fontSize: 11, fontWeight: "900" },
  body: { padding: 11 }, category: { color: "#67e8f9", fontSize: 11, fontWeight: "800", letterSpacing: 0.3, textTransform: "uppercase" },
  titleButton: { minHeight: 43, justifyContent: "center", marginTop: 2 }, title: { color: "#f8fafc", fontSize: 15, lineHeight: 19, fontWeight: "900", letterSpacing: -0.2 },
  priceRow: { marginTop: 8, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }, priceLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "700" }, price: { marginTop: 1, color: "#ffffff", fontSize: 17, lineHeight: 21, fontWeight: "900", letterSpacing: -0.3 },
  stockDot: { width: 8, height: 8, marginBottom: 4, borderRadius: 999, backgroundColor: "#34d399" }, stockDotOut: { backgroundColor: "#fb7185" },
  platformRow: { minHeight: 25, marginTop: 8, flexDirection: "row", alignItems: "center", gap: 5 }, platforms: { flex: 1, color: "#cbd5e1", fontSize: 12, fontWeight: "700" },
  detailsButton: { minHeight: 44, marginTop: 5, paddingHorizontal: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, detailsText: { color: "#bfdbfe", fontSize: 12, fontWeight: "900" },
  disabled: { opacity: 0.55 }, pressed: { opacity: 0.76 },
});
