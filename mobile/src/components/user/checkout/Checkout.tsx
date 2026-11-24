import Pressable from "@/src/components/ui/MotionPressable";
import { Text } from "@/src/components/ui/Typography";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, AppState, Linking, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../contexts/useAuth";
import { notifyCartChanged } from "../../../contexts/cartEvents";
import api from "../../../services/api";
import { getApiErrorMessage } from "../../../services/http";
import { toMoney } from "../../../utils/format";
import type { CartItem, CartResponse } from "../cart/cart.types";
import PlatformLogo from "../../loja/PlatformLogo";
import OrderConfirmationMark from "./OrderConfirmationMark";

type CheckoutOrder = {
  id: number; orderNumber: string; totalAmount: number | string; status: string;
  checkoutUrl: string | null; paymentExpiresAt: string | null;
};
type CheckoutResponse = { order: CheckoutOrder };
const quantity = (item: CartItem) => Math.max(1, Number(item.quantity ?? 1));

export default function Checkout() {
  const { isAuthenticated, isReady } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);

  useEffect(() => {
    if (!isReady || !isAuthenticated) return;
    let active = true;
    void Promise.all([api.get<CartResponse>("/cart"), api.get<{ order: CheckoutOrder | null }>("/checkout")])
      .then(([cart, checkout]) => { if (active) { setItems(cart.items ?? []); setOrder(checkout.order); } })
      .catch((error) => { if (active) setError(getApiErrorMessage(error, "Não foi possível carregar o checkout.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated, isReady]);

  const checkPayment = useCallback(async (refresh = false) => {
    if (!order) return;
    try {
      const data = refresh
        ? await api.post<CheckoutResponse>(`/checkout/${order.id}/refresh`)
        : await api.get<CheckoutResponse>(`/checkout/${order.id}`);
      setOrder(data.order);
      setError("");
    } catch (error) { setError(getApiErrorMessage(error, "Não foi possível consultar o pagamento.")); }
  }, [order]);

  useEffect(() => {
    if (order?.status !== "pending") return;
    const timer = setInterval(() => void checkPayment(), 5000);
    const listener = AppState.addEventListener("change", (state) => { if (state === "active") void checkPayment(); });
    return () => { clearInterval(timer); listener.remove(); };
  }, [order?.status, checkPayment]);

  useEffect(() => { if (order?.status === "paid") notifyCartChanged(); }, [order?.status]);

  async function openPayment(url: string) {
    try { await Linking.openURL(url); }
    catch { setError("Não foi possível abrir o Mercado Pago. Tente novamente."); }
  }

  async function createOrder() {
    setBusy(true);
    setError("");
    try {
      const data = await api.post<CheckoutResponse>("/checkout");
      setOrder(data.order);
      if (data.order.status === "pending" && data.order.checkoutUrl) await openPayment(data.order.checkoutUrl);
    } catch (error) { setError(getApiErrorMessage(error, "Não foi possível iniciar o pagamento.")); }
    finally { setBusy(false); }
  }

  if (!isReady || (isAuthenticated && loading)) return <SafeAreaView style={styles.safeArea}><View style={styles.loading}><ActivityIndicator color="#67e8f9" /><Text style={styles.muted}>Carregando resumo...</Text></View></SafeAreaView>;
  if (!isAuthenticated) return <SafeAreaView style={styles.safeArea}><View style={styles.state}><Text style={styles.stateTitle}>Entre para continuar</Text><Pressable onPress={() => router.replace("/login")} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Abrir tela de login</Text></Pressable></View></SafeAreaView>;

  const paid = order?.status === "paid";
  const failed = order?.status === "failed";
  const hasStockIssues = items.some((item) => item.isQuantityAvailable === false);
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={18} color="#cbd5e1" /><Text style={styles.backText}>Voltar</Text></Pressable>
        <Text accessibilityRole="header" style={styles.title}>Resumo do pedido</Text>
        {error ? <View accessibilityLiveRegion="polite" style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : null}
        {order ? (
          <View style={styles.panel}>
            {paid ? <OrderConfirmationMark /> : null}
            <Text style={styles.panelTitle}>{paid ? "Pagamento confirmado" : failed ? "Pagamento não concluído" : "Aguardando pagamento"}</Text>
            <Text style={styles.subtitle}>Pedido {order.orderNumber} · {toMoney(order.totalAmount)}</Text>
            <Text style={styles.subtitle}>{paid ? "Suas keys estão disponíveis na biblioteca." : failed ? "A reserva foi liberada. Um pagamento aprovado após o encerramento será estornado." : "Conclua o pagamento no Mercado Pago e volte ao aplicativo. A confirmação será atualizada automaticamente."}</Text>
            {!paid && !failed && order.paymentExpiresAt ? <Text style={styles.subtitle}>Reserva até {new Date(order.paymentExpiresAt).toLocaleString("pt-BR")}.</Text> : null}
            {order.status === "pending" ? <>
              {order.checkoutUrl ? <Pressable onPress={() => void openPayment(order.checkoutUrl!)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Abrir Mercado Pago</Text></Pressable> : null}
              <Pressable disabled={busy} onPress={async () => { setBusy(true); await checkPayment(true); setBusy(false); }} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>{busy ? "Consultando..." : "Já paguei, verificar pagamento"}</Text></Pressable>
            </> : <Pressable onPress={() => router.replace((paid ? "/biblioteca" : "/carrinho") as never)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{paid ? "Ver keys na biblioteca" : "Voltar ao carrinho"}</Text></Pressable>}
          </View>
        ) : items.length ? <>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Itens do pedido</Text>
            {items.map((item) => <View key={item.id} style={styles.orderItem}>
              <PlatformLogo platformName={item.listing?.platform?.name} iconUrl={item.listing?.platform?.iconUrl} size={38} />
              <View style={styles.orderItemCopy}><Text style={styles.orderItemTitle}>{item.listing?.game?.title ?? "Jogo"}</Text><Text style={styles.orderItemMeta}>{item.listing?.platform?.name} · {quantity(item)} unidade(s)</Text></View>
              <Text style={styles.orderItemPrice}>{toMoney(Number(item.listing?.price ?? 0) * quantity(item))}</Text>
            </View>)}
            <View style={styles.totalLine}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>{toMoney(items.reduce((sum, item) => sum + Number(item.listing?.price ?? 0) * quantity(item), 0))}</Text></View>
          </View>
          <View style={styles.panel}><Text style={styles.panelTitle}>Pagamento pelo Mercado Pago</Text><Text style={styles.subtitle}>Escolha a forma de pagamento no Mercado Pago. Os itens ficam reservados por 30 minutos, e as keys são liberadas após a confirmação.</Text>
            <Pressable disabled={busy || hasStockIssues} onPress={() => void createOrder()} style={[styles.primaryButton, (busy || hasStockIssues) && styles.disabled]}><Text style={styles.primaryButtonText}>{busy ? "Abrindo pagamento..." : hasStockIssues ? "Ajuste o carrinho para continuar" : "Continuar para pagamento"}</Text></Pressable>
            {hasStockIssues ? <Pressable onPress={() => router.replace("/carrinho" as never)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Voltar ao carrinho</Text></Pressable> : null}
          </View>
        </> : <View style={styles.state}><Text style={styles.stateTitle}>Seu carrinho está vazio</Text><Pressable onPress={() => router.replace("/(tabs)/loja" as never)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Ir para loja</Text></Pressable></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" }, content: { width: "100%", maxWidth: 720, alignSelf: "center", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 36 },
  back: { alignSelf: "flex-start", minHeight: 48, flexDirection: "row", alignItems: "center", gap: 8 }, backText: { color: "#cbd5e1", fontSize: 14, fontWeight: "700" },
  title: { marginTop: 14, color: "#ffffff", fontSize: 30, fontWeight: "900", letterSpacing: -0.7 }, subtitle: { marginTop: 8, color: "#cbd5e1", fontSize: 14, lineHeight: 21 },
  panel: { marginTop: 16, padding: 16, borderWidth: 1, borderColor: "#334155", borderRadius: 16, backgroundColor: "#0f172a" }, panelTitle: { color: "#ffffff", fontSize: 19, fontWeight: "800" }, orderItem: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#1e293b", flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 }, orderItemCopy: { flex: 1, minWidth: 150 }, orderItemTitle: { color: "#f8fafc", fontSize: 14, fontWeight: "700" }, orderItemMeta: { marginTop: 4, color: "#94a3b8", fontSize: 12 }, orderItemPrice: { color: "#ffffff", fontSize: 14, fontWeight: "800" }, totalLine: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#334155", flexDirection: "row", justifyContent: "space-between" }, totalLabel: { color: "#cbd5e1", fontSize: 14 }, totalValue: { color: "#ffffff", fontSize: 19, fontWeight: "900" },
  primaryButton: { minHeight: 50, marginTop: 18, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#2563eb" }, primaryButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "800", textAlign: "center" }, secondaryButton: { width: "100%", minHeight: 50, marginTop: 10, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#475569", borderRadius: 13, backgroundColor: "#020617" }, secondaryButtonText: { color: "#e2e8f0", fontSize: 14, fontWeight: "800", textAlign: "center" }, disabled: { opacity: 0.55 }, error: { marginTop: 16, padding: 12, borderWidth: 1, borderColor: "rgba(244,63,94,0.4)", borderRadius: 12, backgroundColor: "rgba(244,63,94,0.1)" }, errorText: { color: "#ffe4e6", fontSize: 13, lineHeight: 19 }, loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }, muted: { color: "#94a3b8", fontSize: 14 }, state: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 }, stateTitle: { marginTop: 14, color: "#ffffff", fontSize: 22, fontWeight: "900", textAlign: "center" },
});
