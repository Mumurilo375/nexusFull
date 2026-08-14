import { Pressable, StyleSheet, Text, View } from "react-native";

type IntroProps = {
  isExpanded: boolean;
  onExploreStore: () => void;
  onShowHowItWorks: () => void;
};

export default function Intro({ isExpanded, onExploreStore, onShowHowItWorks }: IntroProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha seu próximo jogo</Text>
      <Text style={styles.description}>Grandes histórias, mundos novos e a plataforma certa para jogar.</Text>
      <View style={[styles.actionRow, isExpanded && styles.actionRowExpanded]}>
        <Pressable accessibilityRole="button" onPress={onExploreStore} style={({ pressed }) => [styles.primaryButton, styles.flexButton, pressed && styles.buttonPressed]}>
          <Text style={styles.primaryButtonText}>Explorar a loja</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onShowHowItWorks} style={({ pressed }) => [styles.outlineButton, styles.flexButton, pressed && styles.buttonPressed]}>
          <Text style={styles.outlineButtonText}>Como funciona</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingHorizontal: 24, paddingTop: 64, paddingBottom: 56 },
  title: { color: "#ffffff", fontSize: 31, lineHeight: 36, fontWeight: "900", letterSpacing: -1, textAlign: "center" },
  description: { marginTop: 14, maxWidth: 590, color: "#cbd5e1", fontSize: 16, lineHeight: 24, textAlign: "center" },
  actionRow: { width: "100%", marginTop: 28, flexDirection: "column", gap: 12 },
  actionRowExpanded: { maxWidth: 430, flexDirection: "row" },
  flexButton: { flex: 1 },
  primaryButton: { minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 20, borderRadius: 12, backgroundColor: "#2563eb" },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  outlineButton: { minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, borderRadius: 12, borderWidth: 1, borderColor: "#475569", backgroundColor: "#020617" },
  outlineButtonText: { color: "#e2e8f0", fontSize: 15, fontWeight: "700" },
  buttonPressed: { opacity: 0.78 },
});
