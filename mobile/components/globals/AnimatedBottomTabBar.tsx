import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { useEffect, useState, type ComponentProps } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];
type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

const tabs: Record<string, { icon: IconName; activeIcon: IconName }> = {
  index: { icon: "home-outline", activeIcon: "home" },
  loja: { icon: "game-controller-outline", activeIcon: "game-controller" },
  carrinho: { icon: "cart-outline", activeIcon: "cart" },
  perfil: { icon: "person-outline", activeIcon: "person" },
};

export default function AnimatedBottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
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
  onPress: () => void;
  onLongPress: () => void;
};

function TabButton({ label, icon, activeIcon, isFocused, reduceMotion, onPress, onLongPress }: TabButtonProps) {
  const [progress] = useState(() => new Animated.Value(isFocused ? 1 : 0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isFocused ? 1 : 0,
      duration: reduceMotion ? 0 : 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isFocused, progress, reduceMotion]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: [48, 112] });

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.tabTarget, pressed && styles.tabPressed]}
    >
      <Animated.View style={[styles.tab, { width }, isFocused && styles.tabActive]}>
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
  tab: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 999 },
  tabActive: { paddingHorizontal: 12, backgroundColor: "#2563eb" },
  label: { color: "#ffffff", fontSize: 13, fontWeight: "700" },
  tabPressed: { opacity: 0.76 },
});
