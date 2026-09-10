import { useFocusEffect } from "expo-router";
import { useCallback, useState, type PropsWithChildren } from "react";
import { Animated, Easing, Platform, StyleSheet } from "react-native";
import { useReduceMotion } from "../../contexts/MotionContext";

/** A short arrival for leaf routes, without remounting forms or resetting scroll. */
export default function ScreenMotion({ children }: PropsWithChildren) {
  const reduceMotion = useReduceMotion();
  const [progress] = useState(() => new Animated.Value(1));

  useFocusEffect(useCallback(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }

    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
      isInteraction: false,
    });
    animation.start();

    return () => {
      animation.stop();
      progress.setValue(1);
    };
  }, [progress, reduceMotion]));

  return (
    <Animated.View style={[styles.screen, {
      opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }),
      // Native stacks already provide spatial navigation; web needs its own arrival.
      transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [Platform.OS === "web" ? 12 : 0, 0] }) }],
    }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: "#020617" } });
