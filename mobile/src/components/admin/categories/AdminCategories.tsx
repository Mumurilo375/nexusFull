import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import AdminLayout, { AdminButton, AdminConfirmModal, AdminLinkButton, AdminPageState, AdminPagination, adminStyles, createEmptyMeta } from "../shared/adminShared";
import api from "../../../services/api";
import { getApiErrorMessage } from "../../../services/http";
import type { Category, PaginatedResponse } from "../shared/admin.types";

const PAGE_SIZE = 8;
export default function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [meta, setMeta] = useState(createEmptyMeta(PAGE_SIZE));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try { setLoading(true); setError(""); const data = await api.get<PaginatedResponse<Category>>(`/categories?page=${page}&limit=${PAGE_SIZE}`); setItems(data.items ?? []); setMeta(data.meta ?? createEmptyMeta(PAGE_SIZE)); }
    catch (requestError) { setItems([]); setError(getApiErrorMessage(requestError, "Não foi possível carregar as categorias.")); }
    finally { setLoading(false); }
  }, [page]);
  useEffect(() => { void load(); }, [load]);
  const remove = async () => { if (!pending) return; try { setDeleting(true); await api.delete(`/categories/${pending.id}`); setPending(null); if (items.length === 1 && page > 1) setPage((current) => current - 1); else await load(); } catch (requestError) { setPending(null); setError(getApiErrorMessage(requestError, "Não foi possível excluir a categoria.")); } finally { setDeleting(false); } };

  return <AdminLayout title="Categorias" description="Mantenha a classificação usada na loja e no painel." backTo="/admin" actions={<AdminLinkButton to="/admin/categories/new">Nova categoria</AdminLinkButton>}>
    <AdminPageState loading={loading} error={error} isEmpty={items.length === 0} loadingText="Carregando categorias..." emptyText="Nenhuma categoria cadastrada."><View style={adminStyles.card}><Text style={adminStyles.muted}>{meta.total} categoria(s) cadastrada(s)</Text>{items.map((item) => <View key={item.id} style={styles.item}><View style={{ flex: 1 }}><Text style={styles.id}>#{item.id}</Text><Text style={styles.name}>{item.name}</Text></View><View style={adminStyles.wrap}><AdminButton tone="secondary" onPress={() => router.push(`/admin/categories/${item.id}/edit` as never)}>Editar</AdminButton><AdminButton tone="subtleDanger" disabled={deleting && pending?.id === item.id} onPress={() => setPending(item)}>{deleting && pending?.id === item.id ? "Excluindo..." : "Excluir"}</AdminButton></View></View>)}<AdminPagination meta={meta} onPageChange={setPage} /></View></AdminPageState>
    <AdminConfirmModal visible={Boolean(pending)} title="Excluir categoria" message={`Tem certeza que deseja excluir a categoria ${pending?.name ?? ""}?`} processing={deleting} tone="danger" onCancel={() => setPending(null)} onConfirm={() => void remove()} />
  </AdminLayout>;
}
const styles = { item: { minHeight: 68, flexDirection: "row" as const, alignItems: "center" as const, gap: 12, borderTopWidth: 1, borderTopColor: "#1e293b", paddingVertical: 12 }, id: { color: "#64748b", fontSize: 12 }, name: { color: "#ffffff", fontSize: 16, fontWeight: "700" as const, marginTop: 3 } };
