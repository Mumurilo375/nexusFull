import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../../contexts/useAuth";

export default function AdminGuard({ children }: { children?: React.ReactNode }) {
  const { isReady, isAuthenticated, isAdmin } = useAuth();
  if (!isReady) return <View style={styles.loading}><ActivityIndicator color="#22d3ee" /><Text style={styles.text}>Verificando acesso...</Text></View>;
  if (!isAuthenticated) return <Redirect href={{ pathname: "/login", params: { from: "/admin" } } as never} />;
  if (!isAdmin) return <Redirect href="/(tabs)/perfil" />;
  return children ? children : <Slot />;
}
const styles = StyleSheet.create({ loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#020617" }, text: { color: "#cbd5e1", fontSize: 14 } });
