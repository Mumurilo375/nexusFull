import { Text } from "@/src/components/ui/Typography";
import { StyleSheet, View } from "react-native";
import PlatformLogo from "../../../loja/PlatformLogo";
import { AdminButton, adminColors, adminStyles } from "../../shared/adminShared";
import type { PlatformMonitorItem } from "../../shared/admin.types";
import { getPlatformPriceLabel } from "./AdminGamePlatforms.helpers";

export default function AdminGamePlatformCard({ platform, onManage }: { platform: PlatformMonitorItem; onManage: () => void }) {
  return (
    <View style={[adminStyles.card, styles.card]}>
      <View style={styles.header}>
        <PlatformLogo platformName={platform.platform.name} iconUrl={platform.platform.iconUrl} size={52} />
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={2}>{platform.platform.name}</Text>
          <View accessibilityLabel={platform.isActive ? "Plataforma ativa" : "Plataforma inativa"} style={styles.status}>
            <View style={[styles.statusDot, !platform.isActive && styles.statusDotInactive]} />
            <Text style={[styles.statusText, !platform.isActive && styles.statusTextInactive]}>{platform.isActive ? "Ativa na loja" : "Inativa na loja"}</Text>
          </View>
        </View>
      </View>
      <View style={styles.metrics}>
        <View style={styles.metric}><Text style={styles.metricLabel}>Preço atual</Text><Text style={styles.metricValue}>{getPlatformPriceLabel(platform.price)}</Text></View>
        <View style={styles.metric}><Text style={styles.metricLabel}>Estoque</Text><Text style={styles.metricValue}>{platform.stock.available} keys</Text></View>
      </View>
      <AdminButton tone="secondary" onPress={onManage} style={styles.action}>Gerenciar preço e estoque</AdminButton>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  copy: { flex: 1, minWidth: 0 },
  title: { color: "#ffffff", fontSize: 18, lineHeight: 23, fontWeight: "700" },
  status: { marginTop: 5, flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: adminColors.success },
  statusDotInactive: { backgroundColor: "#64748b" },
  statusText: { color: "#a7f3d0", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  statusTextInactive: { color: adminColors.muted },
  metrics: { marginTop: 16, flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, borderColor: adminColors.softBorder },
  metric: { flex: 1, minWidth: 0, paddingVertical: 13 },
  metricLabel: { color: adminColors.muted, fontSize: 11, lineHeight: 16 },
  metricValue: { marginTop: 3, color: "#f8fafc", fontSize: 15, lineHeight: 20, fontWeight: "700" },
  action: { width: "100%", marginTop: 14 },
});
