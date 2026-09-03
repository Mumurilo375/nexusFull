import { Text, TextInput } from "@/src/components/ui/Typography";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import api from "../../../services/api";
import { resolveAssetUrl } from "../../../services/assets";
import { getApiErrorMessage } from "../../../services/http";
import AdminLayout, {
  AdminButton,
  AdminConfirmModal,
  AdminLinkButton,
  AdminPageState,
  AdminPagination,
  adminStyles,
  createEmptyMeta,
  formatReleaseDate,
} from "../shared/adminShared";
import type { PaginatedResponse } from "../shared/admin.types";

type Game = {
  id: number;
  title: string;
  description: string;
  coverImageUrl?: string;
  releaseDate: string;
  isActive?: boolean;
};

const PAGE_SIZE = 9;

export default function AdminGames() {
  const [items, setItems] = useState<Game[]>([]);
  const [meta, setMeta] = useState(createEmptyMeta(PAGE_SIZE));
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Game | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const suffix = appliedQuery ? `&q=${encodeURIComponent(appliedQuery)}` : "";
      const data = await api.get<PaginatedResponse<Game>>(`/games?page=${page}&limit=${PAGE_SIZE}${suffix}`);
      setItems(data.items ?? []);
      setMeta(data.meta ?? createEmptyMeta(PAGE_SIZE));
    } catch (requestError) {
      setItems([]);
      setError(getApiErrorMessage(requestError, "Não foi possível carregar os jogos."));
    } finally {
      setLoading(false);
    }
  }, [appliedQuery, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const applySearch = () => {
    setAppliedQuery(query.trim());
    setPage(1);
  };

  const remove = async () => {
    if (!pending) return;
    try {
      setDeleting(true);
      await api.delete(`/games/${pending.id}`);
      setPending(null);
      if (items.length === 1 && page > 1) setPage((current) => current - 1);
      else await load();
    } catch (requestError) {
      setPending(null);
      setError(getApiErrorMessage(requestError, "Não foi possível excluir o jogo."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Jogos"
      description="Cadastre jogos, ajuste o conteúdo da loja e gerencie cada plataforma."
      backTo="/admin"
      actions={<AdminLinkButton to="/admin/games/new">Novo jogo</AdminLinkButton>}
    >
      <View style={adminStyles.card}>
        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Ionicons name="search" size={18} color="#64748b" />
            <TextInput value={query} onChangeText={setQuery} onSubmitEditing={applySearch} placeholder="Pesquisar por título..." placeholderTextColor="#64748b" style={styles.searchInput} returnKeyType="search" />
          </View>
          <AdminButton onPress={applySearch}>Buscar</AdminButton>
        </View>
        <Text style={[adminStyles.muted, styles.resultCount]}>{meta.total} resultado(s)</Text>
      </View>

      <AdminPageState loading={loading} error={error} isEmpty={items.length === 0} loadingText="Carregando jogos..." emptyText={appliedQuery ? "Nenhum jogo encontrado para essa busca." : "Nenhum jogo cadastrado."}>
        <View style={styles.grid}>
          {items.map((game) => (
            <View key={game.id} style={adminStyles.card}>
              <Image source={{ uri: resolveAssetUrl(game.coverImageUrl) }} style={styles.cover} resizeMode="cover" />
              <View style={styles.gameHeader}>
                <View style={styles.gameCopy}>
                  <Text style={styles.title} numberOfLines={2}>{game.title}</Text>
                  <Text style={adminStyles.muted}>Lançamento: {formatReleaseDate(game.releaseDate)}</Text>
                </View>
                <GameStatus active={game.isActive !== false} />
              </View>
              <Text style={styles.description} numberOfLines={3}>{game.description}</Text>
              <View style={styles.primaryActions}>
                <AdminButton tone="secondary" onPress={() => router.push(`/admin/games/${game.id}/edit` as never)} style={styles.primaryAction}>Editar</AdminButton>
                <AdminButton tone="secondary" onPress={() => router.push(`/admin/games/${game.id}/platforms` as never)} style={styles.platformAction}>Plataformas</AdminButton>
              </View>
              <AdminButton tone="subtleDanger" onPress={() => setPending(game)} style={styles.deleteAction}>{deleting && pending?.id === game.id ? "Excluindo..." : "Excluir jogo"}</AdminButton>
            </View>
          ))}
        </View>
        <AdminPagination meta={meta} onPageChange={setPage} />
      </AdminPageState>

      <AdminConfirmModal visible={Boolean(pending)} title="Excluir jogo" message={`Tem certeza que deseja excluir o jogo ${pending?.title ?? ""}?`} processing={deleting} tone="danger" onCancel={() => setPending(null)} onConfirm={() => void remove()} />
    </AdminLayout>
  );
}

function GameStatus({ active }: { active: boolean }) {
  return <View accessibilityLabel={active ? "Jogo ativo" : "Jogo inativo"} style={styles.status}><View style={[styles.statusDot, !active && styles.statusDotInactive]} /><Text style={[styles.statusText, !active && styles.statusTextInactive]}>{active ? "Ativo" : "Inativo"}</Text></View>;
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 },
  search: { flex: 1, minWidth: 210, minHeight: 48, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#334155", borderRadius: 14, backgroundColor: "#020617", paddingHorizontal: 12 },
  searchInput: { flex: 1, minHeight: 46, color: "#ffffff", fontSize: 15 },
  resultCount: { marginTop: 10 },
  grid: { gap: 14 },
  cover: { width: "100%", aspectRatio: 16 / 8, borderRadius: 16, borderWidth: 1, borderColor: "#1e293b", backgroundColor: "#020617" },
  gameHeader: { marginTop: 14, flexDirection: "row", alignItems: "flex-start", gap: 12 },
  gameCopy: { flex: 1, minWidth: 0 },
  title: { color: "#ffffff", fontSize: 18, fontWeight: "700", lineHeight: 23 },
  description: { minHeight: 58, marginTop: 9, color: "#cbd5e1", fontSize: 13, lineHeight: 19 },
  status: { minHeight: 28, flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#34d399" },
  statusDotInactive: { backgroundColor: "#64748b" },
  statusText: { color: "#a7f3d0", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  statusTextInactive: { color: "#94a3b8" },
  primaryActions: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  primaryAction: { flex: 1, minWidth: 104 },
  platformAction: { flex: 1.25, minWidth: 132 },
  deleteAction: { width: "100%", marginTop: 8 },
});
