import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/useAuth";
import api from "../services/api";
import { resolveAssetUrl } from "../services/assets";
import { getApiErrorMessage } from "../services/http";
import { formatDate, maskKey, toMoney } from "../components/user/account.utils";
import type { PaginatedResponse, UserLibraryItem } from "../components/user/account.types";
import PlatformLogo from "../components/loja/PlatformLogo";

const PAGE_SIZE = 6;

export default function Library() {
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const { isAuthenticated, isReady } = useAuth();
  const [items, setItems] = useState<UserLibraryItem[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [visibleKeys, setVisibleKeys] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!isReady || !isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await api.get<PaginatedResponse<UserLibraryItem>>(`/library/keys?page=${page}&limit=${PAGE_SIZE}`);
      setItems(data.items ?? []);
      setMeta(data.meta ?? { page, limit: PAGE_SIZE, total: data.items?.length ?? 0, totalPages: 1 });
    } catch (requestError) {
      setItems([]);
      setError(getApiErrorMessage(requestError, "Não foi possível carregar sua biblioteca."));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isReady, page]);

  useEffect(() => { void load(); }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!isReady || loading) return <LoadingState label="Carregando sua biblioteca..." />;
  if (!isAuthenticated) return <AccessState title="Entre para acessar sua biblioteca" text="Suas keys ficam disponíveis depois que você entrar na conta." />;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor="#67e8f9" colors={["#2563eb"]} />}>
        <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={18} color="#cbd5e1" /><Text style={styles.backText}>Voltar</Text></Pressable>
        <Text accessibilityRole="header" style={styles.title}>Biblioteca e keys</Text>
        <Text style={styles.subtitle}>Consulte as keys liberadas nos seus pedidos. Elas ficam protegidas até você escolher mostrá-las.</Text>
        {error ? <Feedback message={error} onRetry={() => void load()} /> : null}
        {!error && items.length === 0 ? <EmptyState title="Nenhuma key entregue ainda" text="Conclua um pedido para encontrar seus jogos aqui." actionLabel="Explorar a loja" onAction={() => router.replace("/(tabs)/loja" as never)} /> : null}
        {!error && items.length > 0 ? <View style={styles.list}>{items.map((item) => {
          const isVisible = visibleKeys.includes(item.id);
          const title = item.listing?.game?.title ?? "Jogo";
          return <View key={item.id} style={[styles.card, !compact && styles.cardWide]}>
            <Image source={{ uri: resolveAssetUrl(item.listing?.game?.coverImageUrl) }} style={styles.cover} resizeMode="cover" accessibilityLabel={title} />
            <View style={styles.cardBody}><View style={styles.cardHeader}><View style={styles.copy}><Text style={styles.cardTitle} numberOfLines={2}>{title}</Text><View style={styles.platformRow}><PlatformLogo platformName={item.listing?.platform?.name} iconUrl={item.listing?.platform?.iconUrl} size={30} /><Text style={styles.meta}>{item.listing?.platform?.name ?? "Plataforma"} · Pedido {item.order?.orderNumber ?? "-"}</Text></View><Text style={styles.meta}>{formatDate(item.gameKey?.soldAt)}</Text></View><Text style={styles.price}>{toMoney(item.listing?.price)}</Text></View>
              <View style={styles.keyBox}><View style={styles.copy}><Text style={styles.keyLabel}>KEY</Text><Text selectable style={styles.keyValue}>{isVisible ? item.gameKey?.keyValue ?? "-" : maskKey(item.gameKey?.keyValue)}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={isVisible ? `Ocultar key de ${title}` : `Mostrar key de ${title}`} onPress={() => setVisibleKeys((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} style={styles.keyButton}><Ionicons name={isVisible ? "eye-off-outline" : "eye-outline"} size={17} color="#dbeafe" /><Text style={styles.keyButtonText}>{isVisible ? "Ocultar" : "Mostrar key"}</Text></Pressable></View>
            </View>
          </View>;
        })}</View> : null}
        {!error && meta.totalPages > 1 ? <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  return <View style={styles.pagination}><Pressable accessibilityLabel="Página anterior" disabled={page <= 1} onPress={() => onPageChange(page - 1)} style={[styles.pageButton, page <= 1 && styles.disabled]}><Ionicons name="chevron-back" size={18} color="#e2e8f0" /></Pressable><Text style={styles.meta}>Página {page} de {totalPages}</Text><Pressable accessibilityLabel="Próxima página" disabled={page >= totalPages} onPress={() => onPageChange(page + 1)} style={[styles.pageButton, page >= totalPages && styles.disabled]}><Ionicons name="chevron-forward" size={18} color="#e2e8f0" /></Pressable></View>;
}

function LoadingState({ label }: { label: string }) { return <SafeAreaView style={styles.safeArea}><View style={styles.state}><ActivityIndicator color="#67e8f9" /><Text style={styles.meta}>{label}</Text></View></SafeAreaView>; }
function AccessState({ title, text }: { title: string; text: string }) { return <SafeAreaView style={styles.safeArea}><View style={styles.state}><Ionicons name="lock-closed-outline" size={38} color="#67e8f9" /><Text style={styles.stateTitle}>{title}</Text><Text style={styles.stateText}>{text}</Text><Pressable onPress={() => router.replace("/login")} style={styles.primaryButton}><Text style={styles.primaryText}>Abrir tela de login</Text></Pressable></View></SafeAreaView>; }
function EmptyState({ title, text, actionLabel, onAction }: { title: string; text: string; actionLabel: string; onAction: () => void }) { return <View style={styles.empty}><Ionicons name="key-outline" size={34} color="#67e8f9" /><Text style={styles.stateTitle}>{title}</Text><Text style={styles.stateText}>{text}</Text><Pressable onPress={onAction} style={styles.primaryButton}><Text style={styles.primaryText}>{actionLabel}</Text></Pressable></View>; }
function Feedback({ message, onRetry }: { message: string; onRetry: () => void }) { return <View style={styles.feedback}><Text style={styles.feedbackText}>{message}</Text><Pressable onPress={onRetry}><Text style={styles.retryText}>Tentar novamente</Text></Pressable></View>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" }, content: { width: "100%", maxWidth: 960, alignSelf: "center", padding: 20, paddingBottom: 40 }, back: { minHeight: 48, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8 }, backText: { color: "#cbd5e1", fontSize: 14, fontWeight: "700" }, title: { marginTop: 14, color: "#fff", fontSize: 30, fontWeight: "900", letterSpacing: -0.7 }, subtitle: { marginTop: 8, color: "#cbd5e1", fontSize: 14, lineHeight: 21 }, list: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 22 }, card: { width: "100%", overflow: "hidden", borderWidth: 1, borderColor: "#334155", borderRadius: 16, backgroundColor: "#0f172a" }, cardWide: { width: "49%" }, cover: { width: "100%", aspectRatio: 16 / 7, backgroundColor: "#020617" }, cardBody: { padding: 16 }, cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 }, copy: { flex: 1, minWidth: 0 }, cardTitle: { color: "#fff", fontSize: 18, fontWeight: "800" }, platformRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8 }, meta: { marginTop: 5, color: "#94a3b8", fontSize: 12, lineHeight: 18 }, price: { color: "#bfdbfe", fontSize: 16, fontWeight: "900" }, keyBox: { marginTop: 14, padding: 12, borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#020617", flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 }, keyLabel: { color: "#64748b", fontSize: 10, fontWeight: "900", letterSpacing: 1.4 }, keyValue: { marginTop: 4, color: "#f8fafc", fontFamily: "monospace", fontSize: 13, letterSpacing: 0.6 }, keyButton: { minHeight: 44, paddingHorizontal: 11, borderWidth: 1, borderColor: "#475569", borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 6 }, keyButtonText: { color: "#dbeafe", fontSize: 12, fontWeight: "800" }, state: { flex: 1, minHeight: 260, alignItems: "center", justifyContent: "center", padding: 28, gap: 10 }, stateTitle: { marginTop: 8, color: "#fff", fontSize: 21, fontWeight: "900", textAlign: "center" }, stateText: { maxWidth: 340, color: "#94a3b8", fontSize: 14, lineHeight: 21, textAlign: "center" }, primaryButton: { minHeight: 48, marginTop: 18, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#2563eb" }, primaryText: { color: "#fff", fontSize: 14, fontWeight: "800" }, empty: { marginTop: 22, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 16, backgroundColor: "#0f172a" }, feedback: { marginTop: 18, padding: 14, borderWidth: 1, borderColor: "rgba(244,63,94,0.4)", borderRadius: 12, backgroundColor: "rgba(244,63,94,0.1)" }, feedbackText: { color: "#fecdd3", fontSize: 14, lineHeight: 20 }, retryText: { marginTop: 8, color: "#fda4af", fontSize: 13, fontWeight: "800" }, pagination: { marginTop: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, pageButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a" }, disabled: { opacity: 0.45 },
});
