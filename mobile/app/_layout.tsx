import { Stack } from "expo-router";
import RootErrorBoundary from "../src/components/globals/RootErrorBoundary";
import { AuthProvider } from "../src/contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="mobile" />
        <Stack.Screen name="comofunciona/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="login/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="cadastro/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="checkout/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="configuracoes/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="biblioteca/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="pedidos/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="historico/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="pedidos/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="favoritos/index" options={{ animation: "slide_from_right" }} />
      </Stack>
    </AuthProvider>
  );
}

export function ErrorBoundary({ retry }: { error: Error; retry: () => void }) {
  return <RootErrorBoundary retry={retry} />;
}
