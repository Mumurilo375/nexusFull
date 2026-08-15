import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { GameDetails } from "./store.types";
import PlatformLogo from "./PlatformLogo";
import { getListingAvailableStock, getListingDisplayPrice, toMoney } from "./store.utils";

type DetailsSidebarProps = {
  details: GameDetails;
  currentListingId: number;
  availableStock: number;
  inCart: boolean;
  busyCart: boolean;
  busyBuyNow: boolean;
  actionError: string;
  onSelectListing: (listingId: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
};

export default function DetailsSidebar({ details, currentListingId, availableStock, inCart, busyCart, busyBuyNow, actionError, onSelectListing, onAddToCart, onBuyNow }: DetailsSidebarProps) {
  const listings = details.platformListings ?? [];
  const currentListing = listings.find((listing) => Number(listing.id) === currentListingId) ?? listings[0] ?? null;
  const basePrice = Number(currentListing?.pricing?.basePrice ?? currentListing?.price ?? 0);
  const finalPrice = getListingDisplayPrice(currentListing);
  const discount = Number(currentListing?.pricing?.discountPercentage ?? 0);
  const canPurchase = Boolean(currentListing) && availableStock > 0;

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Escolha sua plataforma</Text>
      <Text style={styles.subtitle}>A plataforma define o preço, o estoque e a key simulada deste pedido.</Text>
      <Text style={styles.legend}>Disponível para</Text>
      {listings.length > 0 ? listings.map((listing) => {
        const selected = Number(listing.id) === currentListingId;
        const stock = getListingAvailableStock(listing);
        return <Pressable key={listing.id} accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => onSelectListing(Number(listing.id))} style={({ pressed }) => [styles.listing, selected && styles.listingSelected, pressed && styles.pressed]}><PlatformLogo platformName={listing.platform?.name} iconUrl={listing.platform?.iconUrl} size={42} /><View style={styles.listingInfo}><Text style={styles.platformName}>{listing.platform?.name ?? "Plataforma"}</Text><Text style={styles.listingMeta}>{toMoney(getListingDisplayPrice(listing))} · {stock > 0 ? `${stock} disponíveis` : "Sem estoque"}</Text></View>{selected ? <Ionicons name="checkmark-circle" size={21} color="#60a5fa" /> : null}</Pressable>;
      }) : <Text style={styles.emptyPlatform}>Nenhuma plataforma disponível para este jogo no momento.</Text>}

      <View style={styles.priceSection}>
        {currentListing ? <><Text style={styles.priceLabel}>Preço final</Text>{discount > 0 ? <Text style={styles.oldPrice}>{toMoney(basePrice)}</Text> : null}<View style={styles.priceLine}><Text style={styles.price}>{toMoney(finalPrice)}</Text>{discount > 0 ? <Text style={styles.discount}>-{discount}%</Text> : null}</View><Text style={[styles.stock, availableStock <= 0 && styles.stockOut]}>{availableStock <= 0 ? "Esta plataforma está sem estoque." : `${availableStock} unidades disponíveis.`}</Text>{(currentListing.activePromotions ?? []).map((promotion) => <Text key={promotion.id} style={styles.promotion}>{promotion.name ?? "Oferta especial"} aplicada ao preço.</Text>)}</> : <Text style={styles.subtitle}>Configure uma plataforma para visualizar preço e disponibilidade.</Text>}
      </View>

      <Pressable accessibilityRole="button" accessibilityState={{ disabled: busyBuyNow || busyCart || !canPurchase, busy: busyBuyNow }} onPress={onBuyNow} disabled={busyBuyNow || busyCart || !canPurchase} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, !canPurchase && styles.disabled]}><Text style={styles.primaryText}>{busyBuyNow ? "Preparando carrinho..." : "Comprar agora"}</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: busyCart || busyBuyNow || inCart || !canPurchase, busy: busyCart }} onPress={onAddToCart} disabled={busyCart || busyBuyNow || inCart || !canPurchase} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed, (inCart || !canPurchase) && styles.disabled]}><Ionicons name={inCart ? "checkmark-circle-outline" : "cart-outline"} size={18} color="#e2e8f0" /><Text style={styles.secondaryText}>{inCart ? "Já está no carrinho" : busyCart ? "Adicionando..." : "Adicionar ao carrinho"}</Text></Pressable>
      <View style={styles.note}><Ionicons name="information-circle-outline" size={16} color="#67e8f9" /><Text style={styles.noteText}>Compra simulada para fins acadêmicos. A key é entregue após a confirmação do pedido.</Text></View>
      {actionError ? <Text style={styles.error} accessibilityLiveRegion="polite">{actionError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 18, borderWidth: 1, borderColor: "#334155", borderRadius: 20, backgroundColor: "#0f172a" },
  title: { color: "#ffffff", fontSize: 22, fontWeight: "900", letterSpacing: -0.4 },
  subtitle: { marginTop: 7, color: "#94a3b8", fontSize: 13, lineHeight: 20 },
  legend: { marginTop: 20, marginBottom: 9, color: "#e2e8f0", fontSize: 14, fontWeight: "800" },
  listing: { minHeight: 64, marginBottom: 8, padding: 10, borderWidth: 1, borderColor: "#334155", borderRadius: 14, backgroundColor: "#020617", flexDirection: "row", alignItems: "center", gap: 10 },
  listingSelected: { borderColor: "#60a5fa", backgroundColor: "rgba(37,99,235,0.16)" },
  listingInfo: { flex: 1 },
  platformName: { color: "#f8fafc", fontSize: 14, fontWeight: "800" },
  listingMeta: { marginTop: 3, color: "#94a3b8", fontSize: 12 },
  emptyPlatform: { padding: 14, borderWidth: 1, borderStyle: "dashed", borderColor: "#334155", borderRadius: 12, color: "#94a3b8", fontSize: 13, lineHeight: 20 },
  priceSection: { marginTop: 9, paddingTop: 17, borderTopWidth: 1, borderTopColor: "#334155" },
  priceLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "700" },
  oldPrice: { marginTop: 4, color: "#64748b", fontSize: 13, textDecorationLine: "line-through" },
  priceLine: { marginTop: 2, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  price: { color: "#ffffff", fontSize: 31, fontWeight: "900" },
  discount: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: "rgba(16,185,129,0.16)", color: "#a7f3d0", fontSize: 12, fontWeight: "900" },
  stock: { marginTop: 8, color: "#a7f3d0", fontSize: 13, fontWeight: "700" },
  stockOut: { color: "#fecdd3" },
  promotion: { marginTop: 5, color: "#a7f3d0", fontSize: 12 },
  primaryButton: { minHeight: 50, marginTop: 18, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#2563eb" },
  primaryText: { color: "#ffffff", fontSize: 14, fontWeight: "900" },
  secondaryButton: { minHeight: 50, marginTop: 9, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#475569", borderRadius: 13, backgroundColor: "#020617", flexDirection: "row", gap: 8 },
  secondaryText: { color: "#e2e8f0", fontSize: 14, fontWeight: "800" },
  note: { marginTop: 17, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#1e293b", flexDirection: "row", alignItems: "flex-start", gap: 8 },
  noteText: { flex: 1, color: "#64748b", fontSize: 12, lineHeight: 18 },
  error: { marginTop: 14, padding: 11, borderWidth: 1, borderColor: "rgba(244,63,94,0.35)", borderRadius: 10, backgroundColor: "rgba(244,63,94,0.1)", color: "#fecdd3", fontSize: 13, lineHeight: 19 },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.72 },
});
