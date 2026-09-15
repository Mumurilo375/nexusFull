import { useEffect, useState } from "react";
import { Animated, Easing, Platform, type ViewProps } from "react-native";
import { useReduceMotion } from "../../contexts/MotionContext";

/** Explain a control's state through a small rotation or thumb movement. */
export default function MotionIndicator({ active, variant = "rotate", style, ...props }: ViewProps & {
  active: boolean;
  variant?: "rotate" | "toggle";
}) {
  const reduceMotion = useReduceMotion();
  const [progress] = useState(() => new Animated.Value(active ? 1 : 0));
  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(active ? 1 : 0);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: active ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== "web",
      isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [active, progress, reduceMotion]);

  return <Animated.View {...props} style={[style, { transform: variant === "toggle"
    ? [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }]
    : [{ rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) }],
  }]} />;
}
