import { Text, View } from "react-native";
import PlatformLogo from "../../../loja/PlatformLogo";
import { AdminButton, AdminStatusBadge, adminStyles } from "../../shared/adminShared";
import type { PlatformMonitorItem } from "../../shared/admin.types";
import { getPlatformPriceLabel } from "./AdminGamePlatforms.helpers";

export default function AdminGamePlatformCard({ platform, onManage }: { platform: PlatformMonitorItem; onManage: () => void }) {
  return (
    <View style={adminStyles.card}>
      <View style={styles.identity}>
        <PlatformLogo platformName={platform.platform.name} iconUrl={platform.platform.iconUrl} size={54} />
        <View style={styles.copy}>
          <Text style={styles.title}>{platform.platform.name}</Text>
          <View style={[adminStyles.wrap, styles.metrics]}>
            <View style={styles.chip}><Text style={styles.chipText}>{getPlatformPriceLabel(platform.price)}</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>{platform.stock.available} disponíveis</Text></View>
            <AdminStatusBadge active={platform.isActive} activeLabel="Ativa" inactiveLabel="Inativa" />
          </View>
        </View>
      </View>
      <AdminButton tone="secondary" onPress={onManage} style={styles.action}>Gerenciar plataforma</AdminButton>
    </View>
  );
}

const styles = {
  identity: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12 },
  copy: { flex: 1, minWidth: 0 },
  title: { color: "#ffffff", fontSize: 17, fontWeight: "700" as const },
  metrics: { marginTop: 7 },
  chip: { borderWidth: 1, borderColor: "#334155", borderRadius: 999, backgroundColor: "#020617", paddingHorizontal: 9, paddingVertical: 5 },
  chipText: { color: "#cbd5e1", fontSize: 11, fontWeight: "600" as const },
  action: { width: "100%" as const, marginTop: 14 },
};
