import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import AnimatedBottomTabBar from "../../src/components/globals/AnimatedBottomTabBar";
import { useAuth } from "../../src/contexts/useAuth";
import { ADMIN_ACCESS_PERMISSION } from "../../src/services/auth";

export default function TabsLayout() {
  const { hasPermission } = useAuth();
  const canAccessAdmin = hasPermission(ADMIN_ACCESS_PERMISSION);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);

    return () => subscription.remove();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: reduceMotion ? "none" : "shift",
      }}
      tabBar={(props) => <AnimatedBottomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Início" }} />
      <Tabs.Screen name="loja" options={{ title: "Loja" }} />
      <Tabs.Screen name="carrinho" options={{ title: "Carrinho" }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
      <Tabs.Screen name="admin-tab" options={{ title: "Admin", href: canAccessAdmin ? "/admin-tab" : null }} />
    </Tabs>
  );
}
