import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import RootErrorBoundary from "../src/components/globals/RootErrorBoundary";
import { AuthProvider } from "../src/contexts/AuthContext";

const fontSources = {
  SpaceGrotesk_400Regular: require("@expo-google-fonts/space-grotesk/400Regular/SpaceGrotesk_400Regular.ttf"),
  SpaceGrotesk_600SemiBold: require("@expo-google-fonts/space-grotesk/600SemiBold/SpaceGrotesk_600SemiBold.ttf"),
  SpaceGrotesk_700Bold: require("@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf"),
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontSources);

  if (fontError) throw fontError;
  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
        <Stack.Screen name="mobile" options={{ animation: "none" }} />
      </Stack>
    </AuthProvider>
  );
}

export function ErrorBoundary({ retry }: { error: Error; retry: () => void }) {
  return <RootErrorBoundary retry={retry} />;
}
