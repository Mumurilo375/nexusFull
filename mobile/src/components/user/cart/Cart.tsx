import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../contexts/useAuth";
import api from "../../../services/api";
import { resolveAssetUrl } from "../../../services/assets";
import { getApiErrorMessage } from "../../../services/http";
import type { CartItem, CartResponse } from "./cart.types";

const toMoney = (value: number) => `R$ ${value.toFixed(2)}`;
const fallbackCover = require("../../../../assets/home/utils/logo.png");
const getQuantity = (item: CartItem) => Math.max(1, Number(item.quantity ?? 1));
const getAvailableStock = (item: CartItem) => Math.max(0, Number(item.stock?.available ?? 0));
const getItemTotal = (item: CartItem) => Number(item.listing?.price ?? 0) * getQuantity(item);

function getNextLowerQuantity(item: CartItem) {
  const quantity = getQuantity(item);
  const availableStock = getAvailableStock(item);
  return availableStock > 0 && availableStock < quantity ? availableStock : quantity - 1;
}

export default function Cart() {
  const { isAuthenticated, isReady } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [busyListingId, setBusyListingId] = useState<number | null>(null);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + getItemTotal(item), 0), [items]);
  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + getQuantity(item), 0), [items]);
  const hasStockIssues = useMemo(() => items.some((item) => item.isQuantityAvailable === false), [items]);

  const readCart = useCallback(async (showLoading = false) => {
    if (!isReady || !isAuthenticated) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
        setError("");
      }
      const data = await api.get<CartResponse>("/cart");
      setItems(data.items ?? []);
    } catch (requestError) {
      if (showLoading) {
        setItems([]);
        setError(getApiErrorMessage(requestError, "Não foi possível carregar o carrinho."));
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [isAuthenticated, isReady]);

  useEffect(() => {
    void readCart(true);
  }, [readCart]);

  const reloadWithError = async (requestError: unknown, fallback: string) => {
    setError(getApiErrorMessage(requestError, fallback));
    await readCart();
  };

  const updateQuantity = async (listingId: number, nextQuantity: number) => {
    if (nextQuantity < 1) return;
    try {
      setBusyListingId(listingId);
      setError("");
      await api.patch(`/cart/${listingId}`, { quantity: nextQuantity });
      await readCart();
    } catch (requestError) {
      await reloadWithError(requestError, "Não foi possível atualizar a quantidade do item.");
    } finally {
      setBusyListingId(null);
    }
  };

  const removeItem = async (listingId: number) => {
    try {
      setBusyListingId(listingId);
      setError("");
      await api.delete(`/cart/${listingId}`);
      setItems((current) => current.filter((item) => item.listingId !== listingId));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Não foi possível remover o item."));
    } finally {
      setBusyListingId(null);
    }
  };

  const clearCart = async () => {
    try {
      setBusyListingId(-1);
      setError("");
      await api.delete("/cart");
      setItems([]);
      setShowClearConfirmation(false);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Não foi possível limpar o carrinho."));
    } finally {
      setBusyListingId(null);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await readCart();
    setRefreshing(false);
  };

  if (!isReady) return <LoadingState label="Carregando sua sessão..." />;

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.accessState}>
          <Ionicons name="lock-closed-outline" size={34} color="#67e8f9" />
          <Text style={styles.stateTitle}>Entre para acessar o carrinho</Text>
          <Text style={styles.stateText}>Faça login para consultar seus itens e continuar a compra.</Text>
          <Pressable onPress={() => router.push({ pathname: "/login", params: { from: "/(tabs)/carrinho" } } as never)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Abrir tela de login</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor="#67e8f9" colors={["#2563eb"]} />}
      >
        <Text accessibilityRole="header" style={styles.title}>Carrinho</Text>
        <Text style={styles.subtitle}>Confira jogo, plataforma, quantidade e total antes de continuar.</Text>

        {loading ? <LoadingState label="Carregando carrinho..." compact /> : null}
        {!loading && error ? <Feedback tone="error" message={error} /> : null}

        {!loading && !error && items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="cart-outline" size={34} color="#67e8f9" />
            <Text style={styles.emptyTitle}>Seu carrinho está vazio.</Text>
            <Text style={styles.stateText}>Encontre um jogo na loja e escolha a plataforma que combina com você.</Text>
            <Pressable onPress={() => router.replace("/(tabs)/loja" as never)} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Ir para loja</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <>
            <View style={styles.itemsList}>
              {items.map((item) => {
                const quantity = getQuantity(item);
                const availableStock = getAvailableStock(item);
                const isBusy = busyListingId === item.listingId || busyListingId === -1;
                const title = item.listing?.game?.title ?? "Jogo";
                const platform = item.listing?.platform?.name ?? "Plataforma";

                return (
                  <View key={item.id} style={styles.itemCard}>
                    <Image source={item.listing?.game?.coverImageUrl ? { uri: resolveAssetUrl(item.listing.game.coverImageUrl) } : fallbackCover} style={styles.cover} resizeMode="cover" accessibilityLabel={title} />
                    <View style={styles.itemBody}>
                      <View style={styles.itemHeading}>
                        <View style={styles.itemHeadingCopy}>
                          <Text style={styles.itemTitle} numberOfLines={2}>{title}</Text>
                          <View style={styles.platformChip}><Ionicons name="game-controller-outline" size={14} color="#67e8f9" /><Text style={styles.platformText}>{platform}</Text></View>
                        </View>
                        <Text style={styles.itemPrice}>{toMoney(getItemTotal(item))}</Text>
                      </View>
                      <Text style={styles.unitPrice}>{toMoney(Number(item.listing?.price ?? 0))} por unidade.</Text>
                      <View style={styles.itemActions}>
                        <View style={styles.quantityControl}>
                          <Pressable accessibilityLabel="Diminuir quantidade" onPress={() => void updateQuantity(item.listingId, getNextLowerQuantity(item))} disabled={isBusy || quantity <= 1 || (item.isQuantityAvailable === false && availableStock === 0)} style={styles.quantityButton}><Ionicons name="remove" size={18} color="#e2e8f0" /></Pressable>
                          <Text style={styles.quantity}>{quantity}</Text>
                          <Pressable accessibilityLabel="Aumentar quantidade" onPress={() => void updateQuantity(item.listingId, quantity + 1)} disabled={isBusy || quantity >= availableStock} style={styles.quantityButton}><Ionicons name="add" size={18} color="#e2e8f0" /></Pressable>
                        </View>
                        <Text style={styles.stockText}>{availableStock === 1 ? "1 unidade disponível" : `${availableStock} unidades disponíveis`}</Text>
                      </View>
                      <Pressable onPress={() => void removeItem(item.listingId)} disabled={isBusy} style={styles.removeButton}><Ionicons name="trash-outline" size={16} color="#fecdd3" /><Text style={styles.removeText}>Remover</Text></Pressable>
                      {item.isQuantityAvailable === false ? <Feedback tone="warning" message={availableStock === 0 ? `Seu carrinho tem ${quantity} unidades desse jogo, mas ele ficou sem estoque agora. Remova o item para continuar.` : `Seu carrinho tem ${quantity} unidades desse jogo, mas só existem ${availableStock} disponíveis agora. Ajuste a quantidade para continuar.`} /> : null}
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Resumo</Text>
              <SummaryRow label="Jogos diferentes" value={String(items.length)} />
              <SummaryRow label="Unidades" value={String(totalQuantity)} />
              <View style={styles.summaryTotal}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>{toMoney(subtotal)}</Text></View>
              {hasStockIssues ? <Feedback tone="warning" message="O estoque de um ou mais itens mudou. Ajuste as quantidades antes de finalizar a compra." /> : null}
              <Pressable onPress={() => router.replace("/(tabs)/loja" as never)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Voltar para loja</Text></Pressable>
              <Pressable onPress={() => router.push("/checkout" as never)} disabled={hasStockIssues} style={[styles.primaryButton, hasStockIssues && styles.disabled]}><Text style={styles.primaryButtonText}>{hasStockIssues ? "Ajuste o carrinho para continuar" : "Finalizar compra"}</Text></Pressable>
              {!showClearConfirmation ? <Pressable onPress={() => setShowClearConfirmation(true)} disabled={busyListingId !== null} style={styles.clearButton}><Text style={styles.clearText}>Limpar carrinho</Text></Pressable> : <View style={styles.confirmBox}><Text style={styles.confirmText}>Remover todos os itens do carrinho?</Text><View style={styles.confirmActions}><Pressable onPress={() => setShowClearConfirmation(false)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancelar</Text></Pressable><Pressable onPress={() => void clearCart()} disabled={busyListingId !== null} style={styles.dangerButton}><Text style={styles.primaryButtonText}>{busyListingId === -1 ? "Limpando..." : "Sim, limpar"}</Text></Pressable></View></View>}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.summaryRow}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryLabel}>{value}</Text></View>;
}

function LoadingState({ label, compact = false }: { label: string; compact?: boolean }) {
  return <View style={[styles.loading, compact && styles.loadingCompact]}><ActivityIndicator color="#67e8f9" /><Text style={styles.stateText}>{label}</Text></View>;
}

function Feedback({ tone, message }: { tone: "error" | "warning"; message: string }) {
  return <View style={[styles.feedback, tone === "warning" ? styles.warning : styles.error]}><Text style={styles.feedbackText}>{message}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 36 },
  title: { color: "#ffffff", fontSize: 31, fontWeight: "900", letterSpacing: -0.8 },
  subtitle: { marginTop: 8, color: "#cbd5e1", fontSize: 14, lineHeight: 21 },
  loading: { minHeight: 220, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingCompact: { minHeight: 160 },
  stateTitle: { marginTop: 14, color: "#ffffff", fontSize: 22, fontWeight: "900", textAlign: "center" },
  stateText: { maxWidth: 340, marginTop: 8, color: "#94a3b8", fontSize: 14, lineHeight: 21, textAlign: "center" },
  accessState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 },
  emptyCard: { marginTop: 24, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 20, backgroundColor: "#0f172a" },
  emptyTitle: { marginTop: 12, color: "#ffffff", fontSize: 20, fontWeight: "800" },
  itemsList: { marginTop: 22, gap: 14 },
  itemCard: { overflow: "hidden", borderWidth: 1, borderColor: "#334155", borderRadius: 18, backgroundColor: "#0f172a" },
  cover: { width: "100%", height: 128, backgroundColor: "#020617" },
  itemBody: { padding: 16 },
  itemHeading: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  itemHeadingCopy: { flex: 1 },
  itemTitle: { color: "#ffffff", fontSize: 18, fontWeight: "800" },
  platformChip: { alignSelf: "flex-start", marginTop: 8, paddingHorizontal: 9, paddingVertical: 6, borderWidth: 1, borderColor: "#334155", borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 5 },
  platformText: { color: "#cbd5e1", fontSize: 12, fontWeight: "700" },
  itemPrice: { color: "#ffffff", fontSize: 18, fontWeight: "900" },
  unitPrice: { marginTop: 10, color: "#94a3b8", fontSize: 13 },
  itemActions: { marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  quantityControl: { height: 42, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#475569", borderRadius: 12, backgroundColor: "#020617" },
  quantityButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  quantity: { minWidth: 42, color: "#ffffff", fontSize: 15, fontWeight: "800", textAlign: "center" },
  stockText: { flex: 1, color: "#94a3b8", fontSize: 12, textAlign: "right" },
  removeButton: { alignSelf: "flex-end", marginTop: 12, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: 6 },
  removeText: { color: "#fecdd3", fontSize: 13, fontWeight: "700" },
  summaryCard: { marginTop: 18, padding: 18, borderWidth: 1, borderColor: "#334155", borderRadius: 18, backgroundColor: "#0f172a" },
  summaryTitle: { color: "#ffffff", fontSize: 20, fontWeight: "800" },
  summaryRow: { marginTop: 14, flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { color: "#cbd5e1", fontSize: 14 },
  summaryTotal: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#334155", flexDirection: "row", justifyContent: "space-between" },
  summaryValue: { color: "#ffffff", fontSize: 19, fontWeight: "900" },
  primaryButton: { minHeight: 50, marginTop: 14, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#2563eb", paddingHorizontal: 16 },
  primaryButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "800", textAlign: "center" },
  secondaryButton: { minHeight: 48, marginTop: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#475569", borderRadius: 13, backgroundColor: "#020617", paddingHorizontal: 14 },
  secondaryButtonText: { color: "#e2e8f0", fontSize: 14, fontWeight: "800", textAlign: "center" },
  clearButton: { minHeight: 46, marginTop: 8, alignItems: "center", justifyContent: "center" },
  clearText: { color: "#fecdd3", fontSize: 13, fontWeight: "700" },
  dangerButton: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#e11d48", paddingHorizontal: 12 },
  confirmBox: { marginTop: 12, padding: 14, borderWidth: 1, borderColor: "rgba(244,63,94,0.35)", borderRadius: 14, backgroundColor: "rgba(244,63,94,0.1)" },
  confirmText: { color: "#ffe4e6", fontSize: 13, lineHeight: 19 },
  confirmActions: { flexDirection: "row", gap: 8 },
  feedback: { marginTop: 14, padding: 12, borderWidth: 1, borderRadius: 12 },
  feedbackText: { color: "#ffe4e6", fontSize: 13, lineHeight: 19 },
  error: { borderColor: "rgba(244,63,94,0.4)", backgroundColor: "rgba(244,63,94,0.1)" },
  warning: { borderColor: "rgba(245,158,11,0.4)", backgroundColor: "rgba(245,158,11,0.1)" },
  disabled: { opacity: 0.55 },
});
