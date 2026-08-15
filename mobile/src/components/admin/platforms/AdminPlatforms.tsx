import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import PlatformLogo from "../../loja/PlatformLogo";
import AdminLayout, { AdminLinkButton, AdminPageState, AdminPagination, AdminStatusBadge, adminStyles, createEmptyMeta } from "../shared/adminShared";
import api from "../../../services/api";
import { getApiErrorMessage } from "../../../services/http";
import type { AdminPlatform, PaginatedResponse } from "../shared/admin.types";

const PAGE_SIZE = 8;
export default function AdminPlatforms() {
  const [items, setItems] = useState<AdminPlatform[]>([]); const [meta, setMeta] = useState(createEmptyMeta(PAGE_SIZE)); const [page, setPage] = useState(1); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { try { setLoading(true); setError(""); const data = await api.get<PaginatedResponse<AdminPlatform>>(`/platforms?page=${page}&limit=${PAGE_SIZE}`); setItems(data.items ?? []); setMeta(data.meta ?? createEmptyMeta(PAGE_SIZE)); } catch (requestError) { setItems([]); setError(getApiErrorMessage(requestError, "Não foi possível carregar as plataformas.")); } finally { setLoading(false); } }, [page]);
  useEffect(() => { void load(); }, [load]);
  return <AdminLayout title="Plataformas" description="Cadastre as plataformas que aparecem no monitor de jogos e nas ofertas da loja." backTo="/admin" actions={<AdminLinkButton to="/admin/platforms/new">Nova plataforma</AdminLinkButton>}><AdminPageState loading={loading} error={error} isEmpty={items.length === 0} loadingText="Carregando plataformas..." emptyText="Nenhuma plataforma cadastrada."><View style={adminStyles.card}><Text style={adminStyles.muted}>{meta.total} plataforma(s) cadastrada(s)</Text>{items.map((item) => <View key={item.id} style={styles.item}><View style={styles.identity}><PlatformLogo platformName={item.name} iconUrl={item.iconUrl} size={56} /><View style={{ flex: 1, minWidth: 0 }}><Text style={styles.name} numberOfLines={1}>{item.name}</Text><Text style={adminStyles.muted}>/{item.slug}</Text><AdminStatusBadge active={item.isActive} /></View></View><AdminLinkButton to={`/admin/platforms/${item.id}/edit`} style={styles.editButton}>Editar plataforma</AdminLinkButton></View>)}<AdminPagination meta={meta} onPageChange={setPage} /></View></AdminPageState></AdminLayout>;
}
const styles = { item: { gap: 12, minHeight: 84, borderTopWidth: 1, borderTopColor: "#1e293b", paddingVertical: 14 }, identity: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12 }, editButton: { width: "100%" as const }, name: { color: "#ffffff", fontSize: 16, fontWeight: "700" as const, marginBottom: 4 } };
