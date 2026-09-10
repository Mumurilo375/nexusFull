import { Text } from "@/src/components/ui/Typography";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import ProductCatalog from "./ProductCatalog";
import ProductFilters from "./ProductFilters";
import HomeHeader from "../globals/HomeHeader";

export default function Store() {
  const { platform } = useLocalSearchParams<{ platform?: string | string[] }>();
  const initialPlatform = Array.isArray(platform) ? platform[0] : platform;
  return <StoreContent key={initialPlatform} initialPlatform={initialPlatform} />;
}

function StoreContent({ initialPlatform }: { initialPlatform?: string }) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(initialPlatform ? [initialPlatform] : []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const updateFilter = (key: "platform" | "category", values: string[]) => {
    if (key === "platform") setSelectedPlatforms(values);
    else setSelectedCategories(values);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <HomeHeader />
      <ProductCatalog
        selectedPlatforms={selectedPlatforms}
        selectedCategories={selectedCategories}
        controls={(
          <>
            <View style={styles.header}>
              <Text accessibilityRole="header" style={styles.title}>Encontre seu próximo jogo</Text>
              <Text style={styles.subtitle}>Busque, filtre e compare as versões disponíveis.</Text>
            </View>
            <View style={styles.filters}>
              <ProductFilters
                selectedPlatforms={selectedPlatforms}
                selectedCategories={selectedCategories}
                onChange={updateFilter}
              />
            </View>
          </>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" },
  header: { paddingTop: 14, paddingBottom: 10 },
  title: { maxWidth: 500, color: "#ffffff", fontSize: 24, lineHeight: 29, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { maxWidth: 580, marginTop: 3, color: "#cbd5e1", fontSize: 13, lineHeight: 18 },
  filters: { paddingBottom: 10 },
});
