import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../shared/AdminLayout";
import {
  AdminFormActions,
  AdminNotice,
  AdminSideCard,
  AdminTextField,
  adminFormClass,
} from "../shared/adminShared";
import api from "../../../services/api";
import { getApiErrorMessage } from "../../../services/http";
import type { CategoryResponse } from "../shared/admin.types";

export default function AdminCategoryForm({ id }: { id?: string }) {
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [categoryName, setCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const { data } = await api.get<CategoryResponse>(`/categories/${id}`);
        setCategoryName(data.name ?? "");
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, "Não foi possível carregar a categoria."),
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchCategory();
  }, [id]);

  const saveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = categoryName.trim();

    if (!name) {
      setErrorMessage("Informe o nome da categoria.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      if (isEditing) {
        await api.put(`/categories/${id}`, { name });
      } else {
        await api.post("/categories", { name });
      }

      void navigate("/admin/categories");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Não foi possível salvar a categoria."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout
      title={isEditing ? "Editar categoria" : "Nova categoria"}
      description="Formulário simples para manter as categorias do projeto."
      backTo="/admin/categories"
      backLabel="Voltar para categorias"
    >
      {isLoading ? (
        <p className="text-gray-300">Carregando formulário...</p>
      ) : (
        <form onSubmit={saveCategory} className={adminFormClass}>
          <div className="grid gap-5 lg:grid-cols-[1fr,280px]">
            <AdminTextField
              label="Nome"
              type="text"
              value={categoryName}
              onChange={({ target }) => setCategoryName(target.value)}
              required
            />
            <AdminSideCard eyebrow="Estrutura">
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Use nomes curtos e claros para manter os filtros da loja e do
                painel mais organizados.
              </p>
            </AdminSideCard>
          </div>

          {errorMessage && <AdminNotice>{errorMessage}</AdminNotice>}
          <AdminFormActions
            backTo="/admin/categories"
            saving={isSaving}
            submitLabel="Salvar"
          />
        </form>
      )}
    </AdminLayout>
  );
}

