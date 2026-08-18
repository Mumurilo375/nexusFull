import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useCallback, useEffect, useRef, useState, type ComponentProps } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/contexts/useAuth";
import { subscribeToCartChanges } from "../../src/contexts/cartEvents";
import api from "../../src/services/api";

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
  const { isAdmin, isAuthenticated, isReady } = useAuth();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);

  const loadCartQuantity = useCallback(async () => {
    if (!isReady || !isAuthenticated) {
      setCartQuantity(0);
      return;
    }

    try {
      const cart = await api.get<{ items?: { quantity?: number }[] }>("/cart");
      setCartQuantity((cart.items ?? []).reduce((total, item) => total + Math.max(1, Number(item.quantity ?? 1)), 0));
    } catch {
      setCartQuantity(0);
    }
  }, [isAuthenticated, isReady]);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    void loadCartQuantity();
    return subscribeToCartChanges(() => void loadCartQuantity());
  }, [loadCartQuantity]);

  return (
    <View style={styles.safeArea}>
      <View style={[styles.bar, { paddingBottom: insets.bottom }]} accessibilityRole="tablist">
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
              badgeCount={route.name === "carrinho" ? cartQuantity : 0}
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
  badgeCount: number;
  onPress: () => void;
  onLongPress: () => void;
};

function TabButton({ label, icon, activeIcon, isFocused, reduceMotion, compact, badgeCount, onPress, onLongPress }: TabButtonProps) {
  const progress = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isFocused ? 1 : 0,
      duration: reduceMotion ? 0 : 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isFocused, progress, reduceMotion]);

  return (
    <Animated.View style={[styles.tabSlot, { flexGrow: progress.interpolate({ inputRange: [0, 1], outputRange: compact ? [0.9, 1.55] : [0.86, 1.55] }) }]}>
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel={badgeCount > 0 ? `${label}, ${badgeCount} ${badgeCount === 1 ? "item" : "itens"}` : label}
        accessibilityState={{ selected: isFocused }}
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [styles.tabTarget, pressed && styles.tabPressed]}
      >
        <Animated.View style={[styles.tab, compact && styles.tabCompact, isFocused && styles.tabActive, isFocused && compact && styles.tabActiveCompact]}>
          <View style={styles.iconWrap}>
            <Ionicons name={isFocused ? activeIcon : icon} size={22} color={isFocused ? "#ffffff" : "#94a3b8"} />
            {badgeCount > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{badgeCount > 99 ? "99+" : badgeCount}</Text></View> : null}
          </View>
          {isFocused ? (
            <Animated.Text style={[styles.label, { opacity: progress }]} numberOfLines={1}>
              {label}
            </Animated.Text>
          ) : null}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: "100%",
    backgroundColor: "#0f172a",
  },
  bar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 68,
    backgroundColor: "#0f172a",
  },
  tabSlot: { flexBasis: 0, minWidth: 0 },
  tabTarget: { flex: 1, minHeight: 64, alignItems: "stretch", justifyContent: "center" },
  tab: { width: "100%", height: 56, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 12 },
  tabActive: { paddingHorizontal: 12, backgroundColor: "#2563eb" },
  tabCompact: { gap: 5 },
  tabActiveCompact: { paddingHorizontal: 8 },
  label: { color: "#ffffff", fontSize: 13, fontWeight: "700" },
  iconWrap: { position: "relative" },
  badge: { position: "absolute", top: -9, right: -13, minWidth: 17, height: 17, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#0f172a", borderRadius: 9, backgroundColor: "#f43f5e", paddingHorizontal: 3 },
  badgeText: { color: "#ffffff", fontSize: 9, fontWeight: "900" },
  tabPressed: { opacity: 0.76 },
});
