import { Text, TextInput } from "@/src/components/ui/Typography";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PlatformLogo from "../../../loja/PlatformLogo";
import {
  AdminButton,
  AdminNotice,
  AdminPagination,
  AdminTextField,
  AdminToggleField,
  adminColors,
  getKeyStatusColor,
} from "../../shared/adminShared";
import type { PlatformFormState, PlatformKeysState, PlatformMonitorItem } from "../../shared/admin.types";
import { formatGameKeyText, formatGameKeyValue, getGameKeyValues, sanitizePlatformPrice } from "./AdminGamePlatforms.helpers";

type Props = {
  visible: boolean;
  platform: PlatformMonitorItem | null;
  formState: PlatformFormState | null;
  keysState: PlatformKeysState;
  onClose: () => void;
  onPriceChange: (value: string) => void;
  onActiveChange: (value: boolean) => void;
  onSave: () => void;
  onNewKeysTextChange: (value: string) => void;
  onAddKeys: () => void;
  onRemoveSelected: () => void;
  onToggleKey: (id: number) => void;
  onPageChange: (page: number) => void;
};

export default function AdminGamePlatformsModal({ visible, platform, formState, keysState, onClose, onPriceChange, onActiveChange, onSave, onNewKeysTextChange, onAddKeys, onRemoveSelected, onToggleKey, onPageChange }: Props) {
  const parsed = useMemo(() => getGameKeyValues(formState?.newKeysText ?? ""), [formState?.newKeysText]);
  const canAddKeys = Boolean(platform?.hasListing && !formState?.isAddingKeys && !parsed.hasIncompleteKey && parsed.keyValues.length > 0);

  return (
    <Modal visible={visible && Boolean(platform && formState)} animationType="slide" onRequestClose={onClose}>
      {platform && formState ? (
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <PlatformLogo platformName={platform.platform.name} iconUrl={platform.platform.iconUrl} size={44} />
            <View style={styles.headerCopy}>
              <Text style={styles.headerTitle} numberOfLines={1}>{platform.platform.name}</Text>
              <Text style={styles.headerMeta}>{platform.stock.available} keys disponíveis</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar gerenciamento da plataforma" onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <Ionicons name="close" size={22} color="#e2e8f0" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Preço e disponibilidade</Text>
                <Text style={styles.sectionDescription}>Defina como esta versão aparece para os clientes.</Text>
              </View>
              <View style={styles.priceGrid}>
                <View style={styles.priceField}><AdminTextField label="Preço" value={formState.price} onChangeText={(value) => onPriceChange(sanitizePlatformPrice(value))} placeholder="10,00" keyboardType="decimal-pad" /></View>
                <View style={styles.toggleField}><AdminToggleField label="Disponível na loja" checked={formState.isActive} onChange={onActiveChange} /></View>
              </View>
              <AdminButton disabled={formState.isSaving} onPress={onSave}>{formState.isSaving ? "Salvando..." : "Salvar preço e disponibilidade"}</AdminButton>
              {formState.error ? <AdminNotice>{formState.error}</AdminNotice> : null}
              {formState.success ? <AdminNotice tone="success">{formState.success}</AdminNotice> : null}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Adicionar keys</Text>
                <Text style={styles.sectionDescription}>Digite uma key por linha no formato XXXX-XXXX-XXXX.</Text>
              </View>
              <TextInput value={formState.newKeysText} onChangeText={(value) => onNewKeysTextChange(formatGameKeyText(value))} placeholder="AAAA-BBBB-CCCC" placeholderTextColor="#64748b" autoCapitalize="characters" autoCorrect={false} multiline style={styles.keysInput} />
              <View style={styles.recognitionRow}>
                <Text style={styles.recognitionText}>{parsed.keyValues.length} {parsed.keyValues.length === 1 ? "key reconhecida" : "keys reconhecidas"}</Text>
                {parsed.hasIncompleteKey ? <Text style={styles.incompleteText}>Revise a key incompleta</Text> : null}
              </View>
              {!platform.hasListing ? <AdminNotice>Salve um preço válido antes de adicionar keys.</AdminNotice> : null}
              <AdminButton disabled={!canAddKeys} onPress={onAddKeys}>{formState.isAddingKeys ? "Adicionando..." : "Adicionar ao estoque"}</AdminButton>
            </View>

            <View style={styles.section}>
              <View style={styles.keysHeader}>
                <View style={styles.sectionHeaderCopy}>
                  <Text style={styles.sectionTitle}>Keys cadastradas</Text>
                  <Text style={styles.sectionDescription}>{keysState.meta.total} no estoque · {keysState.selectedIds.length} selecionada(s)</Text>
                </View>
                {keysState.selectedIds.length > 0 ? <AdminButton tone="subtleDanger" disabled={keysState.isRemoving} onPress={onRemoveSelected} style={styles.removeSelected}>{keysState.isRemoving ? "Removendo..." : "Remover selecionadas"}</AdminButton> : null}
              </View>
              {keysState.error ? <AdminNotice>{keysState.error}</AdminNotice> : null}
              {keysState.isLoading ? (
                <View style={styles.loading}><ActivityIndicator color={adminColors.cyan} /><Text style={styles.loadingText}>Carregando estoque...</Text></View>
              ) : keysState.items.length === 0 ? (
                <View style={styles.empty}><Ionicons name="key-outline" size={21} color="#64748b" /><Text style={styles.emptyText}>Nenhuma key cadastrada para esta plataforma.</Text></View>
              ) : (
                <View style={styles.keyList}>
                  {keysState.items.map((gameKey) => {
                    const selected = keysState.selectedIds.includes(gameKey.id);
                    const available = gameKey.status === "available";
                    return <Pressable key={gameKey.id} accessibilityRole="checkbox" accessibilityState={{ checked: selected, disabled: !available }} disabled={!available} onPress={() => onToggleKey(gameKey.id)} style={({ pressed }) => [styles.keyRow, selected && styles.keySelected, !available && styles.keyUnavailable, pressed && styles.pressed]}><View style={[styles.checkbox, selected && styles.checkboxSelected]}>{selected ? <Ionicons name="checkmark" size={15} color="#ffffff" /> : null}</View><Text style={styles.keyValue} numberOfLines={1}>{formatGameKeyValue(gameKey.keyValue)}</Text><Text style={[styles.keyStatus, { color: getKeyStatusColor(gameKey.status) }]}>{getKeyStatusLabel(gameKey.status)}</Text></Pressable>;
                  })}
                </View>
              )}
              <AdminPagination meta={keysState.meta} onPageChange={onPageChange} />
            </View>
          </ScrollView>
        </SafeAreaView>
      ) : null}
    </Modal>
  );
}

function getKeyStatusLabel(status: string) {
  if (status === "sold") return "Vendida";
  if (status === "reserved") return "Reservada";
  return "Disponível";
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" },
  header: { minHeight: 72, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "#1e293b", backgroundColor: "#0f172a" },
  headerCopy: { flex: 1, minWidth: 0 },
  headerTitle: { color: "#ffffff", fontSize: 18, lineHeight: 23, fontWeight: "700" },
  headerMeta: { marginTop: 2, color: "#94a3b8", fontSize: 11, lineHeight: 16 },
  closeButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 12 },
  content: { width: "100%", maxWidth: 760, alignSelf: "center", gap: 14, padding: 16, paddingBottom: 42 },
  section: { gap: 14, borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#0f172a", padding: 16 },
  sectionHeader: { paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  sectionHeaderCopy: { flex: 1, minWidth: 180 },
  sectionTitle: { color: "#ffffff", fontSize: 17, lineHeight: 22, fontWeight: "700" },
  sectionDescription: { marginTop: 4, color: "#94a3b8", fontSize: 12, lineHeight: 18 },
  priceGrid: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end", gap: 10 },
  priceField: { minWidth: 180, flex: 1 },
  toggleField: { minWidth: 220, flex: 1 },
  keysInput: { minHeight: 132, borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#020617", padding: 14, color: "#ffffff", fontFamily: "monospace", fontSize: 14, lineHeight: 21, textAlignVertical: "top", letterSpacing: 1 },
  recognitionRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },
  recognitionText: { color: "#94a3b8", fontSize: 12, lineHeight: 18 },
  incompleteText: { color: "#fda4af", fontSize: 12, lineHeight: 18 },
  keysHeader: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 10, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  removeSelected: { minWidth: 166 },
  loading: { minHeight: 88, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { color: "#94a3b8", fontSize: 12 },
  empty: { minHeight: 84, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderWidth: 1, borderColor: "#1e293b", borderRadius: 12, backgroundColor: "#020617", padding: 14 },
  emptyText: { flex: 1, color: "#94a3b8", fontSize: 12, lineHeight: 18 },
  keyList: { gap: 8 },
  keyRow: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 9, borderWidth: 1, borderColor: "#1e293b", borderRadius: 12, backgroundColor: "#020617", padding: 10 },
  keySelected: { borderColor: "rgba(59,130,246,0.65)", backgroundColor: "rgba(37,99,235,0.12)" },
  keyUnavailable: { opacity: 0.58 },
  checkbox: { width: 24, height: 24, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#475569", borderRadius: 7 },
  checkboxSelected: { borderColor: "#60a5fa", backgroundColor: "#2563eb" },
  keyValue: { flex: 1, color: "#ffffff", fontFamily: "monospace", fontSize: 12, letterSpacing: 0.8 },
  keyStatus: { fontSize: 10, lineHeight: 15, fontWeight: "700" },
  pressed: { opacity: 0.72 },
});
