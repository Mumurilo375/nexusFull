import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import RootErrorBoundary from "../src/components/globals/RootErrorBoundary";
import { AuthProvider } from "../src/contexts/AuthContext";
import { MotionProvider, useReduceMotion } from "../src/contexts/MotionContext";
import ScreenMotion from "../src/components/globals/ScreenMotion";

const fontSources = {
  SpaceGrotesk_400Regular: require("@expo-google-fonts/space-grotesk/400Regular/SpaceGrotesk_400Regular.ttf"),
  SpaceGrotesk_600SemiBold: require("@expo-google-fonts/space-grotesk/600SemiBold/SpaceGrotesk_600SemiBold.ttf"),
  SpaceGrotesk_700Bold: require("@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf"),
};

const canvasColor = "#020617";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontSources);

  if (fontError) throw fontError;
  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <MotionProvider>
        <RootNavigator />
      </MotionProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const reduceMotion = useReduceMotion();

  return (
    <Stack
      screenLayout={({ children, route }) =>
        ["(tabs)", "admin", "index", "mobile"].includes(route.name)
          ? <>{children}</>
          : <ScreenMotion>{children}</ScreenMotion>
      }
      screenOptions={{ headerShown: false, animation: reduceMotion ? "none" : "slide_from_right", contentStyle: { backgroundColor: canvasColor } }}
    >
      <Stack.Screen name="index" options={{ animation: "none" }} />
      <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
      <Stack.Screen name="mobile" options={{ animation: "none" }} />
    </Stack>
  );
}

export function ErrorBoundary({ retry }: { error: Error; retry: () => void }) {
  return <RootErrorBoundary retry={retry} />;
}
