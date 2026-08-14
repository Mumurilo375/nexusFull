import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import ProductCatalog from "../components/loja/ProductCatalog";
import ProductFilters from "../components/loja/ProductFilters";

export default function Loja() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const updateFilter = (key: "platform" | "category", values: string[]) => {
    if (key === "platform") setSelectedPlatforms(values);
    else setSelectedCategories(values);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.kicker}>NEXUS STORE</Text>
        <Text accessibilityRole="header" style={styles.title}>Explore a loja</Text>
        <Text style={styles.subtitle}>Compare jogos, plataformas, preços e disponibilidade antes de escolher sua próxima experiência.</Text>
      </View>
      <View style={styles.filters}><ProductFilters selectedPlatforms={selectedPlatforms} selectedCategories={selectedCategories} onChange={updateFilter} /></View>
      <ProductCatalog selectedPlatforms={selectedPlatforms} selectedCategories={selectedCategories} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" },
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 },
  kicker: { color: "#22d3ee", fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  title: { marginTop: 8, color: "#ffffff", fontSize: 31, fontWeight: "900", letterSpacing: -0.8 },
  subtitle: { maxWidth: 620, marginTop: 8, color: "#cbd5e1", fontSize: 14, lineHeight: 21 },
  filters: { paddingHorizontal: 20, paddingBottom: 14 },
});
