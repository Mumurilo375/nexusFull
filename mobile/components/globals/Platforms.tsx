import { useMemo, useState } from "react";
import { Image, type ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const platforms = [
  { id: "PlayStation", description: "Explore jogos disponíveis para os consoles PlayStation.", image: require("../../assets/home/platforms/playstationConsole.png"), tint: "#172554", accent: "#3b82f6" },
  { id: "Xbox", description: "Encontre títulos para jogar no ecossistema Xbox.", image: require("../../assets/home/platforms/xboxConsole.png"), tint: "#052e16", accent: "#22c55e" },
  { id: "Nintendo Switch", description: "Veja o catálogo disponível para Nintendo Switch.", image: require("../../assets/home/platforms/nintendoconsole.png"), tint: "#4c0519", accent: "#fb7185" },
  { id: "Steam", description: "Descubra jogos para PC disponíveis na Steam.", image: require("../../assets/home/platforms/computador2.png"), tint: "#083344", accent: "#22d3ee" },
] as const satisfies readonly { id: string; description: string; image: ImageSourcePropType; tint: string; accent: string }[];

type PlatformsProps = { isExpanded: boolean; onExploreGames: () => void };

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
          <Pressable accessibilityRole="button" onPress={onExploreGames} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
            <Text style={styles.primaryButtonText}>Ver jogos para {selectedPlatform.id}</Text>
          </Pressable>
        </View>
        <Image source={selectedPlatform.image} style={styles.platformImage} resizeMode="contain" accessibilityLabel={`Console ou dispositivo ${selectedPlatform.id}`} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, paddingBottom: 64 },
  title: { color: "#ffffff", fontSize: 31, lineHeight: 36, fontWeight: "900", letterSpacing: -1 },
  description: { marginTop: 14, maxWidth: 650, color: "#cbd5e1", fontSize: 16, lineHeight: 24 },
  tabsScroll: { marginTop: 24, marginHorizontal: -20 },
  tabs: { paddingHorizontal: 20, gap: 8 },
  tab: { minHeight: 44, justifyContent: "center", paddingHorizontal: 14, borderWidth: 1, borderRadius: 12, borderColor: "#334155", backgroundColor: "#0f172a" },
  tabSelected: { backgroundColor: "#172554" },
  tabText: { color: "#94a3b8", fontSize: 14, fontWeight: "700" },
  tabTextSelected: { color: "#ffffff" },
  feature: { position: "relative", minHeight: 390, marginTop: 16, padding: 24, overflow: "hidden", borderRadius: 16 },
  featureExpanded: { minHeight: 310, justifyContent: "center" },
  accent: { position: "absolute", top: 0, bottom: 0, left: 0, width: 4 },
  copy: { zIndex: 1, maxWidth: 430 },
  copyExpanded: { paddingLeft: 16 },
  platformName: { color: "#ffffff", fontSize: 31, lineHeight: 37, fontWeight: "900", letterSpacing: -0.8 },
  featureDescription: { marginTop: 14, color: "#cbd5e1", fontSize: 16, lineHeight: 24 },
  primaryButton: { alignSelf: "flex-start", minHeight: 48, marginTop: 24, alignItems: "center", justifyContent: "center", paddingHorizontal: 20, borderRadius: 12, backgroundColor: "#2563eb" },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  platformImage: { position: "absolute", width: "100%", height: 235, right: 0, bottom: 2 },
  buttonPressed: { opacity: 0.78 },
});
