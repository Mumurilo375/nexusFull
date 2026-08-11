import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Nexus Mobile</Text>
      <Text style={styles.subtitle}>Aplicativo em construção.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#101828" },
  title: { color: "#ffffff", fontSize: 28, fontWeight: "700" },
  subtitle: { color: "#98a2b3", fontSize: 16, marginTop: 8 },
});
