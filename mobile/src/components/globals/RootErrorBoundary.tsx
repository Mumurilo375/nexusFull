import { Text } from "@/src/components/ui/Typography";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

type RootErrorBoundaryProps = {
  retry: () => void;
};

export default function RootErrorBoundary({ retry }: RootErrorBoundaryProps) {
  return (
    <View style={styles.errorScreen}>
      <Ionicons name="alert-circle-outline" size={42} color="#fda4af" />
      <Text accessibilityRole="header" style={styles.errorTitle}>
        Algo saiu do esperado
      </Text>
      <Text style={styles.errorText}>
        Não foi possível exibir esta tela. Tente recarregar para continuar.
      </Text>
      <Pressable accessibilityRole="button" onPress={retry} style={styles.retryButton}>
        <Text style={styles.retryText}>Recarregar tela</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  errorScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    backgroundColor: "#020617",
  },
  errorTitle: {
    marginTop: 14,
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  errorText: {
    maxWidth: 340,
    marginTop: 8,
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  retryButton: {
    minHeight: 48,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#2563eb",
    paddingHorizontal: 18,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
});
