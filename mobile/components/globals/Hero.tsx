import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import TrailerPlayer from "./TrailerPlayer";

const heroImage = require("../../assets/home/utils/residenthero.jpg");

type HeroProps = { isExpanded: boolean; onExploreGames: () => void };

export default function Hero({ isExpanded, onExploreGames }: HeroProps) {
  return (
    <ImageBackground source={heroImage} style={[styles.hero, isExpanded && styles.heroExpanded]} imageStyle={styles.heroImage}>
      <View style={styles.heroOverlay} />
      <View style={[styles.content, isExpanded && styles.contentExpanded]}>
        <View style={styles.copy}>
          <Text style={styles.brand}>NEXUS</Text>
          <Text style={styles.title}>Entre no próximo nível</Text>
          <Text style={styles.description}>Explore novos mundos, compare jogos e acompanhe um fluxo de compra simulado com keys para diferentes plataformas.</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Explorar jogos" onPress={onExploreGames} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
            <Text style={styles.primaryButtonText}>Explorar jogos</Text>
          </Pressable>
        </View>
        <TrailerPlayer isExpanded={isExpanded} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 700, overflow: "hidden", backgroundColor: "#0f172a" },
  heroExpanded: { minHeight: 560, margin: 24, borderRadius: 24 },
  heroImage: { opacity: 0.72 },
  heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(2, 6, 23, 0.58)" },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 36, justifyContent: "space-between", gap: 36 },
  contentExpanded: { flexDirection: "row", alignItems: "center", padding: 48, gap: 48 },
  copy: { flex: 1, maxWidth: 460 },
  brand: { color: "#dbeafe", fontSize: 34, fontWeight: "900", letterSpacing: -1.1 },
  title: { marginTop: 6, color: "#ffffff", fontSize: 44, lineHeight: 46, fontWeight: "900", letterSpacing: -1.6 },
  description: { marginTop: 18, color: "#e2e8f0", fontSize: 16, lineHeight: 25 },
  primaryButton: { alignSelf: "flex-start", minHeight: 48, marginTop: 28, alignItems: "center", justifyContent: "center", paddingHorizontal: 20, borderRadius: 12, backgroundColor: "#2563eb" },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  buttonPressed: { opacity: 0.78 },
});
