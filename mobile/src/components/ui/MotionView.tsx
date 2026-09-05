import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, type ViewProps } from "react-native";
import { useReduceMotion } from "../../contexts/MotionContext";

type MotionViewProps = ViewProps & {
  motionKey?: string | number | boolean;
  variant?: "enter" | "fade" | "settle";
  delay?: number;
  animateOnMount?: boolean;
};

/** Animate a new result or changed value without remounting its content. */
export default function MotionView({ motionKey, variant = "enter", delay = 0, animateOnMount = true, style, ...props }: MotionViewProps) {
  const reduceMotion = useReduceMotion();
  const [progress] = useState(() => new Animated.Value(1));
  const previousKey = useRef(motionKey);

  useEffect(() => {
    const changed = previousKey.current !== motionKey;
    previousKey.current = motionKey;
    if (reduceMotion || (!animateOnMount && !changed)) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: variant === "settle" ? 300 : 220,
      delay: Math.min(160, Math.max(0, delay)),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== "web",
      isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [animateOnMount, delay, motionKey, progress, reduceMotion, variant]);

  return <Animated.View {...props} style={[style, {
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }),
    transform: [
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [variant === "enter" ? 8 : 0, 0] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [variant === "settle" ? 0.9 : 1, 1] }) },
    ],
  }]} />;
}
