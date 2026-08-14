import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/contexts/useAuth";

type IconName = ComponentProps<typeof Ionicons>["name"];

const tabs: Record<string, { icon: IconName; activeIcon: IconName }> = {
  index: { icon: "home-outline", activeIcon: "home" },
  loja: { icon: "game-controller-outline", activeIcon: "game-controller" },
  carrinho: { icon: "cart-outline", activeIcon: "cart" },
  perfil: { icon: "person-outline", activeIcon: "person" },
  "admin-tab": { icon: "shield-outline", activeIcon: "shield" },
};

export default function AnimatedBottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);

    return () => subscription.remove();
  }, []);

  return (
    <View style={[styles.safeArea, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          if (route.name === "admin-tab" && !isAdmin) {
            return null;
          }

          const { options } = descriptors[route.key];
          const config = tabs[route.name];

          if (!config) {
            return null;
          }

          const isFocused = state.index === index;
          const label = options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TabButton
              key={route.key}
              label={label}
              icon={config.icon}
              activeIcon={config.activeIcon}
              isFocused={isFocused}
              reduceMotion={reduceMotion}
              compact={isAdmin}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
            />
          );
        })}
      </View>
    </View>
  );
}

type TabButtonProps = {
  label: string;
  icon: IconName;
  activeIcon: IconName;
  isFocused: boolean;
  reduceMotion: boolean;
  compact: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

function TabButton({ label, icon, activeIcon, isFocused, reduceMotion, compact, onPress, onLongPress }: TabButtonProps) {
  const progress = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isFocused ? 1 : 0,
      duration: reduceMotion ? 0 : 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isFocused, progress, reduceMotion]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: compact ? [42, 96] : [48, 112] });

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.tabTarget, compact && styles.tabTargetCompact, pressed && styles.tabPressed]}
    >
      <Animated.View style={[styles.tab, { width }, compact && styles.tabCompact, isFocused && styles.tabActive, isFocused && compact && styles.tabActiveCompact]}>
        <Ionicons name={isFocused ? activeIcon : icon} size={22} color={isFocused ? "#ffffff" : "#94a3b8"} />
        {isFocused ? (
          <Animated.Text style={[styles.label, { opacity: progress }]} numberOfLines={1}>
            {label}
          </Animated.Text>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  bar: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 60,
    paddingHorizontal: 4,
    borderRadius: 999,
    backgroundColor: "#0f172a",
    ...Platform.select({
      android: { elevation: 8 },
      ios: { shadowColor: "#000000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 18 },
      default: { shadowColor: "#000000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 18 },
    }),
  },
  tabTarget: { minWidth: 48, minHeight: 56, alignItems: "center", justifyContent: "center" },
  tabTargetCompact: { minWidth: 42 },
  tab: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 999 },
  tabActive: { paddingHorizontal: 12, backgroundColor: "#2563eb" },
  tabCompact: { gap: 5 },
  tabActiveCompact: { paddingHorizontal: 8 },
  label: { color: "#ffffff", fontSize: 13, fontWeight: "700" },
  tabPressed: { opacity: 0.76 },
});
