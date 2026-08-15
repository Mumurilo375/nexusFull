import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const steps = [
  {
    icon: "search-outline" as const,
    title: "Encontre um jogo",
    description: "Use a busca e os filtros para comparar as opções do catálogo.",
  },
  {
    icon: "game-controller-outline" as const,
    title: "Escolha a plataforma",
    description: "A plataforma define preço, estoque e a key simulada do pedido.",
  },
  {
    icon: "key-outline" as const,
    title: "Conclua a simulação",
    description: "Finalize sem dados reais e consulte o pedido e a key na sua biblioteca.",
  },
];

export default function HowItWorksSheet({ visible, onClose, onExplore }: { visible: boolean; onClose: () => void; onExplore: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text accessibilityRole="header" style={styles.title}>Como funciona</Text>
            <Text style={styles.subtitle}>Do catálogo à key, em três decisões simples.</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
            <Ionicons name="close" size={23} color="#e2e8f0" />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.demoNotice}>
            <Ionicons name="school-outline" size={22} color="#67e8f9" />
            <View style={styles.demoCopy}>
              <Text style={styles.demoTitle}>Demonstração acadêmica</Text>
              <Text style={styles.demoText}>Nenhum pagamento real é processado. Não informe dados financeiros verdadeiros.</Text>
            </View>
          </View>
          <View style={styles.steps}>
            {steps.map((step, index) => (
              <View key={step.title} style={styles.step}>
                <View style={styles.stepIcon}>
                  <Ionicons name={step.icon} size={23} color="#bfdbfe" />
                </View>
                <View style={styles.stepCopy}>
                  <Text style={styles.stepMeta}>Etapa {index + 1}</Text>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepText}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Pressable accessibilityRole="button" onPress={onExplore} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>Explorar a loja</Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" },
  header: { paddingHorizontal: 20, paddingVertical: 18, flexDirection: "row", alignItems: "flex-start", gap: 16, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  headerCopy: { flex: 1 },
  title: { color: "#ffffff", fontSize: 29, lineHeight: 34, fontWeight: "900", letterSpacing: -0.7 },
  subtitle: { marginTop: 6, color: "#94a3b8", fontSize: 14, lineHeight: 21 },
  closeButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 14, backgroundColor: "#0f172a" },
  content: { width: "100%", maxWidth: 720, alignSelf: "center", padding: 20, paddingBottom: 32 },
  demoNotice: { padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 12, borderWidth: 1, borderColor: "rgba(34,211,238,0.35)", borderRadius: 16, backgroundColor: "rgba(8,145,178,0.1)" },
  demoCopy: { flex: 1 },
  demoTitle: { color: "#cffafe", fontSize: 15, fontWeight: "800" },
  demoText: { marginTop: 5, color: "#a5f3fc", fontSize: 13, lineHeight: 20 },
  steps: { marginTop: 26 },
  step: { minHeight: 112, paddingVertical: 18, flexDirection: "row", alignItems: "flex-start", gap: 14, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  stepIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "rgba(37,99,235,0.16)" },
  stepCopy: { flex: 1 },
  stepMeta: { color: "#60a5fa", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  stepTitle: { marginTop: 5, color: "#ffffff", fontSize: 18, fontWeight: "800" },
  stepText: { marginTop: 6, color: "#cbd5e1", fontSize: 14, lineHeight: 21 },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18, borderTopWidth: 1, borderTopColor: "#1e293b" },
  primaryButton: { width: "100%", maxWidth: 680, minHeight: 52, alignSelf: "center", paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderRadius: 14, backgroundColor: "#2563eb" },
  primaryText: { color: "#ffffff", fontSize: 15, fontWeight: "800" },
  pressed: { opacity: 0.74 },
});
