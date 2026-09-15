import { useMemo } from "react";
import { Animated, StyleSheet, View } from "react-native";

type Props = {
  width: number;
  height: number;
  progress: Animated.Value;
  moving: boolean;
};

// Sample a rounded rectangle at equal distances, then offset its points to
// create a continuous lightning stroke. Geometry is calculated only on resize.
function lightningSegments(width: number, height: number) {
  const radius = 10;
  const horizontal = Math.max(0, width - radius * 2);
  const vertical = Math.max(0, height - radius * 2);
  const arc = Math.PI * radius / 2;
  const perimeter = 2 * (horizontal + vertical) + arc * 4;
  const count = Math.min(160, Math.ceil(perimeter / 7));
  const lengths = [horizontal, arc, vertical, arc, horizontal, arc, vertical, arc];
  const centers = [
    { x: width - radius, y: radius },
    { x: width - radius, y: height - radius },
    { x: radius, y: height - radius },
    { x: radius, y: radius },
  ];
  const points = Array.from({ length: count }, (_, index) => {
    let distance = index / count * perimeter;
    let section = 0;
    while (section < 7 && distance > lengths[section]) {
      distance -= lengths[section++];
    }
    const jitter = index % 2 === 0 ? 1.6 : -1.2;
    if (section === 0) return { x: radius + distance, y: jitter };
    if (section === 2) return { x: width - jitter, y: radius + distance };
    if (section === 4) return { x: width - radius - distance, y: height - jitter };
    if (section === 6) return { x: jitter, y: height - radius - distance };
    const corner = (section - 1) / 2;
    const angle = (corner - 1) * Math.PI / 2 + distance / radius;
    return {
      x: centers[corner].x + Math.cos(angle) * (radius - jitter),
      y: centers[corner].y + Math.sin(angle) * (radius - jitter),
    };
  });
  return points.map((point, index) => {
    const next = points[(index + 1) % count];
    const length = Math.hypot(next.x - point.x, next.y - point.y);
    return {
      left: (point.x + next.x - length) / 2,
      top: (point.y + next.y) / 2 - 4,
      width: length + 1,
      angle: `${Math.atan2(next.y - point.y, next.x - point.x)}rad`,
    };
  });
}

export default function ElectricKeyBorder({ width, height, progress, moving }: Props) {
  const segments = useMemo(() => lightningSegments(width, height), [width, height]);

  return (
    <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
      {segments.map((segment, index) => (
        <Animated.View key={index} style={[
          styles.segment,
          { left: segment.left, top: segment.top, width: segment.width, transform: [{ rotate: segment.angle }],
            opacity: moving ? Animated.modulo(Animated.add(progress, 1 - index / segments.length), 1).interpolate({
              inputRange: [0, 0.025, 0.09, 0.22, 0.36, 0.98, 1],
              outputRange: [1, 1, 0.85, 0.4, 0.08, 0.08, 1],
            }) : 0.3,
          },
        ]}>
          <View style={styles.glow} />
          <View style={styles.stroke} />
          <View style={styles.core} />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  segment: { position: "absolute", height: 8, justifyContent: "center" },
  glow: { position: "absolute", width: "100%", height: 8, borderRadius: 4, backgroundColor: "#1d4ed8", opacity: 0.35 },
  stroke: { position: "absolute", width: "100%", height: 3.5, borderRadius: 2, backgroundColor: "#1d4ed8" },
  core: { position: "absolute", width: "100%", height: 1.25, borderRadius: 1, backgroundColor: "#3b82f6" },
});
