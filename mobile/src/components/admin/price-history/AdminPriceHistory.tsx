import { Text } from "@/src/components/ui/Typography";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import AdminLayout, { AdminButton, AdminPageState, AdminPagination, adminColors, AdminTextField, adminStyles, createEmptyMeta, formatDateTime, formatMoney } from "../shared/adminShared";
import api from "../../../services/api";
import { getApiErrorMessage } from "../../../services/http";
import type { AdminPriceHistoryItem, PaginatedResponse } from "../shared/admin.types";

const PAGE_SIZE = 12;

function normalizeListingId(value?: string | null) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return Number(digits) > 0 ? digits : "";
}

function getPriceChange(previousPrice: number | null, nextPrice: number) {
  if (previousPrice === null) {
    return { label: "Cadastro", icon: "add-circle-outline" as const, color: adminColors.cyan, backgroundColor: adminColors.primarySoft, borderColor: "rgba(34,211,238,0.3)" };
  }

  const difference = Number(nextPrice) - Number(previousPrice);
  if (difference > 0) {
    return { label: "Aumento", icon: "trending-up-outline" as const, color: adminColors.warning, backgroundColor: adminColors.warningSoft, borderColor: "rgba(251,191,36,0.34)" };
  }
  if (difference < 0) {
    return { label: "Redução", icon: "trending-down-outline" as const, color: adminColors.success, backgroundColor: adminColors.successSoft, borderColor: "rgba(16,185,129,0.34)" };
  }
  return { label: "Sem alteração", icon: "remove-outline" as const, color: adminColors.muted, backgroundColor: adminColors.deep, borderColor: adminColors.border };
}

function formatCount(total: number) {
  return `${total} ${total === 1 ? "alteração encontrada" : "alterações encontradas"}`;
}

export default function AdminPriceHistory() {
  const params = useLocalSearchParams<{ listingId?: string }>();
  const routeListingId = Array.isArray(params.listingId) ? params.listingId[0] : params.listingId;
  const initialListingId = normalizeListingId(routeListingId);
  const [items, setItems] = useState<AdminPriceHistoryItem[]>([]);
  const [meta, setMeta] = useState(createEmptyMeta(PAGE_SIZE));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [listingId, setListingId] = useState(initialListingId);
  const [applied, setApplied] = useState({ search: "", listingId: initialListingId });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
        if (applied.search) query.set("q", applied.search);
        if (applied.listingId) query.set("listingId", applied.listingId);

        const data = await api.get<PaginatedResponse<AdminPriceHistoryItem>>(`/admin/price-history?${query.toString()}`, { signal: controller.signal });
        if (ignore) return;
        setItems(data.items ?? []);
        setMeta(data.meta ?? createEmptyMeta(PAGE_SIZE));
      } catch (requestError) {
        if (ignore) return;
        setItems([]);
        setError(getApiErrorMessage(requestError, "Não foi possível carregar o histórico de preço."));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void load();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [applied, page, reloadToken]);

  const apply = () => {
    Keyboard.dismiss();
    setPage(1);
    setApplied({ search: search.trim(), listingId: normalizeListingId(listingId) });
  };

  const clear = () => {
    Keyboard.dismiss();
    setSearch("");
    setListingId("");
    setApplied({ search: "", listingId: "" });
    setPage(1);
  };

  const hasActiveFilters = Boolean(applied.search || applied.listingId);
  const activeFilterCount = Number(Boolean(applied.search)) + Number(Boolean(applied.listingId));

  return (
    <AdminLayout title="Auditoria de preço" description="Acompanhe quando o preço base mudou, em qual oferta e por quem." backTo="/admin">
      <View style={styles.filterPanel}>
        <View style={styles.filterHeading}>
          <View style={styles.filterIcon} accessibilityElementsHidden>
            <Ionicons name="options-outline" size={20} color={adminColors.cyan} />
          </View>
          <View style={styles.filterCopy}>
            <Text style={adminStyles.sectionTitle}>Refinar histórico</Text>
            <Text style={adminStyles.muted}>Encontre uma alteração por jogo, plataforma, responsável ou ID da oferta.</Text>
          </View>
        </View>

        <AdminTextField label="Buscar no histórico" value={search} onChangeText={setSearch} placeholder="Jogo, plataforma ou responsável" autoCapitalize="none" />
        <AdminTextField label="ID da oferta" value={listingId} onChangeText={(value) => setListingId(normalizeListingId(value))} placeholder="Ex.: 14" note="Use apenas o código numérico da oferta." keyboardType="numeric" />

        <View style={styles.filterActions}>
          <AdminButton disabled={loading} onPress={apply} style={styles.actionButton}>{loading ? "Atualizando..." : "Aplicar filtros"}</AdminButton>
          <AdminButton tone="secondary" disabled={!search && !listingId && !hasActiveFilters} onPress={clear} style={styles.actionButton}>Limpar</AdminButton>
        </View>

        {hasActiveFilters ? (
          <View style={styles.activeFilters} accessibilityLiveRegion="polite">
            <Text style={styles.activeFiltersTitle}>{activeFilterCount} {activeFilterCount === 1 ? "filtro ativo" : "filtros ativos"}</Text>
            <View style={styles.chips}>
              {applied.search ? <View style={styles.chip}><Text style={styles.chipText} numberOfLines={1}>Busca: {applied.search}</Text></View> : null}
              {applied.listingId ? <View style={styles.chip}><Text style={styles.chipText}>Oferta #{applied.listingId}</Text></View> : null}
            </View>
          </View>
        ) : null}
      </View>

      <AdminPageState
        loading={loading}
        error={error}
        onRetry={() => setReloadToken((current) => current + 1)}
        isEmpty={items.length === 0}
        loadingText="Carregando histórico..."
        emptyText={hasActiveFilters ? "Nenhuma alteração encontrada com esses filtros. Toque em Limpar para ver todo o histórico." : "Ainda não existem alterações de preço registradas."}
      >
        <View style={styles.results}>
          <View style={styles.resultsHeader}>
            <View style={styles.resultsCopy}>
              <Text style={adminStyles.sectionTitle}>Alterações registradas</Text>
              <Text style={adminStyles.muted}>{formatCount(meta.total)}</Text>
            </View>
            <Ionicons name="time-outline" size={22} color={adminColors.cyan} accessibilityLabel="Histórico ordenado do mais recente para o mais antigo" />
          </View>

          {items.map((item) => <PriceHistoryCard key={item.id} item={item} />)}
          <AdminPagination meta={meta} onPageChange={setPage} />
        </View>
      </AdminPageState>
    </AdminLayout>
  );
}

function PriceHistoryCard({ item }: { item: AdminPriceHistoryItem }) {
  const previousPrice = item.previousPrice === null ? "Cadastro inicial" : formatMoney(item.previousPrice);
  const change = getPriceChange(item.previousPrice, item.nextPrice);
  const changedBy = item.changedBy?.username || item.changedBy?.email || "Responsável não identificado";
  const gameTitle = item.game?.title || "Jogo não identificado";
  const platformName = item.platform?.name || "Plataforma não identificada";

  return (
    <View style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.titleGroup}>
          <View style={styles.platformMarker}><Ionicons name="game-controller-outline" size={17} color={adminColors.cyan} /></View>
          <View style={styles.titleCopy}>
            <Text style={adminStyles.sectionTitle} numberOfLines={2}>{gameTitle}</Text>
            <Text style={adminStyles.muted} numberOfLines={1}>{platformName} · Oferta #{item.listingId}</Text>
          </View>
        </View>
        <View style={[styles.changeBadge, { backgroundColor: change.backgroundColor, borderColor: change.borderColor }]}>
          <Ionicons name={change.icon} size={15} color={change.color} />
          <Text style={[styles.changeText, { color: change.color }]}>{change.label}</Text>
        </View>
      </View>

      <View style={styles.divider} />
      <View style={styles.priceRow}>
        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>Preço anterior</Text>
          <Text style={styles.previousPrice}>{previousPrice}</Text>
        </View>
        <View style={styles.arrow} accessibilityElementsHidden><Ionicons name="arrow-forward" size={20} color={adminColors.cyan} /></View>
        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>Novo preço</Text>
          <Text style={styles.nextPrice}>{formatMoney(item.nextPrice)}</Text>
        </View>
      </View>

      <View style={styles.auditMeta}>
        <View style={styles.auditItem}>
          <Text style={styles.metaLabel}>Responsável</Text>
          <Text style={styles.metaValue} numberOfLines={1}>{changedBy}</Text>
        </View>
        <View style={[styles.auditItem, styles.dateItem]}>
          <Text style={styles.metaLabel}>Alterado em</Text>
          <Text style={styles.metaValue} numberOfLines={2}>{formatDateTime(item.createdAt)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterPanel: { gap: 16, borderWidth: 1, borderColor: adminColors.softBorder, borderRadius: 18, backgroundColor: adminColors.surface, padding: 16 },
  filterHeading: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  filterIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: adminColors.primarySoft },
  filterCopy: { flex: 1, gap: 4 },
  filterActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionButton: { flexGrow: 1, minWidth: 132 },
  activeFilters: { gap: 8, paddingTop: 2 },
  activeFiltersTitle: { color: adminColors.secondary, fontSize: 12, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { maxWidth: "100%", borderWidth: 1, borderColor: "rgba(34,211,238,0.3)", borderRadius: 999, backgroundColor: adminColors.primarySoft, paddingHorizontal: 10, paddingVertical: 6 },
  chipText: { maxWidth: 260, color: adminColors.cyan, fontSize: 12, fontWeight: "700" },
  results: { gap: 12 },
  resultsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 4 },
  resultsCopy: { flex: 1, gap: 3 },
  historyCard: { gap: 0, borderWidth: 1, borderColor: adminColors.softBorder, borderRadius: 18, backgroundColor: adminColors.surface, padding: 16 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  titleGroup: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  titleCopy: { flex: 1, minWidth: 0, gap: 4 },
  platformMarker: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: adminColors.primarySoft },
  changeBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  changeText: { fontSize: 11, fontWeight: "800" },
  divider: { height: 1, marginVertical: 14, backgroundColor: adminColors.softBorder },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  priceColumn: { flex: 1, minWidth: 0, gap: 5 },
  priceLabel: { color: adminColors.muted, fontSize: 11, fontWeight: "700" },
  previousPrice: { color: adminColors.secondary, fontSize: 16, fontWeight: "700" },
  nextPrice: { color: adminColors.white, fontSize: 20, fontWeight: "800" },
  arrow: { width: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: adminColors.primarySoft },
  auditMeta: { flexDirection: "row", gap: 12, marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: adminColors.softBorder },
  auditItem: { flex: 1, minWidth: 0, gap: 4 },
  dateItem: { alignItems: "flex-end" },
  metaLabel: { color: adminColors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  metaValue: { color: adminColors.secondary, fontSize: 12, lineHeight: 17 },
});
