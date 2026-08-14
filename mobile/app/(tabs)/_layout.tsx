import { Tabs } from "expo-router";
import AnimatedBottomTabBar from "../../components/globals/AnimatedBottomTabBar";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <AnimatedBottomTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Início" }} />
      <Tabs.Screen name="loja" options={{ title: "Loja" }} />
      <Tabs.Screen name="carrinho" options={{ title: "Carrinho" }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
