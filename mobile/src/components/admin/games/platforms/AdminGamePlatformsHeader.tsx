import { Text } from "@/src/components/ui/Typography";
import { Image, StyleSheet, View } from "react-native";
import { resolveAssetUrl } from "../../../../services/assets";
import { adminColors, adminStyles } from "../../shared/adminShared";

export default function AdminGamePlatformsHeader({ gameTitle, coverImageUrl, availableKeysCount }: { gameTitle?: string; coverImageUrl?: string; availableKeysCount: number }) {
  return (
    <View style={[adminStyles.card, styles.card]}>
      <Image source={{ uri: resolveAssetUrl(coverImageUrl) }} style={styles.cover} resizeMode="cover" />
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={3}>{gameTitle || "Jogo"}</Text>
        <Text style={styles.description}>Selecione uma plataforma abaixo para ajustar preço, disponibilidade e keys.</Text>
      </View>
      <View style={styles.stock}>
        <Text style={styles.stockNumber}>{availableKeysCount}</Text>
        <Text style={styles.stockLabel}>keys disponíveis</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 14, padding: 16 },
  cover: { width: 92, height: 92, borderRadius: 14, backgroundColor: "#020617" },
  copy: { minWidth: 180, flex: 1 },
  title: { color: "#ffffff", fontSize: 20, lineHeight: 25, fontWeight: "700" },
  description: { maxWidth: 460, marginTop: 6, color: adminColors.muted, fontSize: 12, lineHeight: 18 },
  stock: { minWidth: 118, paddingLeft: 14, borderLeftWidth: 1, borderLeftColor: adminColors.softBorder },
  stockNumber: { color: "#bfdbfe", fontSize: 24, lineHeight: 29, fontWeight: "700" },
  stockLabel: { color: adminColors.muted, fontSize: 11, lineHeight: 16 },
});
