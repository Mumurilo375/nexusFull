import { useEffect, useRef, useState, type Ref } from "react";
import { Animated, Easing, Platform, Pressable, StyleSheet, type PressableProps, type View } from "react-native";
import { useReduceMotion } from "../../contexts/MotionContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Keeps the original hit area, layout and handlers while acknowledging touch. */
export default function MotionPressable({
  style, children, disabled, onPressIn, onPressOut, onHoverIn, onHoverOut, ref, ...props
}: PressableProps & { ref?: Ref<View> }) {
  const reduceMotion = useReduceMotion();
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [scale] = useState(() => new Animated.Value(1));
  const previousPressed = useRef(false);
  const isPressed = pressed && !disabled;
  const resolvedStyle = typeof style === "function" ? style({ pressed: isPressed, hovered }) : style;
  const existingTransform = StyleSheet.flatten(resolvedStyle)?.transform;

  useEffect(() => {
    const changed = previousPressed.current !== isPressed;
    previousPressed.current = isPressed;
    if (reduceMotion || disabled) {
      scale.setValue(1);
      return;
    }
    if (!changed) return;
    const animation = Animated.timing(scale, {
      toValue: isPressed ? 0.97 : 1,
      duration: isPressed ? 110 : 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== "web",
      isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [disabled, isPressed, reduceMotion, scale]);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...props}
      ref={ref}
      disabled={disabled}
      onPressIn={(event) => { setPressed(true); onPressIn?.(event); }}
      onPressOut={(event) => { setPressed(false); onPressOut?.(event); }}
      onHoverIn={(event) => { setHovered(true); onHoverIn?.(event); }}
      onHoverOut={(event) => { setHovered(false); onHoverOut?.(event); }}
      style={[resolvedStyle, { transform: [...(Array.isArray(existingTransform) ? existingTransform : []), { scale }] }]}
    >
      {typeof children === "function" ? children({ pressed: isPressed, hovered }) : children}
    </AnimatedPressable>
  );
}
