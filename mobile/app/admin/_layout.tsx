import { Stack } from "expo-router";
import AdminGuard from "../../src/components/auth/AdminGuard";
import ScreenMotion from "../../src/components/globals/ScreenMotion";
import { useReduceMotion } from "../../src/contexts/MotionContext";

const canvasColor = "#020617";

export default function AdminLayout() {
  const reduceMotion = useReduceMotion();
  return (
    <AdminGuard>
      <Stack
        screenLayout={({ children }) => <ScreenMotion>{children}</ScreenMotion>}
        screenOptions={{ headerShown: false, animation: reduceMotion ? "none" : "slide_from_right", contentStyle: { backgroundColor: canvasColor } }}
      />
    </AdminGuard>
  );
}
