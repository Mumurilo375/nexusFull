import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { useReduceMotion } from "../../../contexts/MotionContext";

export default function OrderConfirmationMark() {
  const reduceMotion = useReduceMotion();
  const [progress] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1, duration: 560, easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== "web", isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, reduceMotion]);

  return <View style={styles.frame} accessible accessibilityLabel="Pedido confirmado">
    <Animated.View pointerEvents="none" style={[styles.ring, {
      opacity: progress.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 0.8, 0] }),
      transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.3] }) }],
    }]} />
    <Animated.View style={{ transform: [
      { scale: progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.65, 1, 1] }) },
      { rotate: progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: ["-16deg", "0deg", "0deg"] }) },
    ] }}><Ionicons name="checkmark-circle" size={56} color="#34d399" /></Animated.View>
  </View>;
}

const styles = StyleSheet.create({
  frame: { width: 76, height: 76, alignItems: "center", justifyContent: "center" },
  ring: { ...StyleSheet.absoluteFill, borderWidth: 2, borderColor: "#34d399", borderRadius: 38 },
});
