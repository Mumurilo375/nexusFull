import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/src/components/ui/Typography";
import { resolveAssetUrl } from "../../../services/assets";
import { AdminButton, AdminPagination, AdminStatusBadge, adminColors, adminStyles, formatDate } from "../shared/adminShared";
import type { AdminOfferItem, PaginationMeta } from "../shared/admin.types";
import { buildListingLabel } from "./adminOffers.helpers";

export default function AdminOffersList({ items, meta, deletingId, onCreate, onEdit, onDelete, onPageChange }: {
  items: AdminOfferItem[];
  meta: PaginationMeta;
  deletingId: number | null;
  onCreate: () => void;
  onEdit: (item: AdminOfferItem) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number) => void;
}) {
  if (items.length === 0) {
    return <View style={styles.empty}>
      <View style={styles.emptyIcon}><Ionicons name="pricetag-outline" size={26} color={adminColors.cyan} /></View>
      <Text style={styles.emptyTitle}>Nenhuma oferta por aqui</Text>
      <Text style={[adminStyles.muted, styles.emptyText]}>Crie uma campanha para aplicar descontos a um grupo de jogos do catálogo.</Text>
      <AdminButton onPress={onCreate}>Criar primeira oferta</AdminButton>
    </View>;
  }

  return <View style={styles.list}>
    {items.map((item) => <View key={item.id} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.coverWrap}>{item.coverImageUrl ? <Image source={{ uri: resolveAssetUrl(item.coverImageUrl) }} style={styles.cover} resizeMode="cover" /> : <Ionicons name="pricetag-outline" size={22} color={adminColors.muted} />}</View>
        <View style={styles.identity}>
          <View style={styles.titleRow}><Text style={styles.name} numberOfLines={2}>{item.name}</Text><AdminStatusBadge active={item.isActive} /></View>
          <Text style={adminStyles.muted}>{formatDate(item.startDate)} até {formatDate(item.endDate)}</Text>
          <Text style={styles.discount}>{item.discountPercentage}% de desconto</Text>
        </View>
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.description || "Sem descrição para esta campanha."}</Text>
      <View style={styles.linkedRow}><Ionicons name="layers-outline" size={17} color={adminColors.cyan} /><Text style={styles.linkedText}>{item.listings?.length ?? 0} oferta(s) vinculada(s)</Text></View>
      {item.listings?.length ? <View style={styles.chips}>{item.listings.slice(0, 3).map((listing) => <View key={listing.id} style={styles.chip}><Text style={styles.chipText} numberOfLines={1}>{buildListingLabel(listing)}</Text></View>)}{item.listings.length > 3 ? <Text style={adminStyles.muted}>+{item.listings.length - 3}</Text> : null}</View> : null}
      <View style={styles.actions}>
        <AdminButton tone="secondary" onPress={() => onEdit(item)} style={styles.editButton}><View style={styles.buttonContent}><Ionicons name="create-outline" size={17} color={adminColors.secondary} /><Text style={styles.secondaryButtonText}>Editar</Text></View></AdminButton>
        <Pressable accessibilityRole="button" accessibilityLabel={`Remover oferta ${item.name}`} accessibilityState={{ disabled: deletingId === item.id }} disabled={deletingId === item.id} onPress={() => onDelete(item.id)} style={({ pressed }) => [styles.deleteButton, deletingId === item.id && styles.disabled, pressed && styles.pressed]}><Ionicons name="trash-outline" size={17} color="#fecdd3" /><Text style={styles.deleteText}>{deletingId === item.id ? "Removendo..." : "Remover"}</Text></Pressable>
      </View>
    </View>)}
    <AdminPagination meta={meta} onPageChange={onPageChange} />
  </View>;
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: { borderWidth: 1, borderColor: adminColors.softBorder, borderRadius: 16, backgroundColor: adminColors.surface, padding: 14 },
  cardTop: { flexDirection: "row", gap: 12 },
  coverWrap: { width: 68, height: 82, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: adminColors.deep, overflow: "hidden" },
  cover: { width: "100%", height: "100%" },
  identity: { flex: 1, minWidth: 0, gap: 6 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  name: { flex: 1, color: adminColors.white, fontSize: 17, lineHeight: 22, fontWeight: "700" },
  discount: { color: "#a7f3d0", fontSize: 16, fontWeight: "800" },
  description: { marginTop: 14, color: adminColors.secondary, fontSize: 13, lineHeight: 19 },
  linkedRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 12 },
  linkedText: { color: adminColors.secondary, fontSize: 13, fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 9 },
  chip: { maxWidth: "100%", borderWidth: 1, borderColor: adminColors.softBorder, borderRadius: 8, backgroundColor: adminColors.deep, paddingHorizontal: 8, paddingVertical: 5 },
  chipText: { color: adminColors.muted, fontSize: 11, lineHeight: 15 },
  actions: { flexDirection: "row", gap: 8, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: adminColors.softBorder },
  editButton: { flex: 1 },
  buttonContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  secondaryButtonText: { color: adminColors.secondary, fontSize: 13, fontWeight: "700" },
  deleteButton: { minHeight: 48, flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1, borderColor: "rgba(244,63,94,0.42)", borderRadius: 12, backgroundColor: adminColors.dangerSoft, paddingHorizontal: 12 },
  deleteText: { color: "#fecdd3", fontSize: 13, fontWeight: "700" },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.7 },
  empty: { alignItems: "center", borderWidth: 1, borderColor: adminColors.softBorder, borderRadius: 16, backgroundColor: adminColors.surface, padding: 24 },
  emptyIcon: { width: 54, height: 54, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: adminColors.primarySoft, marginBottom: 13 },
  emptyTitle: { color: adminColors.white, fontSize: 18, fontWeight: "700" },
  emptyText: { maxWidth: 360, marginTop: 7, marginBottom: 16, textAlign: "center" },
});
