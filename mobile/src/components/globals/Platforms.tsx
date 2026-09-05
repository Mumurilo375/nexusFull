import { Text } from "@/src/components/ui/Typography";
import { useEffect, useMemo, useState } from "react";
import { AccessibilityInfo, Animated, Image, type ImageSourcePropType, Pressable, StyleSheet, View } from "react-native";

const platforms = [
  { id: "PlayStation", description: "Explore jogos disponíveis para os consoles PlayStation.", image: require("../../../assets/home/platforms/playstationConsole.png"), tint: "#172554", accent: "#3b82f6" },
  { id: "Xbox", description: "Encontre títulos para jogar no ecossistema Xbox.", image: require("../../../assets/home/platforms/xboxConsole.png"), tint: "#052e16", accent: "#22c55e" },
  { id: "Nintendo Switch", description: "Veja o catálogo disponível para Nintendo Switch.", image: require("../../../assets/home/platforms/nintendoconsole.png"), tint: "#4c0519", accent: "#fb7185" },
  { id: "Steam", description: "Descubra jogos para PC disponíveis na Steam.", image: require("../../../assets/home/platforms/computador2.png"), tint: "#083344", accent: "#22d3ee" },
] as const satisfies readonly { id: string; description: string; image: ImageSourcePropType; tint: string; accent: string }[];

type PlatformsProps = { isExpanded: boolean; onExploreGames: (platform: string) => void };

export default function Platforms({ isExpanded, onExploreGames }: PlatformsProps) {
  const [selectedPlatformId, setSelectedPlatformId] = useState<(typeof platforms)[number]["id"]>(platforms[0].id);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [contentOpacity] = useState(() => new Animated.Value(1));
  const selectedPlatform = useMemo(
    () => platforms.find((platform) => platform.id === selectedPlatformId) ?? platforms[0],
    [selectedPlatformId],
  );

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setTimeout(() => {
      const index = platforms.findIndex((platform) => platform.id === selectedPlatformId);
      setSelectedPlatformId(platforms[(index + 1) % platforms.length].id);
    }, 4200);
    return () => clearTimeout(timer);
  }, [reduceMotion, selectedPlatformId]);

  useEffect(() => {
    if (reduceMotion) {
      contentOpacity.setValue(1);
      return;
    }
    contentOpacity.setValue(0.72);
    Animated.timing(contentOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [contentOpacity, reduceMotion, selectedPlatformId]);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Escolha onde você joga</Text>
      <Text style={styles.description}>Abra o catálogo já filtrado pela sua plataforma e compare as opções disponíveis.</Text>
      <View accessibilityRole="tablist" style={styles.tabs}>
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
      </View>
      <Animated.View style={[styles.feature, { backgroundColor: selectedPlatform.tint, opacity: contentOpacity }, isExpanded && styles.featureExpanded]}>
        <View style={[styles.accent, { backgroundColor: selectedPlatform.accent }]} />
        <View style={[styles.copy, isExpanded && styles.copyExpanded]}>
          <Text style={styles.platformName}>{selectedPlatform.id}</Text>
          <Text style={styles.featureDescription}>{selectedPlatform.description}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={`Ver jogos para ${selectedPlatform.id}`} onPress={() => onExploreGames(selectedPlatform.id)} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
            <Text style={styles.primaryButtonText}>Explorar catálogo</Text>
          </Pressable>
        </View>
        <View style={[styles.visual, isExpanded && styles.visualExpanded]}>
          <Image source={selectedPlatform.image} style={styles.platformImage} resizeMode="contain" accessibilityLabel={`Console ou dispositivo ${selectedPlatform.id}`} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, paddingTop: 42, paddingBottom: 46 },
  title: { color: "#ffffff", fontSize: 29, lineHeight: 34, fontWeight: "900", letterSpacing: -0.7 },
  description: { marginTop: 10, maxWidth: 650, color: "#cbd5e1", fontSize: 15, lineHeight: 23 },
  tabs: { marginTop: 20, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tab: { width: "48%", minHeight: 44, flexGrow: 1, justifyContent: "center", paddingHorizontal: 12, borderWidth: 1, borderRadius: 12, borderColor: "#334155", backgroundColor: "#0f172a" },
  tabSelected: { backgroundColor: "#172554" },
  tabText: { color: "#94a3b8", fontSize: 14, fontWeight: "700" },
  tabTextSelected: { color: "#ffffff" },
  feature: { position: "relative", minHeight: 218, marginTop: 14, padding: 18, overflow: "hidden", borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 8 },
  featureExpanded: { minHeight: 270, padding: 30 },
  accent: { position: "absolute", top: 0, bottom: 0, left: 0, width: 1 },
  copy: { zIndex: 1, flex: 1, minWidth: 0, maxWidth: 430 },
  copyExpanded: { paddingLeft: 10 },
  platformName: { color: "#ffffff", fontSize: 23, lineHeight: 28, fontWeight: "900", letterSpacing: -0.45 },
  featureDescription: { marginTop: 8, color: "#cbd5e1", fontSize: 13, lineHeight: 19 },
  primaryButton: { alignSelf: "flex-start", minHeight: 46, marginTop: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, borderRadius: 12, backgroundColor: "#2563eb" },
  primaryButtonText: { color: "#ffffff", fontSize: 13, fontWeight: "700" },
  visual: { width: "39%", height: 150, alignItems: "center", justifyContent: "center" },
  visualExpanded: { width: "46%", height: 220 },
  platformImage: { width: "100%", height: "100%" },
  buttonPressed: { opacity: 0.78 },
});
