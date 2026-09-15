import { Tabs } from "expo-router";
import { Easing } from "react-native";
import { useReduceMotion } from "../../src/contexts/MotionContext";
import AnimatedBottomTabBar from "../../src/components/globals/AnimatedBottomTabBar";
import { useAuth } from "../../src/contexts/useAuth";
import { ADMIN_ACCESS_PERMISSION } from "../../src/services/auth";

const canvasColor = "#020617";
const tabTransitionDuration = 420;

export default function TabsLayout() {
  const { hasPermission } = useAuth();
  const canAccessAdmin = hasPermission(ADMIN_ACCESS_PERMISSION);
  const reduceMotion = useReduceMotion();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: reduceMotion ? "none" : "shift",
        sceneStyle: { backgroundColor: canvasColor },
        transitionSpec: reduceMotion
          ? { animation: "timing", config: { duration: 0 } }
          : {
              animation: "timing",
              config: {
                duration: tabTransitionDuration,
                easing: Easing.inOut(Easing.ease),
              },
            },
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
