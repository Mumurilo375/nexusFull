import { StyleSheet, Text, View } from "react-native";

export default function Footer() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NEXUS FULL</Text>
      <Text style={styles.description}>Sua próxima aventura começa aqui.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingHorizontal: 24, paddingTop: 18, paddingBottom: 10 },
  title: { color: "#ffffff", fontSize: 15, fontWeight: "900", letterSpacing: 1.2 },
  description: { marginTop: 6, color: "#94a3b8", fontSize: 13 },
});
