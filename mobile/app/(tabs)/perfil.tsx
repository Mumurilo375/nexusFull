import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/contexts/useAuth";

export default function Profile() {
  const { isAuthenticated, isReady, user, logout } = useAuth();

  if (!isReady) {
    return <SafeAreaView style={styles.screen}><ActivityIndicator color="#60a5fa" /></SafeAreaView>;
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.panel}>
          <Text style={styles.title}>Sua conta</Text>
          <Text style={styles.text}>Entre para acessar seus pedidos, favoritos e dados da conta.</Text>
          <Pressable style={styles.button} onPress={() => router.push({ pathname: "/login", params: { from: "/(tabs)/perfil" } })}>
            <Text style={styles.buttonText}>Entrar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.panel}>
        <Text style={styles.title}>Olá, {user?.username}</Text>
        <Text style={styles.text}>{user?.email}</Text>
        <Pressable style={styles.secondaryButton} onPress={() => void logout()}>
          <Text style={styles.secondaryButtonText}>Sair da conta</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#020617", padding: 24 },
  panel: { width: "100%", maxWidth: 440, borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#0f172a", padding: 24 },
  title: { color: "#ffffff", fontSize: 24, fontWeight: "700" },
  text: { marginTop: 8, color: "#cbd5e1", fontSize: 15, lineHeight: 22 },
  button: { marginTop: 24, alignItems: "center", borderRadius: 999, backgroundColor: "#2563eb", paddingVertical: 14 },
  buttonText: { color: "#ffffff", fontWeight: "700" },
  secondaryButton: { marginTop: 24, alignItems: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 999, paddingVertical: 14 },
  secondaryButtonText: { color: "#cbd5e1", fontWeight: "700" },
});
