import { Text } from "@/src/components/ui/Typography";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { useCallback, useEffect, useState, type ComponentProps } from "react";
import { AccessibilityInfo, Animated, Easing, Keyboard, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/useAuth";
import { subscribeToCartChanges } from "../../contexts/cartEvents";
import api from "../../services/api";
import { ADMIN_ACCESS_PERMISSION } from "../../services/auth";

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
  const { hasPermission, isAuthenticated, isReady } = useAuth();
  const canAccessAdmin = hasPermission(ADMIN_ACCESS_PERMISSION);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

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
    void Promise.resolve().then(loadCartQuantity);
    return subscribeToCartChanges(() => void loadCartQuantity());
  }, [loadCartQuantity]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (keyboardVisible) return null;

  return (
    <View style={styles.safeArea}>
      <View style={[styles.bar, { paddingBottom: insets.bottom }]} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          if (route.name === "admin-tab" && !canAccessAdmin) {
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
  badgeCount: number;
  onPress: () => void;
  onLongPress: () => void;
};

function TabButton({ label, icon, activeIcon, isFocused, reduceMotion, badgeCount, onPress, onLongPress }: TabButtonProps) {
  const [progress] = useState(() => new Animated.Value(isFocused ? 1 : 0));

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: isFocused ? 1 : 0,
      duration: reduceMotion ? 0 : 160,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [isFocused, progress, reduceMotion]);

  const animatedStyle = {
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }),
    transform: [
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] }) },
    ],
  };

  return (
    <Animated.View style={styles.tabSlot}>
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel={badgeCount > 0 ? `${label}, ${badgeCount} ${badgeCount === 1 ? "item" : "itens"}` : label}
        accessibilityState={{ selected: isFocused }}
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [styles.tabTarget, pressed && styles.tabPressed]}
      >
        <Animated.View style={[styles.tab, isFocused && styles.tabActive, animatedStyle]}>
          <View style={styles.iconWrap}>
            <Ionicons name={isFocused ? activeIcon : icon} size={22} color={isFocused ? "#ffffff" : "#94a3b8"} />
            {badgeCount > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{badgeCount > 99 ? "99+" : badgeCount}</Text></View> : null}
          </View>
          <Animated.Text style={[styles.label, isFocused && styles.labelActive, { opacity: progress }]}>{label}</Animated.Text>
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
    paddingHorizontal: 4,
  },
  tabSlot: { flex: 1, minWidth: 0 },
  tabTarget: { flex: 1, minHeight: 64, paddingHorizontal: 3, alignItems: "stretch", justifyContent: "center" },
  tab: { width: "100%", minHeight: 52, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, borderRadius: 12, paddingVertical: 5, paddingHorizontal: 2 },
  tabActive: { backgroundColor: "#2563eb" },
  label: { alignSelf: "stretch", color: "#cbd5e1", fontSize: 11, fontWeight: "700", lineHeight: 14, textAlign: "center" },
  labelActive: { color: "#ffffff" },
  iconWrap: { position: "relative" },
  badge: { position: "absolute", top: -9, right: -13, minWidth: 17, height: 17, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#0f172a", borderRadius: 9, backgroundColor: "#f43f5e", paddingHorizontal: 3 },
  badgeText: { color: "#ffffff", fontSize: 9, fontWeight: "900" },
  tabPressed: { opacity: 0.76 },
});
