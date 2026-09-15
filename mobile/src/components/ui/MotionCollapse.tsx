import { useEffect, useState, type PropsWithChildren } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { useReduceMotion } from "../../contexts/MotionContext";

/** Measure the answer so expanding it also moves the following questions smoothly. */
export default function MotionCollapse({ visible, children }: PropsWithChildren<{ visible: boolean }>) {
  const reduceMotion = useReduceMotion();
  const [contentHeight, setContentHeight] = useState(0);
  const [height] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const toValue = visible ? contentHeight : 0;
    if (reduceMotion) {
      height.setValue(toValue);
      return;
    }
    const animation = Animated.timing(height, {
      toValue, duration: visible ? 240 : 180, easing: Easing.out(Easing.cubic),
      // A measured accordion must update layout; isolate this work to its answer.
      useNativeDriver: false, isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [contentHeight, height, reduceMotion, visible]);

  return <Animated.View
    pointerEvents={visible ? "auto" : "none"}
    accessibilityElementsHidden={!visible}
    importantForAccessibility={visible ? "auto" : "no-hide-descendants"}
    style={[styles.clip, { height }]}
  >
    <View style={styles.answer} onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}>{children}</View>
  </Animated.View>;
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  answer: { position: "absolute", top: 0, left: 0, right: 0 },
});
