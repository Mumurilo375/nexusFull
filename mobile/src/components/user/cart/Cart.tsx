import Pressable from "@/src/components/ui/MotionPressable";
import MotionView from "@/src/components/ui/MotionView";
import { Text } from "@/src/components/ui/Typography";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator, Image, RefreshControl, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../contexts/useAuth";
import { notifyCartChanged, subscribeToCartChanges } from "../../../contexts/cartEvents";
import api from "../../../services/api";
import { resolveAssetUrl } from "../../../services/assets";
import { getApiErrorMessage } from "../../../services/http";
import PlatformLogo from "../../loja/PlatformLogo";
import type { CartItem, CartResponse } from "./cart.types";

const toMoney = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;
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
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [busyListingId, setBusyListingId] = useState<number | null>(null);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [removeConfirmation, setRemoveConfirmation] = useState<{ listingId: number; title: string } | null>(null);
  const latestRequestId = useRef(0);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + getItemTotal(item), 0), [items]);
  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + getQuantity(item), 0), [items]);
  const hasStockIssues = useMemo(() => items.some((item) => item.isQuantityAvailable === false), [items]);

  const readCart = useCallback(async (showLoading = false) => {
    const requestId = ++latestRequestId.current;

    if (!isReady || !isAuthenticated) {
      if (requestId === latestRequestId.current) {
        setItems([]);
        setLoading(false);
      }
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
        setError("");
      }
      const data = await api.get<CartResponse>("/cart");
      if (requestId === latestRequestId.current) setItems(data.items ?? []);
    } catch (requestError) {
      if (showLoading && requestId === latestRequestId.current) {
        setItems([]);
        setError(getApiErrorMessage(requestError, "Não foi possível carregar o carrinho."));
      }
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  }, [isAuthenticated, isReady]);

  useEffect(() => {
    void Promise.resolve().then(() => readCart(true));
  }, [readCart]);

  useEffect(() => subscribeToCartChanges(() => void readCart()), [readCart]);

  useFocusEffect(useCallback(() => {
    void readCart();
  }, [readCart]));

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
      notifyCartChanged();
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
      setRemoveConfirmation(null);
      notifyCartChanged();
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
      notifyCartChanged();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Não foi possível limpar o carrinho."));
    } finally {
      setBusyListingId(null);
    }
  };

  const requestRemoveItem = (listingId: number, title: string) => {
    setRemoveConfirmation({ listingId, title });
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

        {loading ? <CartLoadingState /> : null}
        {!loading && error ? <Feedback tone="error" message={error} onRetry={() => void readCart(true)} /> : null}

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
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryHeadingCopy}>
                  <Text style={styles.summaryTitle}>Resumo do pedido</Text>
                  <Text style={styles.summaryMeta}>{totalQuantity === 1 ? "1 unidade no carrinho" : `${totalQuantity} unidades no carrinho`}</Text>
                </View>
              </View>
              <View style={styles.summaryStats}>
                <SummaryRow label="Jogos diferentes: " value={String(items.length)} />
                <SummaryRow label="Unidades: " value={String(totalQuantity)} />
              </View>
              <View style={styles.summaryTotal}><Text style={styles.summaryLabel}>Total</Text><MotionView animateOnMount={false} motionKey={subtotal} variant="fade" accessibilityLiveRegion="polite"><Text style={styles.summaryValue}>{toMoney(subtotal)}</Text></MotionView></View>
              {hasStockIssues ? <Feedback compact tone="warning" message="O estoque de um ou mais itens mudou. Ajuste as quantidades antes de finalizar a compra." /> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={hasStockIssues ? "Ajustar itens do carrinho para continuar" : "Finalizar compra"}
                accessibilityState={{ disabled: hasStockIssues }}
                onPress={() => router.push("/checkout" as never)}
                disabled={hasStockIssues}
                style={({ pressed }) => [styles.summaryPrimaryButton, pressed && styles.buttonPressed, hasStockIssues && styles.disabled]}
              >
                <Ionicons name={hasStockIssues ? "alert-circle-outline" : "arrow-forward-circle-outline"} size={20} color="#ffffff" />
                <Text style={styles.primaryButtonText}>{hasStockIssues ? "Ajuste os itens para continuar" : "Finalizar compra"}</Text>
              </Pressable>
              <View style={styles.summaryActions}>
                <Pressable onPress={() => router.replace("/(tabs)/loja" as never)} style={styles.continueButton}>
                  <Ionicons name="add-circle-outline" size={18} color="#93c5fd" />
                  <Text style={styles.continueText}>Continuar comprando</Text>
                </Pressable>
                {!showClearConfirmation ? <Pressable accessibilityRole="button" accessibilityLabel="Limpar carrinho" onPress={() => setShowClearConfirmation(true)} disabled={busyListingId !== null} style={styles.clearButton}><Ionicons name="trash-outline" size={16} color="#fda4af" /><Text style={styles.clearText}>Limpar</Text></Pressable> : null}
              </View>
              {showClearConfirmation ? <View style={styles.confirmBox}><Text style={styles.confirmText}>Remover todos os itens do carrinho?</Text><View style={styles.confirmActions}><Pressable accessibilityRole="button" accessibilityLabel="Cancelar limpeza do carrinho" onPress={() => setShowClearConfirmation(false)} disabled={busyListingId !== null} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancelar</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Confirmar limpeza do carrinho" onPress={() => void clearCart()} disabled={busyListingId !== null} style={styles.dangerButton}><Text style={styles.primaryButtonText}>{busyListingId === -1 ? "Limpando..." : "Limpar carrinho"}</Text></Pressable></View></View> : null}
            </View>

            <View style={styles.itemsHeader}>
              <View>
                <Text style={styles.itemsTitle}>Itens do pedido</Text>
                <Text style={styles.itemsSubtitle}>Confira plataforma, quantidade e disponibilidade.</Text>
              </View>
              <View style={styles.itemsCount}><Text style={styles.itemsCountText}>{items.length}</Text></View>
            </View>

            <View style={styles.itemsList}>
              {items.map((item) => {
                const quantity = getQuantity(item);
                const availableStock = getAvailableStock(item);
                const isBusy = busyListingId === item.listingId || busyListingId === -1;
                const title = item.listing?.game?.title ?? "Jogo";
                const platform = item.listing?.platform?.name ?? "Plataforma";

                return (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={styles.itemMain}>
                      <Image source={item.listing?.game?.coverImageUrl ? { uri: resolveAssetUrl(item.listing.game.coverImageUrl) } : fallbackCover} style={styles.cover} resizeMode="cover" accessibilityLabel={title} />
                      <View style={styles.itemBody}>
                        <View style={styles.itemHeading}>
                          <View style={styles.itemHeadingCopy}>
                            <Text style={styles.itemTitle} numberOfLines={2}>{title}</Text>
                            <View style={styles.platformChip}><PlatformLogo platformName={platform} iconUrl={item.listing?.platform?.iconUrl} size={28} /><Text style={styles.platformText}>{platform}</Text></View>
                          </View>
                          <Text style={styles.itemPrice}>{toMoney(getItemTotal(item))}</Text>
                        </View>
                        <Text style={styles.unitPrice}>{toMoney(Number(item.listing?.price ?? 0))} por unidade.</Text>
                        <View style={styles.itemActions}>
                          <View style={styles.quantityBlock}>
                            <Text style={styles.quantityLabel}>Quantidade</Text>
                            <View style={styles.quantityControl}>
                              <Pressable accessibilityLabel={`Diminuir quantidade de ${title}. Quantidade atual: ${quantity}`} onPress={() => void updateQuantity(item.listingId, getNextLowerQuantity(item))} disabled={isBusy || quantity <= 1 || (item.isQuantityAvailable === false && availableStock === 0)} style={styles.quantityButton}><Ionicons name="remove" size={18} color="#e2e8f0" /></Pressable>
                              <MotionView animateOnMount={false} motionKey={quantity} variant="settle" accessibilityLiveRegion="polite"><Text style={styles.quantity}>{quantity}</Text></MotionView>
                              <Pressable accessibilityLabel={`Aumentar quantidade de ${title}. Quantidade atual: ${quantity}`} onPress={() => void updateQuantity(item.listingId, quantity + 1)} disabled={isBusy || quantity >= availableStock} style={styles.quantityButton}><Ionicons name="add" size={18} color="#e2e8f0" /></Pressable>
                            </View>
                          </View>
                          <Text style={styles.stockText}>{availableStock === 1 ? "1 disponível" : `${availableStock} disponíveis`}</Text>
                        </View>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Remover ${title} do carrinho`}
                          onPress={() => requestRemoveItem(item.listingId, title)}
                          disabled={isBusy}
                          style={styles.removeButton}
                        >
                          <Ionicons name="trash-outline" size={16} color="#fecdd3" />
                          <Text style={styles.removeText}>Remover item</Text>
                        </Pressable>
                        {removeConfirmation?.listingId === item.listingId ? (
                          <View style={styles.confirmBox}>
                            <Text style={styles.confirmText}>Remover “{removeConfirmation.title}” do carrinho?</Text>
                            <View style={styles.confirmActions}>
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Cancelar remoção do item"
                                onPress={() => setRemoveConfirmation(null)}
                                disabled={isBusy}
                                style={styles.secondaryButton}
                              >
                                <Text style={styles.secondaryButtonText}>Cancelar</Text>
                              </Pressable>
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Confirmar remoção de ${title}`}
                                onPress={() => void removeItem(item.listingId)}
                                disabled={isBusy}
                                style={styles.dangerButton}
                              >
                                <Text style={styles.primaryButtonText}>{isBusy ? "Removendo..." : "Remover item"}</Text>
                              </Pressable>
                            </View>
                          </View>
                        ) : null}
                      </View>
                    </View>
                    {item.isQuantityAvailable === false ? <View style={styles.itemFeedback}><Feedback compact tone="warning" message={availableStock === 0 ? `Seu carrinho tem ${quantity} unidades desse jogo, mas ele ficou sem estoque agora. Remova o item para continuar.` : `Seu carrinho tem ${quantity} unidades desse jogo, mas só existem ${availableStock} disponíveis agora. Ajuste a quantidade para continuar.`} /></View> : null}
                  </View>
                );
              })}
            </View>
          </>
        ) : null}
      </ScrollView>
      {!loading && !error && items.length > 0 ? (
        <View style={[styles.checkoutDock, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.checkoutDockCopy}>
            <Text style={styles.checkoutDockLabel}>Total do pedido</Text>
            <MotionView animateOnMount={false} motionKey={subtotal} variant="fade"><Text style={styles.checkoutDockValue}>{toMoney(subtotal)}</Text></MotionView>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hasStockIssues ? "Ajustar carrinho para continuar" : "Finalizar compra"}
            accessibilityState={{ disabled: hasStockIssues }}
            onPress={() => router.push("/checkout" as never)}
            disabled={hasStockIssues}
            style={({ pressed }) => [styles.checkoutButton, pressed && styles.buttonPressed, hasStockIssues && styles.disabled]}
          >
            <Ionicons name={hasStockIssues ? "alert-circle-outline" : "arrow-forward"} size={18} color="#ffffff" />
            <Text style={styles.checkoutButtonText}>{hasStockIssues ? "Ajustar itens" : "Finalizar compra"}</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.summaryRow}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryLabel}>{value}</Text></View>;
}

function LoadingState({ label }: { label: string }) {
  return <View style={styles.loading}><ActivityIndicator color="#67e8f9" /><Text style={styles.stateText}>{label}</Text></View>;
}

function CartLoadingState() {
  return <View style={styles.loadingLayout} accessibilityLabel="Carregando carrinho">
    <View style={styles.skeletonSummary}><View style={styles.skeletonLineShort} /><View style={styles.skeletonLine} /><View style={styles.skeletonBlock} /><View style={styles.skeletonButton} /></View>
    <View style={styles.skeletonItem}><View style={styles.skeletonCover} /><View style={styles.skeletonItemCopy}><View style={styles.skeletonLine} /><View style={styles.skeletonLineShort} /><View style={styles.skeletonControl} /></View></View>
    <View style={styles.skeletonItem}><View style={styles.skeletonCover} /><View style={styles.skeletonItemCopy}><View style={styles.skeletonLine} /><View style={styles.skeletonLineShort} /><View style={styles.skeletonControl} /></View></View>
  </View>;
}

function Feedback({ tone, message, onRetry, compact = false }: { tone: "error" | "warning"; message: string; onRetry?: () => void; compact?: boolean }) {
  return <MotionView motionKey={message} accessibilityLiveRegion="polite" style={[styles.feedback, compact && styles.feedbackCompact, tone === "warning" ? styles.warning : styles.error]}><Text style={styles.feedbackText}>{message}</Text>{onRetry ? <Pressable accessibilityRole="button" onPress={onRetry} style={styles.feedbackRetry}><Text style={styles.feedbackRetryText}>Tentar novamente</Text></Pressable> : null}</MotionView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" },
  content: { width: "100%", maxWidth: 960, alignSelf: "center", paddingHorizontal: 20, paddingTop: 22, paddingBottom: 158 },
  title: { color: "#ffffff", fontSize: 31, fontWeight: "900", letterSpacing: -0.8 },
  loading: { minHeight: 220, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingLayout: { marginTop: 22, gap: 12 },
  skeletonSummary: { padding: 18, borderWidth: 1, borderColor: "#1e293b", borderRadius: 18, backgroundColor: "#0f172a", gap: 11 },
  skeletonLine: { width: "58%", height: 13, borderRadius: 7, backgroundColor: "#1e293b" },
  skeletonLineShort: { width: "32%", height: 11, borderRadius: 6, backgroundColor: "#1e293b" },
  skeletonBlock: { width: "100%", height: 54, borderRadius: 12, backgroundColor: "#1e293b" },
  skeletonButton: { width: "100%", height: 50, borderRadius: 13, backgroundColor: "#1d4ed8" },
  skeletonItem: { minHeight: 110, flexDirection: "row", gap: 12, padding: 10, borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#0f172a" },
  skeletonCover: { width: 124, height: 75, borderRadius: 10, backgroundColor: "#1e293b" },
  skeletonItemCopy: { flex: 1, justifyContent: "space-between", paddingVertical: 4 },
  skeletonControl: { width: 112, height: 44, borderRadius: 11, backgroundColor: "#1e293b" },
  stateTitle: { marginTop: 14, color: "#ffffff", fontSize: 22, fontWeight: "900", textAlign: "center" },
  stateText: { maxWidth: 340, marginTop: 8, color: "#94a3b8", fontSize: 14, lineHeight: 21, textAlign: "center" },
  accessState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 },
  emptyCard: { marginTop: 24, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 20, backgroundColor: "#0f172a" },
  emptyTitle: { marginTop: 12, color: "#ffffff", fontSize: 20, fontWeight: "800" },
  summaryCard: { marginTop: 18, padding: 15, borderWidth: 1, borderColor: "#1e40af", borderRadius: 16, backgroundColor: "#0b1730" },
  summaryHeader: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 12 },
  summaryHeadingCopy: { flex: 1, minWidth: 0 },
  summaryTitle: { color: "#ffffff", fontSize: 18, fontWeight: "900", letterSpacing: -0.2 },
  summaryMeta: { marginTop: 2, color: "#93c5fd", fontSize: 11, fontWeight: "700" },
  summaryStats: { marginTop: 12, flexDirection: "row", gap: 18 },
  summaryTotal: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(147,197,253,0.25)", flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  summaryValue: { color: "#ffffff", fontSize: 22, fontWeight: "900", letterSpacing: -0.3 },
  summaryPrimaryButton: { minHeight: 48, marginTop: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, backgroundColor: "#2563eb", paddingHorizontal: 14 },
  summaryActions: { marginTop: 2, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  continueButton: { minHeight: 40, flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingHorizontal: 6 },
  continueText: { color: "#bfdbfe", fontSize: 13, fontWeight: "800" },
  itemsHeader: { marginTop: 27, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  itemsTitle: { color: "#ffffff", fontSize: 20, fontWeight: "900" },
  itemsSubtitle: { marginTop: 4, color: "#94a3b8", fontSize: 12, lineHeight: 18 },
  itemsCount: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 17, backgroundColor: "#0f172a" },
  itemsCountText: { color: "#e2e8f0", fontSize: 13, fontWeight: "900" },
  itemsList: { marginTop: 12, gap: 12 },
  itemCard: { overflow: "hidden", borderWidth: 1, borderColor: "#334155", borderRadius: 16, backgroundColor: "#0f172a" },
  itemMain: { flexDirection: "row", minWidth: 0 },
  cover: { width: 124, alignSelf: "stretch", backgroundColor: "#020617" },
  itemBody: { minWidth: 0, flex: 1, padding: 10 },
  itemHeading: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  itemHeadingCopy: { flex: 1 },
  itemTitle: { color: "#ffffff", fontSize: 15, lineHeight: 18, fontWeight: "800" },
  platformChip: { alignSelf: "flex-start", minHeight: 30, marginTop: 5, paddingRight: 8, borderWidth: 1, borderColor: "#334155", borderRadius: 11, flexDirection: "row", alignItems: "center", gap: 6 },
  platformText: { color: "#cbd5e1", fontSize: 12, fontWeight: "700" },
  itemPrice: { color: "#bfdbfe", fontSize: 16, fontWeight: "900", textAlign: "right" },
  unitPrice: { marginTop: 3, color: "#94a3b8", fontSize: 11 },
  itemActions: { marginTop: 8, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 8 },
  quantityBlock: { gap: 5 },
  quantityLabel: { color: "#94a3b8", fontSize: 10, fontWeight: "700" },
  quantityControl: { height: 44, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#475569", borderRadius: 11, backgroundColor: "#020617" },
  quantityButton: { width: 46, height: 44, alignItems: "center", justifyContent: "center" },
  quantity: { minWidth: 38, color: "#ffffff", fontSize: 14, fontWeight: "800", textAlign: "center" },
  stockText: { flex: 1, color: "#94a3b8", fontSize: 10, lineHeight: 14, textAlign: "right" },
  removeButton: { alignSelf: "flex-start", minHeight: 40, marginTop: 1, paddingHorizontal: 4, flexDirection: "row", alignItems: "center", gap: 6 },
  removeText: { color: "#fecdd3", fontSize: 13, fontWeight: "700" },
  itemFeedback: { paddingHorizontal: 14, paddingBottom: 14 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { color: "#cbd5e1", fontSize: 14 },
  primaryButton: { minHeight: 50, marginTop: 14, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#2563eb", paddingHorizontal: 16 },
  primaryButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "800", textAlign: "center" },
  checkoutDock: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 11, flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: 1, borderTopColor: "#1e293b", backgroundColor: "#020617" },
  checkoutDockCopy: { minWidth: 0, flex: 1 },
  checkoutDockLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "700" },
  checkoutDockValue: { marginTop: 2, color: "#ffffff", fontSize: 18, fontWeight: "900" },
  checkoutButton: { minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 13, backgroundColor: "#2563eb", paddingHorizontal: 15 },
  checkoutButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "900" },
  buttonPressed: { opacity: 0.72 },
  secondaryButton: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#475569", borderRadius: 13, backgroundColor: "#020617", paddingHorizontal: 14 },
  secondaryButtonText: { color: "#e2e8f0", fontSize: 14, fontWeight: "800", textAlign: "center" },
  clearButton: { minHeight: 40, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 8 },
  clearText: { color: "#fecdd3", fontSize: 13, fontWeight: "700" },
  dangerButton: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#e11d48", paddingHorizontal: 12 },
  confirmBox: { marginTop: 12, padding: 14, borderWidth: 1, borderColor: "rgba(244,63,94,0.35)", borderRadius: 14, backgroundColor: "rgba(244,63,94,0.1)" },
  confirmText: { color: "#ffe4e6", fontSize: 13, lineHeight: 19 },
  confirmActions: { marginTop: 12, flexDirection: "row", gap: 8 },
  feedback: { marginTop: 14, padding: 12, borderWidth: 1, borderRadius: 12 },
  feedbackCompact: { marginTop: 12 },
  feedbackText: { color: "#ffe4e6", fontSize: 13, lineHeight: 19 },
  feedbackRetry: { alignSelf: "flex-start", minHeight: 40, marginTop: 8, justifyContent: "center", paddingHorizontal: 10 },
  feedbackRetryText: { color: "#ffffff", fontSize: 13, fontWeight: "800", textDecorationLine: "underline" },
  error: { borderColor: "rgba(244,63,94,0.4)", backgroundColor: "rgba(244,63,94,0.1)" },
  warning: { borderColor: "rgba(245,158,11,0.4)", backgroundColor: "rgba(245,158,11,0.1)" },
  disabled: { opacity: 0.55 },
});
