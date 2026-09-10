import Ionicons from "@expo/vector-icons/Ionicons";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput } from "@/src/components/ui/Typography";
import { AdminButton, adminColors, adminStyles } from "../shared/adminShared";
import type { AdminOfferListingOption } from "../shared/admin.types";

export default function AdminOffersListingPicker({ visible, search, options, selectedIds, onClose, onSearch, onToggle }: {
  visible: boolean;
  search: string;
  options: AdminOfferListingOption[];
  selectedIds: number[];
  onClose: () => void;
  onSearch: (value: string) => void;
  onToggle: (id: number) => void;
}) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <View style={styles.titleCopy}><Text style={adminStyles.sectionTitle}>Vincular jogos</Text><Text style={adminStyles.muted}>{selectedIds.length} selecionado(s)</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar seleção de jogos" onPress={onClose} style={styles.closeButton}><Ionicons name="close" size={22} color={adminColors.secondary} /></Pressable>
        </View>
        <Text style={adminStyles.description}>Toque em uma oferta para incluir ou remover da campanha.</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={adminColors.muted} />
          <TextInput value={search} onChangeText={onSearch} placeholder="Buscar jogo ou plataforma" placeholderTextColor="#64748b" style={styles.searchInput} autoCapitalize="none" returnKeyType="search" />
          {search ? <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => onSearch("")} style={styles.clearButton}><Ionicons name="close-circle" size={18} color={adminColors.muted} /></Pressable> : null}
        </View>

        <ScrollView style={styles.options} contentContainerStyle={styles.optionsContent} keyboardShouldPersistTaps="handled">
          {options.length ? options.map((listing) => {
            const selected = selectedIds.includes(listing.id);
            return <Pressable key={listing.id} accessibilityRole="checkbox" accessibilityLabel={`${listing.game?.title || "Jogo"} para ${listing.platform?.name || "Plataforma"}`} accessibilityState={{ checked: selected }} onPress={() => onToggle(listing.id)} style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}>
              <View style={styles.optionIcon}><Ionicons name={selected ? "checkmark" : "game-controller-outline"} size={18} color={selected ? adminColors.white : adminColors.cyan} /></View>
              <View style={styles.optionCopy}><Text style={styles.optionTitle} numberOfLines={1}>{listing.game?.title || "Jogo"}</Text><Text style={adminStyles.muted}>{listing.platform?.name || "Plataforma"}</Text></View>
              <Text style={[styles.optionState, selected && styles.optionStateSelected]}>{selected ? "Incluído" : "Incluir"}</Text>
            </Pressable>;
          }) : <View style={styles.noResults}><Ionicons name="search-outline" size={24} color={adminColors.muted} /><Text style={adminStyles.muted}>{search ? "Nenhum jogo encontrado para essa busca." : "Nenhuma oferta disponível."}</Text></View>}
        </ScrollView>

        <View style={styles.footer}><Text style={adminStyles.muted}>As alterações ficam no formulário até você salvar.</Text><AdminButton onPress={onClose}>Concluir seleção</AdminButton></View>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.78)" },
  modal: { maxHeight: "92%", minHeight: "62%", gap: 13, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: adminColors.softBorder, backgroundColor: adminColors.deep, padding: 18 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  titleCopy: { flex: 1, gap: 4 },
  closeButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: adminColors.surface },
  searchBox: { minHeight: 50, flexDirection: "row", alignItems: "center", gap: 9, borderWidth: 1, borderColor: adminColors.border, borderRadius: 13, backgroundColor: adminColors.surface, paddingHorizontal: 13 },
  searchInput: { flex: 1, minHeight: 48, color: adminColors.white, fontSize: 15 },
  clearButton: { minWidth: 36, minHeight: 40, alignItems: "center", justifyContent: "center" },
  options: { flex: 1 },
  optionsContent: { gap: 8, paddingBottom: 4 },
  option: { minHeight: 62, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: adminColors.softBorder, borderRadius: 13, backgroundColor: adminColors.surface, paddingHorizontal: 11 },
  optionSelected: { borderColor: "rgba(59,130,246,0.7)", backgroundColor: adminColors.primarySoft },
  optionIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: adminColors.deep },
  optionCopy: { flex: 1, minWidth: 0, gap: 3 },
  optionTitle: { color: adminColors.white, fontSize: 14, fontWeight: "700" },
  optionState: { color: adminColors.muted, fontSize: 12, fontWeight: "700" },
  optionStateSelected: { color: "#bfdbfe" },
  noResults: { minHeight: 140, alignItems: "center", justifyContent: "center", gap: 10 },
  footer: { gap: 9, paddingTop: 4, borderTopWidth: 1, borderTopColor: adminColors.softBorder },
  pressed: { opacity: 0.7 },
});
