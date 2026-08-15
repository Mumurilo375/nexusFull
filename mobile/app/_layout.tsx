import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AuthProvider } from "../src/contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="mobile" />
        <Stack.Screen name="login" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="cadastro" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="checkout" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="configuracoes" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="biblioteca" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="pedidos" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="historico" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="pedidos/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="favoritos" options={{ animation: "slide_from_right" }} />
      </Stack>
    </AuthProvider>
  );
}

export function ErrorBoundary({ retry }: { error: Error; retry: () => void }) {
  return (
    <View style={styles.errorScreen}>
      <Ionicons name="alert-circle-outline" size={42} color="#fda4af" />
      <Text accessibilityRole="header" style={styles.errorTitle}>Algo saiu do esperado</Text>
      <Text style={styles.errorText}>Não foi possível exibir esta tela. Tente recarregar para continuar.</Text>
      <Pressable accessibilityRole="button" onPress={retry} style={styles.retryButton}>
        <Text style={styles.retryText}>Recarregar tela</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  errorScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, backgroundColor: "#020617" },
  errorTitle: { marginTop: 14, color: "#ffffff", fontSize: 22, fontWeight: "800", textAlign: "center" },
  errorText: { maxWidth: 340, marginTop: 8, color: "#cbd5e1", fontSize: 14, lineHeight: 21, textAlign: "center" },
  retryButton: { minHeight: 48, marginTop: 20, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#2563eb", paddingHorizontal: 18 },
  retryText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
});
