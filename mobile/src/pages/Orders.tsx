import Ionicons from "@expo/vector-icons/Ionicons";
import { router, usePathname } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/useAuth";
import api from "../services/api";
import { resolveAssetUrl } from "../services/assets";
import { getApiErrorMessage } from "../services/http";
import { formatDate, toMoney, translateOrderStatus } from "../components/user/account.utils";
import type { PaginatedResponse, UserOrder } from "../components/user/account.types";
import PlatformLogo from "../components/loja/PlatformLogo";

export default function Orders() {
  const { isAuthenticated, isReady } = useAuth();
  const isHistory = usePathname() === "/historico";
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!isReady || !isAuthenticated) { setLoading(false); return; }
    try {
      setLoading(true); setError("");
      const data = await api.get<PaginatedResponse<UserOrder>>(isHistory ? "/history/purchases?page=1&limit=30" : "/orders?page=1&limit=30");
      setOrders(data.items ?? []);
    } catch (requestError) {
      setOrders([]); setError(getApiErrorMessage(requestError, "Não foi possível carregar seus pedidos."));
    } finally { setLoading(false); }
  }, [isAuthenticated, isHistory, isReady]);

  useEffect(() => { void load(); }, [load]);
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (!isReady || loading) return <LoadingState />;
  if (!isAuthenticated) return <AccessState />;
  return <SafeAreaView style={styles.safeArea} edges={["top"]}><StatusBar barStyle="light-content" /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor="#67e8f9" colors={["#2563eb"]} />}>
    <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={18} color="#cbd5e1" /><Text style={styles.backText}>Voltar</Text></Pressable>
    <Text accessibilityRole="header" style={styles.title}>{isHistory ? "Histórico de compras" : "Meus pedidos"}</Text><Text style={styles.subtitle}>{isHistory ? "Revise o histórico das suas compras e os itens entregues." : "Acompanhe seus pedidos e abra cada um para consultar os itens e as keys liberadas."}</Text>
    {error ? <View style={styles.feedback}><Text style={styles.feedbackText}>{error}</Text><Pressable onPress={() => void load()}><Text style={styles.retryText}>Tentar novamente</Text></Pressable></View> : null}
    {!error && orders.length === 0 ? <View style={styles.empty}><Ionicons name="receipt-outline" size={34} color="#67e8f9" /><Text style={styles.emptyTitle}>{isHistory ? "Seu histórico está vazio." : "Nenhum pedido ainda"}</Text><Text style={styles.emptyText}>{isHistory ? "Suas compras aparecerão aqui." : "Seus pedidos aparecerão aqui."}</Text><Pressable onPress={() => router.replace("/(tabs)/loja" as never)} style={styles.primaryButton}><Text style={styles.primaryText}>Explorar a loja</Text></Pressable></View> : null}
    {!error && orders.length > 0 ? <View style={styles.list}>{orders.map((order) => { const firstItem = order.items?.[0]; return <Pressable key={order.id} onPress={() => router.push({ pathname: "/pedidos/[id]", params: { id: String(order.id) } } as never)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.cardHeader}><View><Text style={styles.orderNumber}>Pedido {order.orderNumber ?? `#${order.id}`}</Text><Text style={styles.meta}>{formatDate(order.createdAt)} · {order.items?.length ?? 0} item(ns)</Text></View><View style={styles.status}><Text style={styles.statusText}>{translateOrderStatus(order.status)}</Text></View></View>
      <View style={styles.itemPreview}>{firstItem?.listing?.game?.coverImageUrl ? <Image source={{ uri: resolveAssetUrl(firstItem.listing.game.coverImageUrl) }} style={styles.cover} resizeMode="cover" /> : <View style={styles.coverFallback}><Ionicons name="game-controller-outline" size={22} color="#67e8f9" /></View>}<View style={styles.itemCopy}><Text style={styles.itemTitle} numberOfLines={2}>{firstItem?.listing?.game?.title ?? "Itens do pedido"}</Text><View style={styles.platformRow}><PlatformLogo platformName={firstItem?.listing?.platform?.name} iconUrl={firstItem?.listing?.platform?.iconUrl} size={28} /><Text style={styles.meta}>{firstItem?.listing?.platform?.name ?? "Plataforma"}{(order.items?.length ?? 0) > 1 ? ` + ${(order.items?.length ?? 0) - 1}` : ""}</Text></View></View><Text style={styles.total}>{toMoney(order.totalAmount)}</Text></View>
      <View style={styles.openRow}><Text style={styles.openText}>Ver pedido e keys</Text><Ionicons name="chevron-forward" size={18} color="#93c5fd" /></View>
    </Pressable>; })}</View> : null}
  </ScrollView></SafeAreaView>;
}

function LoadingState() { return <SafeAreaView style={styles.safeArea}><View style={styles.center}><ActivityIndicator color="#67e8f9" /><Text style={styles.meta}>Carregando seus pedidos...</Text></View></SafeAreaView>; }
function AccessState() { return <SafeAreaView style={styles.safeArea}><View style={styles.center}><Ionicons name="lock-closed-outline" size={38} color="#67e8f9" /><Text style={styles.emptyTitle}>Entre para acessar seus pedidos</Text><Text style={styles.emptyText}>Faça login para consultar suas compras.</Text><Pressable onPress={() => router.replace("/login")} style={styles.primaryButton}><Text style={styles.primaryText}>Abrir tela de login</Text></Pressable></View></SafeAreaView>; }

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: "#020617" }, content: { width: "100%", maxWidth: 780, alignSelf: "center", padding: 20, paddingBottom: 40 }, back: { minHeight: 48, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8 }, backText: { color: "#cbd5e1", fontSize: 14, fontWeight: "700" }, title: { marginTop: 14, color: "#fff", fontSize: 30, fontWeight: "900" }, subtitle: { marginTop: 8, color: "#cbd5e1", fontSize: 14, lineHeight: 21 }, list: { gap: 12, marginTop: 22 }, card: { padding: 16, borderWidth: 1, borderColor: "#334155", borderRadius: 16, backgroundColor: "#0f172a" }, cardHeader: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }, orderNumber: { color: "#fff", fontSize: 16, fontWeight: "800" }, meta: { marginTop: 4, color: "#94a3b8", fontSize: 12, lineHeight: 18 }, status: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(16,185,129,0.14)", borderWidth: 1, borderColor: "rgba(16,185,129,0.35)" }, statusText: { color: "#a7f3d0", fontSize: 11, fontWeight: "800" }, itemPreview: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 }, cover: { width: 76, height: 58, borderRadius: 10, backgroundColor: "#020617" }, coverFallback: { width: 76, height: 58, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#020617" }, itemCopy: { flex: 1, minWidth: 180 }, itemTitle: { color: "#f8fafc", fontSize: 14, fontWeight: "800" }, platformRow: { marginTop: 7, flexDirection: "row", alignItems: "center", gap: 7 }, total: { color: "#bfdbfe", fontSize: 15, fontWeight: "900" }, openRow: { minHeight: 48, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#1e293b", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, openText: { color: "#93c5fd", fontSize: 13, fontWeight: "800" }, empty: { marginTop: 22, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 16, backgroundColor: "#0f172a" }, emptyTitle: { marginTop: 10, color: "#fff", fontSize: 20, fontWeight: "900", textAlign: "center" }, emptyText: { marginTop: 8, color: "#94a3b8", fontSize: 14, lineHeight: 21, textAlign: "center" }, primaryButton: { minHeight: 48, marginTop: 18, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#2563eb" }, primaryText: { color: "#fff", fontSize: 14, fontWeight: "800" }, feedback: { marginTop: 18, padding: 14, borderWidth: 1, borderColor: "rgba(244,63,94,0.4)", borderRadius: 12, backgroundColor: "rgba(244,63,94,0.1)" }, feedbackText: { color: "#fecdd3", fontSize: 14, lineHeight: 20 }, retryText: { marginTop: 8, color: "#fda4af", fontSize: 13, fontWeight: "800" }, center: { flex: 1, minHeight: 260, alignItems: "center", justifyContent: "center", padding: 28, gap: 10 }, pressed: { opacity: 0.75 } });
