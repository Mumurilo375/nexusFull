import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Text, View } from "react-native";
import AdminLayout, { AdminFormActions, AdminNotice, AdminSideCard, AdminTextField, adminStyles } from "../shared/adminShared";
import api from "../../../services/api";
import { getApiErrorMessage } from "../../../services/http";
import type { CategoryResponse } from "../shared/admin.types";

export default function AdminCategoryForm({ id }: { id?: string }) {
  const editing = Boolean(id); const [name, setName] = useState(""); const [loading, setLoading] = useState(editing); const [saving, setSaving] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  useEffect(() => { if (!id) return; void api.get<CategoryResponse>(`/categories/${id}`).then((data) => setName(data.name ?? "")).catch((requestError) => setError(getApiErrorMessage(requestError, "Não foi possível carregar a categoria."))).finally(() => setLoading(false)); }, [id]);
  const submit = async () => { const value = name.trim(); if (!value) { setError("Informe o nome da categoria."); return; } try { setSaving(true); setError(""); if (editing) { await api.put(`/categories/${id}`, { name: value }); router.replace("/admin/categories" as never); } else { await api.post("/categories", { name: value }); setName(""); setSuccess(`Categoria criada: ${value}`); } } catch (requestError) { setError(getApiErrorMessage(requestError, "Não foi possível salvar a categoria.")); } finally { setSaving(false); } };
  return <AdminLayout title={editing ? "Editar categoria" : "Nova categoria"} description="Formulário simples para manter as categorias do projeto." backTo="/admin/categories">{loading ? <Text style={adminStyles.muted}>Carregando formulário...</Text> : <View style={adminStyles.card}><AdminTextField label="Nome" value={name} onChangeText={(value) => { setName(value); setError(""); }} placeholder="Ex.: Ação" /><AdminSideCard eyebrow="Estrutura"><Text style={adminStyles.description}>Use nomes curtos e claros para manter os filtros da loja e do painel organizados.</Text></AdminSideCard>{error ? <AdminNotice>{error}</AdminNotice> : null}{success ? <AdminNotice tone="success">{success}</AdminNotice> : null}<AdminFormActions onSubmit={() => void submit()} onCancel={() => router.replace("/admin/categories" as never)} submitLabel="Salvar" saving={saving} /></View>}</AdminLayout>;
}
