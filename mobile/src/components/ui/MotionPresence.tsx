import { useEffect, useState } from "react";
import { Animated, Easing, Platform, type ViewProps } from "react-native";
import { useReduceMotion } from "../../contexts/MotionContext";

/** Retain outgoing content just long enough to reverse its entrance. */
export default function MotionPresence({ visible, style, ...props }: ViewProps & { visible: boolean }) {
  const reduceMotion = useReduceMotion();
  const [mounted, setMounted] = useState(visible);
  const [progress] = useState(() => new Animated.Value(visible ? 1 : 0));

  useEffect(() => {
    if (visible) setMounted(true);
    if (reduceMotion) {
      progress.setValue(visible ? 1 : 0);
      setMounted(visible);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 220 : 140,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.quad),
      useNativeDriver: Platform.OS !== "web",
      isInteraction: false,
    });
    animation.start(({ finished }) => { if (finished && !visible) setMounted(false); });
    return () => animation.stop();
  }, [progress, reduceMotion, visible]);

  if (!visible && !mounted) return null;
  return <Animated.View {...props}
    pointerEvents={visible ? "auto" : "none"}
    accessibilityElementsHidden={!visible}
    importantForAccessibility={visible ? "auto" : "no-hide-descendants"}
    style={[style, {
      opacity: progress,
      transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }],
    }]}
  />;
}
