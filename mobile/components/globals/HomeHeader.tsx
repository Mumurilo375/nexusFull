import { Image, StyleSheet, Text, View } from "react-native";

const logoImage = require("../../assets/home/utils/logo.png");

export default function HomeHeader() {
  return (
    <View style={styles.container}>
      <Image source={logoImage} style={styles.logo} resizeMode="contain" accessibilityLabel="Nexus Store" />
      <Text style={styles.label}>NEXUS MOBILE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 64, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#000000", borderBottomWidth: 1, borderBottomColor: "#172033" },
  logo: { width: 112, height: 34 },
  label: { color: "#94a3b8", fontSize: 11, fontWeight: "700", letterSpacing: 1.4 },
});
