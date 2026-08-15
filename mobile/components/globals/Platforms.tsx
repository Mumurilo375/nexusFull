import { useMemo, useState } from "react";
import { Image, type ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const platforms = [
  { id: "PlayStation", description: "Explore jogos disponíveis para os consoles PlayStation.", image: require("../../assets/home/platforms/playstationConsole.png"), tint: "#172554", accent: "#3b82f6" },
  { id: "Xbox", description: "Encontre títulos para jogar no ecossistema Xbox.", image: require("../../assets/home/platforms/xboxConsole.png"), tint: "#052e16", accent: "#22c55e" },
  { id: "Nintendo Switch", description: "Veja o catálogo disponível para Nintendo Switch.", image: require("../../assets/home/platforms/nintendoconsole.png"), tint: "#4c0519", accent: "#fb7185" },
  { id: "Steam", description: "Descubra jogos para PC disponíveis na Steam.", image: require("../../assets/home/platforms/computador2.png"), tint: "#083344", accent: "#22d3ee" },
] as const satisfies readonly { id: string; description: string; image: ImageSourcePropType; tint: string; accent: string }[];

type PlatformsProps = { isExpanded: boolean; onExploreGames: (platform: string) => void };

export default function Platforms({ isExpanded, onExploreGames }: PlatformsProps) {
  const [selectedPlatformId, setSelectedPlatformId] = useState<(typeof platforms)[number]["id"]>(platforms[0].id);
  const selectedPlatform = useMemo(
    () => platforms.find((platform) => platform.id === selectedPlatformId) ?? platforms[0],
    [selectedPlatformId],
  );

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Escolha onde você joga</Text>
      <Text style={styles.description}>Abra o catálogo já filtrado pela sua plataforma e compare as opções disponíveis.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs} style={styles.tabsScroll}>
        {platforms.map((platform) => {
          const isSelected = platform.id === selectedPlatform.id;

          return (
            <Pressable
              key={platform.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelectedPlatformId(platform.id)}
              style={({ pressed }) => [styles.tab, isSelected && [styles.tabSelected, { borderColor: platform.accent }], pressed && styles.buttonPressed]}
            >
              <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>{platform.id}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={[styles.feature, { backgroundColor: selectedPlatform.tint }, isExpanded && styles.featureExpanded]}>
        <View style={[styles.accent, { backgroundColor: selectedPlatform.accent }]} />
        <View style={[styles.copy, isExpanded && styles.copyExpanded]}>
          <Text style={styles.platformName}>{selectedPlatform.id}</Text>
          <Text style={styles.featureDescription}>{selectedPlatform.description}</Text>
          <Pressable accessibilityRole="button" onPress={() => onExploreGames(selectedPlatform.id)} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
            <Text style={styles.primaryButtonText}>Ver jogos para {selectedPlatform.id}</Text>
          </Pressable>
        </View>
        <View style={[styles.visual, isExpanded && styles.visualExpanded]}>
          <Image source={selectedPlatform.image} style={styles.platformImage} resizeMode="contain" accessibilityLabel={`Console ou dispositivo ${selectedPlatform.id}`} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 52 },
  title: { color: "#ffffff", fontSize: 29, lineHeight: 34, fontWeight: "900", letterSpacing: -0.7 },
  description: { marginTop: 10, maxWidth: 650, color: "#cbd5e1", fontSize: 15, lineHeight: 23 },
  tabsScroll: { marginTop: 24, marginHorizontal: -20 },
  tabs: { paddingHorizontal: 20, gap: 8 },
  tab: { minHeight: 44, justifyContent: "center", paddingHorizontal: 14, borderWidth: 1, borderRadius: 12, borderColor: "#334155", backgroundColor: "#0f172a" },
  tabSelected: { backgroundColor: "#172554" },
  tabText: { color: "#94a3b8", fontSize: 14, fontWeight: "700" },
  tabTextSelected: { color: "#ffffff" },
  feature: { position: "relative", marginTop: 16, padding: 20, overflow: "hidden", borderRadius: 16 },
  featureExpanded: { minHeight: 310, justifyContent: "center", padding: 32 },
  accent: { position: "absolute", top: 0, bottom: 0, left: 0, width: 1 },
  copy: { zIndex: 1, maxWidth: 430 },
  copyExpanded: { paddingLeft: 16 },
  platformName: { color: "#ffffff", fontSize: 27, lineHeight: 32, fontWeight: "900", letterSpacing: -0.5 },
  featureDescription: { marginTop: 10, color: "#cbd5e1", fontSize: 15, lineHeight: 22 },
  primaryButton: { alignSelf: "flex-start", minHeight: 48, marginTop: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, borderRadius: 12, backgroundColor: "#2563eb" },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  visual: { height: 170, marginTop: 14, alignItems: "center", justifyContent: "center" },
  visualExpanded: { position: "absolute", width: "48%", height: "100%", right: 10, bottom: 0, marginTop: 0 },
  platformImage: { width: "100%", height: "100%" },
  buttonPressed: { opacity: 0.78 },
});
