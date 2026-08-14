import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/useAuth";
import api from "../services/api";
import { getApiErrorMessage } from "../services/http";
import type { CartItem, CartResponse } from "../components/user/cart/cart.types";

type PaymentMethod = "card" | "paypal" | "pix";
type CheckoutOrder = { id: number; orderNumber: string; totalAmount: number | string; status: string };

const toMoney = (value: number) => `R$ ${value.toFixed(2)}`;
const digitsOnly = (value: string) => value.replace(/\D/g, "");

function isValidFutureExpiry(value: string) {
  const digits = digitsOnly(value);
  if (digits.length !== 4) return false;

  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));
  if (month < 1 || month > 12) return false;

  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

function getQuantity(item: CartItem) {
  return Math.max(1, Number(item.quantity ?? 1));
}

function getStockIssue(item: CartItem) {
  return item.isQuantityAvailable === false;
}

export default function Checkout() {
  const { isAuthenticated, isReady } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalPassword, setPaypalPassword] = useState("");
  const [pixConfirmed, setPixConfirmed] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.get<CartResponse>("/cart");
      setItems(data.items ?? []);
    } catch (requestError) {
      setItems([]);
      setError(getApiErrorMessage(requestError, "Não foi possível carregar o checkout."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isReady && isAuthenticated) void loadCart();
    if (isReady && !isAuthenticated) setLoading(false);
  }, [isAuthenticated, isReady, loadCart]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.listing?.price ?? 0) * getQuantity(item), 0), [items]);
  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + getQuantity(item), 0), [items]);
  const hasStockIssues = useMemo(() => items.some(getStockIssue), [items]);

  const validatePayment = () => {
    if (paymentMethod === "card") {
      if (cardName.trim().length < 3) return "Informe o nome impresso no cartão.";
      if (digitsOnly(cardNumber).length !== 16) return "O número do cartão deve ter 16 dígitos.";
      if (!isValidFutureExpiry(cardExpiry)) return "Informe uma validade válida e que ainda não tenha expirado.";
      if (digitsOnly(cardCvv).length !== 3) return "O CVV deve ter exatamente 3 dígitos.";
    }
    if (paymentMethod === "paypal") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail.trim())) return "Informe um email válido para o PayPal.";
      if (paypalPassword.trim().length < 6) return "Informe a senha do PayPal com pelo menos 6 caracteres.";
    }
    if (paymentMethod === "pix" && !pixConfirmed) return "Confirme a leitura do QR Code para concluir o pagamento.";
    return "";
  };

  const createOrder = async () => {
    const validationError = hasStockIssues
      ? "O estoque de um ou mais itens mudou. Volte ao carrinho e ajuste as quantidades."
      : validatePayment();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");
      const data = await api.post<{ order: CheckoutOrder }>("/checkout", { paymentMethod });
      setOrder(data.order);
      setItems([]);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Não foi possível finalizar o pedido."));
      await loadCart();
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!isReady || loading) return <LoadingState label="Carregando resumo..." />;

  if (!isAuthenticated) {
    return <StateScreen icon="lock-closed-outline" title="Entre para continuar" text="Faça login para acessar o checkout." actionLabel="Abrir tela de login" onAction={() => router.replace("/login")} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={18} color="#cbd5e1" /><Text style={styles.backText}>Voltar</Text></Pressable>
          <Text accessibilityRole="header" style={styles.title}>{order ? "Pedido confirmado" : "Resumo do pedido"}</Text>
          <Text style={styles.subtitle}>{order ? "Sua compra simulada foi concluída e a key está pronta para consulta." : "Escolha a forma de pagamento e conclua a compra simulada."}</Text>

          {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : null}

          {order ? (
            <View style={styles.successCard}><Ionicons name="checkmark-circle" size={48} color="#34d399" /><Text style={styles.successTitle}>Compra concluída</Text><Text style={styles.successText}>Pedido {order.orderNumber} criado com sucesso.</Text><Text style={styles.successAmount}>Total: {toMoney(Number(order.totalAmount))}</Text><Pressable onPress={() => router.replace("/(tabs)/loja" as never)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Continuar comprando</Text></Pressable></View>
          ) : items.length === 0 ? (
            <StateScreen icon="cart-outline" title="Seu carrinho está vazio" text="Adicione um jogo antes de abrir o checkout." actionLabel="Ir para loja" onAction={() => router.replace("/(tabs)/loja" as never)} />
          ) : (
            <>
              <View style={styles.steps}><Step active title="1. Revisar itens" text="Confira jogo e plataforma" /><Step title="2. Escolher método" text="Preencha a simulação" /><Step title="3. Ver keys" text="Acesse pela biblioteca" /></View>
              <View style={styles.panel}><Text style={styles.panelTitle}>Itens do pedido</Text>{items.map((item) => <View key={item.id} style={styles.orderItem}><View style={styles.orderItemCopy}><Text style={styles.orderItemTitle} numberOfLines={1}>{item.listing?.game?.title ?? "Jogo"}</Text><Text style={styles.orderItemMeta}>{item.listing?.platform?.name ?? "Plataforma"} · {getQuantity(item)} unidade(s)</Text></View><Text style={styles.orderItemPrice}>{toMoney(Number(item.listing?.price ?? 0) * getQuantity(item))}</Text></View>)}<View style={styles.totalLine}><Text style={styles.totalLabel}>{totalQuantity} unidade(s)</Text><Text style={styles.totalValue}>{toMoney(subtotal)}</Text></View></View>
              <View style={styles.panel}><Text style={styles.panelTitle}>Forma de pagamento</Text><View style={styles.methods}><Method active={paymentMethod === "card"} icon="card-outline" title="Cartão" onPress={() => { setPaymentMethod("card"); setPixConfirmed(false); }} /><Method active={paymentMethod === "paypal"} icon="logo-paypal" title="PayPal" onPress={() => { setPaymentMethod("paypal"); setPixConfirmed(false); }} /><Method active={paymentMethod === "pix"} icon="qr-code-outline" title="PIX" onPress={() => setPaymentMethod("pix")} /></View>{paymentMethod === "card" ? <CardFields name={cardName} number={cardNumber} expiry={cardExpiry} cvv={cardCvv} onName={setCardName} onNumber={(value) => setCardNumber(digitsOnly(value).slice(0, 16))} onExpiry={(value) => setCardExpiry(digitsOnly(value).slice(0, 4))} onCvv={(value) => setCardCvv(digitsOnly(value).slice(0, 3))} /> : null}{paymentMethod === "paypal" ? <View style={styles.fields}><Field label="Email do PayPal" value={paypalEmail} onChangeText={setPaypalEmail} keyboardType="email-address" autoCapitalize="none" /><Field label="Senha" value={paypalPassword} onChangeText={setPaypalPassword} secureTextEntry /></View> : null}{paymentMethod === "pix" ? <View style={styles.pixBox}><Ionicons name="qr-code-outline" size={50} color="#67e8f9" /><Text style={styles.pixTitle}>PIX da demonstração</Text><Text style={styles.pixText}>Use o QR Code no ambiente de demonstração e confirme a leitura para continuar.</Text><Text style={styles.pixCode}>00020126580014BR.GOV.BCB.PIX</Text><Pressable onPress={() => { setPixConfirmed((current) => !current); setError(""); }} style={styles.checkboxRow}><View style={[styles.checkbox, pixConfirmed && styles.checkboxActive]}>{pixConfirmed ? <Ionicons name="checkmark" size={15} color="#fff" /> : null}</View><Text style={styles.checkboxText}>Confirmo a leitura do QR Code</Text></Pressable></View> : null}<Pressable onPress={() => void createOrder()} disabled={placingOrder || hasStockIssues} style={[styles.primaryButton, (placingOrder || hasStockIssues) && styles.disabled]}><Text style={styles.primaryButtonText}>{placingOrder ? "Finalizando..." : hasStockIssues ? "Ajuste o carrinho para continuar" : "Finalizar pedido"}</Text></Pressable></View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Step({ active = false, title, text }: { active?: boolean; title: string; text: string }) { return <View style={[styles.step, active && styles.stepActive]}><Text style={styles.stepTitle}>{title}</Text><Text style={styles.stepText}>{text}</Text></View>; }
function Method({ active, icon, title, onPress }: { active: boolean; icon: React.ComponentProps<typeof Ionicons>["name"]; title: string; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.method, active && styles.methodActive]}><Ionicons name={icon} size={20} color={active ? "#93c5fd" : "#94a3b8"} /><Text style={[styles.methodText, active && styles.methodTextActive]}>{title}</Text></Pressable>; }
function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) { return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput {...props} placeholderTextColor="#64748b" style={styles.input} /></View>; }
function CardFields({ name, number, expiry, cvv, onName, onNumber, onExpiry, onCvv }: { name: string; number: string; expiry: string; cvv: string; onName: (value: string) => void; onNumber: (value: string) => void; onExpiry: (value: string) => void; onCvv: (value: string) => void }) { return <View style={styles.fields}><Field label="Nome no cartão" value={name} onChangeText={onName} autoCapitalize="words" /><Field label="Número do cartão" value={number} onChangeText={onNumber} keyboardType="number-pad" maxLength={16} /><View style={styles.inlineFields}><View style={styles.inlineField}><Field label="Validade (MM/AA)" value={expiry} onChangeText={onExpiry} keyboardType="number-pad" maxLength={4} /></View><View style={styles.inlineField}><Field label="CVV" value={cvv} onChangeText={onCvv} keyboardType="number-pad" maxLength={3} secureTextEntry /></View></View></View>; }
function LoadingState({ label }: { label: string }) { return <SafeAreaView style={styles.safeArea}><View style={styles.loading}><ActivityIndicator color="#67e8f9" /><Text style={styles.muted}>{label}</Text></View></SafeAreaView>; }
function StateScreen({ icon, title, text, actionLabel, onAction }: { icon: React.ComponentProps<typeof Ionicons>["name"]; title: string; text: string; actionLabel: string; onAction: () => void }) { return <SafeAreaView style={styles.safeArea}><View style={styles.state}><Ionicons name={icon} size={40} color="#67e8f9" /><Text style={styles.stateTitle}>{title}</Text><Text style={styles.stateText}>{text}</Text><Pressable onPress={onAction} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{actionLabel}</Text></Pressable></View></SafeAreaView>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" }, flex: { flex: 1 }, content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 36 },
  back: { alignSelf: "flex-start", minHeight: 42, flexDirection: "row", alignItems: "center", gap: 8 }, backText: { color: "#cbd5e1", fontSize: 14, fontWeight: "700" },
  title: { marginTop: 14, color: "#ffffff", fontSize: 30, fontWeight: "900", letterSpacing: -0.7 }, subtitle: { marginTop: 8, color: "#cbd5e1", fontSize: 14, lineHeight: 21 },
  steps: { marginTop: 20, gap: 8 }, step: { padding: 12, borderWidth: 1, borderColor: "#1e293b", borderRadius: 12, backgroundColor: "#020617" }, stepActive: { borderColor: "rgba(96,165,250,0.6)", backgroundColor: "rgba(37,99,235,0.12)" }, stepTitle: { color: "#e2e8f0", fontSize: 13, fontWeight: "800" }, stepText: { marginTop: 4, color: "#94a3b8", fontSize: 12 },
  panel: { marginTop: 16, padding: 16, borderWidth: 1, borderColor: "#334155", borderRadius: 18, backgroundColor: "#0f172a" }, panelTitle: { color: "#ffffff", fontSize: 19, fontWeight: "800" }, orderItem: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#1e293b", flexDirection: "row", justifyContent: "space-between", gap: 10 }, orderItemCopy: { flex: 1 }, orderItemTitle: { color: "#f8fafc", fontSize: 14, fontWeight: "700" }, orderItemMeta: { marginTop: 4, color: "#94a3b8", fontSize: 12 }, orderItemPrice: { color: "#ffffff", fontSize: 14, fontWeight: "800" }, totalLine: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#334155", flexDirection: "row", justifyContent: "space-between" }, totalLabel: { color: "#cbd5e1", fontSize: 14 }, totalValue: { color: "#ffffff", fontSize: 19, fontWeight: "900" },
  methods: { marginTop: 14, flexDirection: "row", gap: 8 }, method: { flex: 1, minHeight: 72, padding: 10, alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#020617" }, methodActive: { borderColor: "#60a5fa", backgroundColor: "rgba(37,99,235,0.16)" }, methodText: { color: "#94a3b8", fontSize: 12, fontWeight: "700" }, methodTextActive: { color: "#dbeafe" }, fields: { marginTop: 16, gap: 12 }, field: { gap: 6 }, fieldLabel: { color: "#cbd5e1", fontSize: 12, fontWeight: "700" }, input: { minHeight: 48, paddingHorizontal: 13, borderWidth: 1, borderColor: "#475569", borderRadius: 11, backgroundColor: "#020617", color: "#ffffff", fontSize: 14 }, inlineFields: { flexDirection: "row", gap: 10 }, inlineField: { flex: 1 }, pixBox: { marginTop: 16, padding: 18, alignItems: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 14, backgroundColor: "#020617" }, pixTitle: { marginTop: 10, color: "#ffffff", fontSize: 16, fontWeight: "800" }, pixText: { marginTop: 8, color: "#94a3b8", fontSize: 13, lineHeight: 19, textAlign: "center" }, pixCode: { marginTop: 12, color: "#67e8f9", fontSize: 11, textAlign: "center" }, checkboxRow: { marginTop: 18, flexDirection: "row", alignItems: "center", gap: 9 }, checkbox: { width: 22, height: 22, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#64748b", borderRadius: 6 }, checkboxActive: { borderColor: "#60a5fa", backgroundColor: "#2563eb" }, checkboxText: { color: "#cbd5e1", fontSize: 13 },
  primaryButton: { minHeight: 50, marginTop: 18, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#2563eb" }, primaryButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "800", textAlign: "center" }, disabled: { opacity: 0.55 }, error: { marginTop: 16, padding: 12, borderWidth: 1, borderColor: "rgba(244,63,94,0.4)", borderRadius: 12, backgroundColor: "rgba(244,63,94,0.1)" }, errorText: { color: "#ffe4e6", fontSize: 13, lineHeight: 19 }, loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }, muted: { color: "#94a3b8", fontSize: 14 }, state: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 }, stateTitle: { marginTop: 14, color: "#ffffff", fontSize: 22, fontWeight: "900", textAlign: "center" }, stateText: { maxWidth: 340, marginTop: 8, color: "#94a3b8", fontSize: 14, lineHeight: 21, textAlign: "center" }, successCard: { marginTop: 24, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "rgba(52,211,153,0.45)", borderRadius: 20, backgroundColor: "rgba(16,185,129,0.1)" }, successTitle: { marginTop: 12, color: "#ffffff", fontSize: 22, fontWeight: "900" }, successText: { marginTop: 8, color: "#a7f3d0", fontSize: 14, textAlign: "center" }, successAmount: { marginTop: 16, color: "#ffffff", fontSize: 18, fontWeight: "900" },
});
