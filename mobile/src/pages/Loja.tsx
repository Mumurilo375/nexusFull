import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import ProductCatalog from "../components/loja/ProductCatalog";
import ProductFilters from "../components/loja/ProductFilters";

export default function Loja() {
  const { platform } = useLocalSearchParams<{ platform?: string | string[] }>();
  const initialPlatform = Array.isArray(platform) ? platform[0] : platform;
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(initialPlatform ? [initialPlatform] : []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (initialPlatform) setSelectedPlatforms([initialPlatform]);
  }, [initialPlatform]);

  const updateFilter = (key: "platform" | "category", values: string[]) => {
    if (key === "platform") setSelectedPlatforms(values);
    else setSelectedCategories(values);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>Encontre seu próximo jogo</Text>
        <Text style={styles.subtitle}>Navegue pelas capas, descubra ofertas e compare versões no detalhe de cada jogo.</Text>
      </View>
      <View style={styles.filters}><ProductFilters selectedPlatforms={selectedPlatforms} selectedCategories={selectedCategories} onChange={updateFilter} /></View>
      <ProductCatalog selectedPlatforms={selectedPlatforms} selectedCategories={selectedCategories} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" },
  header: { width: "100%", maxWidth: 1120, alignSelf: "center", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 15 },
  title: { maxWidth: 500, color: "#ffffff", fontSize: 28, lineHeight: 33, fontWeight: "900", letterSpacing: -0.7 },
  subtitle: { maxWidth: 580, marginTop: 7, color: "#cbd5e1", fontSize: 14, lineHeight: 20 },
  filters: { width: "100%", maxWidth: 1120, alignSelf: "center", paddingHorizontal: 16, paddingBottom: 14 },
});
