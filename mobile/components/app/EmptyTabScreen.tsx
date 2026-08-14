import { StyleSheet, View } from "react-native";

export default function EmptyTabScreen() {
  return <View style={styles.screen} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
});
