import { Stack } from "expo-router";
import { AuthProvider } from "../src/contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="mobile" />
        <Stack.Screen name="login" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="cadastro" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="checkout" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="configuracoes" options={{ animation: "slide_from_right" }} />
      </Stack>
    </AuthProvider>
  );
}
