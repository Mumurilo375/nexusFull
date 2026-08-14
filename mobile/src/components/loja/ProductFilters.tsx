import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { loadCatalogData } from "./catalogData";
import {
  collectFilterOptions,
  normalizeText,
  toggleNormalizedValue,
  type FilterOption,
} from "./store.utils";

type FilterKey = "platform" | "category";
type ProductFiltersProps = {
  selectedPlatforms: string[];
  selectedCategories: string[];
  onChange: (key: FilterKey, values: string[]) => void;
};

export default function ProductFilters({ selectedPlatforms, selectedCategories, onChange }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [platforms, setPlatforms] = useState<FilterOption[]>([]);
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const activeFilters = [
    ...selectedPlatforms.map((label) => ({ key: "platform" as const, label, group: "Plataforma" })),
    ...selectedCategories.map((label) => ({ key: "category" as const, label, group: "Categoria" })),
  ];

  useEffect(() => {
    let active = true;
    const loadFilters = async () => {
      try {
        setLoading(true);
        setLoadError(false);
        const { games, listings } = await loadCatalogData();
        const options = collectFilterOptions(games, listings);
        if (active) {
          setCategories(options.categories);
          setPlatforms(options.platforms);
        }
      } catch {
        if (active) {
          setCategories([]);
          setPlatforms([]);
          setLoadError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadFilters();
    return () => { active = false; };
  }, [attempt]);

  const clearFilters = () => {
    onChange("platform", []);
    onChange("category", []);
  };

  const removeFilter = (key: FilterKey, label: string) => {
    const values = key === "platform" ? selectedPlatforms : selectedCategories;
    onChange(key, values.filter((value) => normalizeText(value) !== normalizeText(label)));
  };

  const renderOptions = (title: string, key: FilterKey, options: FilterOption[], selected: string[]) => {
    const selectedSet = new Set(selected.map(normalizeText));
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {selected.length > 0 ? (
            <Pressable onPress={() => onChange(key, [])} style={styles.clearSection} hitSlop={8}>
              <Text style={styles.clearText}>Limpar</Text>
            </Pressable>
          ) : null}
        </View>
        {options.length === 0 && !loading ? <Text style={styles.muted}>Nenhuma opção disponível.</Text> : null}
        {options.map((option) => {
          const isSelected = selectedSet.has(normalizeText(option.label));
          return (
            <Pressable
              key={`${key}-${option.label}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              onPress={() => onChange(key, toggleNormalizedValue(selected, option.label))}
              style={({ pressed }) => [styles.option, isSelected && styles.optionSelected, pressed && styles.pressed]}
            >
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected ? <Ionicons name="checkmark" size={15} color="#ffffff" /> : null}
              </View>
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]} numberOfLines={1}>{option.label}</Text>
              <Text style={styles.optionCount}>{option.count}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Filtrar jogos"
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <View style={styles.triggerLabel}>
          <Ionicons name="options-outline" size={20} color="#93c5fd" />
          <Text style={styles.triggerText}>Filtrar jogos</Text>
        </View>
        {activeFilters.length > 0 ? <Text style={styles.countBadge}>{activeFilters.length}</Text> : <Ionicons name="chevron-down" size={18} color="#94a3b8" />}
      </Pressable>

      {activeFilters.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFilters}>
          {activeFilters.map((filter) => (
            <Pressable key={`${filter.key}-${filter.label}`} onPress={() => removeFilter(filter.key, filter.label)} style={styles.activeChip} accessibilityLabel={`Remover ${filter.group} ${filter.label}`}>
              <Text style={styles.activeChipText} numberOfLines={1}>{filter.label}</Text>
              <Ionicons name="close" size={14} color="#bfdbfe" />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <Modal visible={isOpen} animationType="slide" transparent onRequestClose={() => setIsOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Filtrar jogos</Text>
                <Text style={styles.modalSubtitle}>Refine o catálogo por plataforma ou categoria.</Text>
              </View>
              <Pressable accessibilityLabel="Fechar filtros" onPress={() => setIsOpen(false)} style={styles.closeButton}>
                <Ionicons name="close" size={22} color="#e2e8f0" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              {loading ? <View style={styles.loadingRow}><ActivityIndicator color="#67e8f9" /><Text style={styles.muted}>Carregando filtros...</Text></View> : null}
              {loadError && !loading ? (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>Não foi possível carregar os filtros.</Text>
                  <Pressable onPress={() => setAttempt((current) => current + 1)}><Text style={styles.retryText}>Tentar novamente</Text></Pressable>
                </View>
              ) : null}
              {renderOptions("Plataformas", "platform", platforms, selectedPlatforms)}
              {renderOptions("Categorias", "category", categories, selectedCategories)}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable onPress={clearFilters} style={styles.clearAllButton}>
                <Text style={styles.clearAllText}>Limpar tudo</Text>
              </Pressable>
              <Pressable onPress={() => setIsOpen(false)} style={styles.applyButton}>
                <Text style={styles.applyText}>{activeFilters.length > 0 ? "Ver resultados filtrados" : "Ver todos os jogos"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: { minHeight: 52, paddingHorizontal: 16, borderWidth: 1, borderColor: "#334155", borderRadius: 14, backgroundColor: "#0f172a", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  triggerLabel: { flexDirection: "row", alignItems: "center", gap: 10 },
  triggerText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  countBadge: { minWidth: 26, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "#2563eb", color: "#ffffff", textAlign: "center", fontSize: 12, fontWeight: "800" },
  activeFilters: { gap: 8, paddingTop: 10, paddingBottom: 2 },
  activeChip: { minHeight: 38, maxWidth: 180, paddingHorizontal: 12, borderWidth: 1, borderColor: "rgba(96,165,250,0.4)", borderRadius: 12, backgroundColor: "rgba(37,99,235,0.12)", flexDirection: "row", alignItems: "center", gap: 5 },
  activeChipText: { flexShrink: 1, color: "#bfdbfe", fontSize: 12, fontWeight: "700" },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.62)" },
  modalSheet: { maxHeight: "88%", borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: "#020617", paddingTop: 20 },
  modalHeader: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#1e293b", flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  modalTitle: { color: "#ffffff", fontSize: 24, fontWeight: "900", letterSpacing: -0.4 },
  modalSubtitle: { maxWidth: 280, marginTop: 5, color: "#94a3b8", fontSize: 13, lineHeight: 19 },
  closeButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a" },
  modalContent: { padding: 20, paddingBottom: 28 },
  section: { paddingVertical: 18, borderTopWidth: 1, borderTopColor: "#1e293b" },
  sectionHeading: { marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#f8fafc", fontSize: 16, fontWeight: "800" },
  clearSection: { minHeight: 32, justifyContent: "center", paddingHorizontal: 8 },
  clearText: { color: "#93c5fd", fontSize: 12, fontWeight: "700" },
  option: { minHeight: 48, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: "#1e293b", borderRadius: 12, backgroundColor: "#0f172a", flexDirection: "row", alignItems: "center", gap: 10 },
  optionSelected: { borderColor: "rgba(96,165,250,0.6)", backgroundColor: "rgba(37,99,235,0.16)" },
  checkbox: { width: 22, height: 22, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#475569", borderRadius: 6, backgroundColor: "#020617" },
  checkboxSelected: { borderColor: "#60a5fa", backgroundColor: "#2563eb" },
  optionLabel: { flex: 1, color: "#cbd5e1", fontSize: 14 },
  optionLabelSelected: { color: "#dbeafe", fontWeight: "700" },
  optionCount: { color: "#64748b", fontSize: 12, fontVariant: ["tabular-nums"] },
  muted: { color: "#94a3b8", fontSize: 13, lineHeight: 20 },
  loadingRow: { paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  warningBox: { marginBottom: 12, padding: 12, borderWidth: 1, borderColor: "rgba(245,158,11,0.35)", borderRadius: 12, backgroundColor: "rgba(245,158,11,0.1)" },
  warningText: { color: "#fde68a", fontSize: 13 },
  retryText: { marginTop: 8, color: "#fef3c7", fontSize: 13, fontWeight: "800", textDecorationLine: "underline" },
  modalFooter: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: "#1e293b", backgroundColor: "#020617", flexDirection: "row", alignItems: "center", gap: 10 },
  clearAllButton: { minHeight: 50, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
  clearAllText: { color: "#cbd5e1", fontSize: 13, fontWeight: "700" },
  applyButton: { flex: 1, minHeight: 50, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#2563eb", paddingHorizontal: 14 },
  applyText: { color: "#ffffff", fontSize: 13, fontWeight: "800", textAlign: "center" },
  pressed: { opacity: 0.72 },
});
