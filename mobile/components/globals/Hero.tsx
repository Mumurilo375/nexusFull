import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import TrailerPlayer from "./TrailerPlayer";

const heroImage = require("../../assets/home/utils/residenthero.jpg");

type HeroProps = { isExpanded: boolean; onExploreGames: () => void; onShowHowItWorks: () => void };

export default function Hero({ isExpanded, onExploreGames, onShowHowItWorks }: HeroProps) {
  return (
    <ImageBackground source={heroImage} style={[styles.hero, isExpanded && styles.heroExpanded]} imageStyle={styles.heroImage}>
      <View style={styles.heroOverlay} />
      <View style={[styles.content, isExpanded && styles.contentExpanded]}>
        <View style={styles.copy}>
          <Text style={styles.brand}>NEXUS</Text>
          <Text style={styles.title}>Entre no próximo nível</Text>
          <Text style={styles.description}>Explore novos mundos, compare jogos e acompanhe um fluxo de compra simulado com keys para diferentes plataformas.</Text>
          <View style={[styles.actions, isExpanded && styles.actionsExpanded]}>
            <Pressable accessibilityRole="button" accessibilityLabel="Explorar jogos" onPress={onExploreGames} style={({ pressed }) => [styles.primaryButton, styles.actionButton, pressed && styles.buttonPressed]}>
              <Text style={styles.primaryButtonText}>Explorar jogos</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onShowHowItWorks} style={({ pressed }) => [styles.secondaryButton, styles.actionButton, pressed && styles.buttonPressed]}>
              <Text style={styles.secondaryButtonText}>Como funciona</Text>
            </Pressable>
          </View>
        </View>
        <TrailerPlayer isExpanded={isExpanded} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 590, overflow: "hidden", backgroundColor: "#0f172a" },
  heroExpanded: { minHeight: 520, margin: 24, borderRadius: 24 },
  heroImage: { opacity: 0.72 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(2, 6, 23, 0.58)" },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 32, paddingBottom: 28, justifyContent: "space-between", gap: 28 },
  contentExpanded: { flexDirection: "row", alignItems: "center", padding: 48, gap: 48 },
  copy: { flex: 1, maxWidth: 460 },
  brand: { color: "#dbeafe", fontSize: 27, fontWeight: "900", letterSpacing: -0.7 },
  title: { marginTop: 5, maxWidth: 420, color: "#ffffff", fontSize: 37, lineHeight: 40, fontWeight: "900", letterSpacing: -1.1 },
  description: { marginTop: 14, color: "#e2e8f0", fontSize: 15, lineHeight: 23 },
  actions: { marginTop: 22, gap: 10 },
  actionsExpanded: { flexDirection: "row" },
  actionButton: { minHeight: 48 },
  primaryButton: { alignItems: "center", justifyContent: "center", paddingHorizontal: 20, borderRadius: 12, backgroundColor: "#2563eb" },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  secondaryButton: { alignItems: "center", justifyContent: "center", paddingHorizontal: 18, borderWidth: 1, borderColor: "rgba(203,213,225,0.55)", borderRadius: 12, backgroundColor: "rgba(2,6,23,0.82)" },
  secondaryButtonText: { color: "#f8fafc", fontSize: 15, fontWeight: "700" },
  buttonPressed: { opacity: 0.78 },
});
