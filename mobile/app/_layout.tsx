import { Stack } from "expo-router";
import {
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
  useFonts,
} from "@expo-google-fonts/space-grotesk";
import RootErrorBoundary from "../src/components/globals/RootErrorBoundary";
import { AuthProvider } from "../src/contexts/AuthContext";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  if (fontError) throw fontError;
  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false, animation: "fade", animationDuration: 180 }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="mobile" />
      </Stack>
    </AuthProvider>
  );
}

export function ErrorBoundary({ retry }: { error: Error; retry: () => void }) {
  return <RootErrorBoundary retry={retry} />;
}
