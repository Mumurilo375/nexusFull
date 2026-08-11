import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../shared/AdminLayout";
import AdminConfirmModal from "../shared/AdminConfirmModal";
import {
  AdminButton,
  AdminLinkButton,
  AdminPageState,
  adminBackToPanelClass,
  createEmptyMeta,
} from "../shared/adminShared";
import Pagination from "../../globals/Pagination";
import api from "../../../services/api";
import {
  getApiErrorMessage,
  type PaginatedResponse,
} from "../../../services/http";
import type { Category } from "../shared/admin.types";

const PAGE_SIZE = 8;
const emptyPagination = createEmptyMeta(PAGE_SIZE);
const actionBaseClass =
  "inline-flex min-h-9 items-center justify-center rounded-xl border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70";
const editActionClass = `${actionBaseClass} border-slate-700 bg-slate-950 text-slate-100 hover:border-blue-500/45 hover:bg-slate-900`;
const deleteActionClass = `${actionBaseClass} border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20`;

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(
    null,
  );
  const [pendingDeleteCategory, setPendingDeleteCategory] =
    useState<Category | null>(null);

  const fetchCategoriesPage = useCallback(
    async (page = currentPage) => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const { data } = await api.get<PaginatedResponse<Category>>(
          "/categories",
          {
            params: { page, limit: PAGE_SIZE },
          },
        );

        setCategories(data.items ?? []);
        setPagination(data.meta ?? emptyPagination);
      } catch (error) {
        setCategories([]);
        setPagination(emptyPagination);
        setErrorMessage(
          getApiErrorMessage(error, "Não foi possível carregar as categorias."),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage],
  );

  useEffect(() => {
    void fetchCategoriesPage();
  }, [fetchCategoriesPage]);

  const removeCategory = async () => {
    if (!pendingDeleteCategory) return;

    const categoryId = pendingDeleteCategory.id;

    try {
      setDeletingCategoryId(categoryId);
      setErrorMessage("");
      await api.delete(`/categories/${categoryId}`);
      setPendingDeleteCategory(null);

      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
        return;
      }

      await fetchCategoriesPage();
    } catch (error) {
      setPendingDeleteCategory(null);
      setErrorMessage(
        getApiErrorMessage(error, "Não foi possível excluir a categoria."),
      );
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const totalLabel = `${pagination.total} categoria${
    pagination.total === 1 ? " cadastrada" : "s cadastradas"
  }`;

  return (
    <AdminLayout
      title="Categorias"
      description=""
      backTo="/admin"
      backLabel="Voltar ao painel"
      backClassName={adminBackToPanelClass}
      actions={
        <AdminLinkButton to="/admin/categories/new" tone="primary">
          Nova categoria
        </AdminLinkButton>
      }
    >
      <AdminPageState
        loading={isLoading}
        error={errorMessage}
        isEmpty={categories.length === 0}
        loadingText="Carregando categorias..."
        emptyText="Nenhuma categoria cadastrada."
      >
        <>
          <div className="nexus-card p-4">
            <p className="pb-4 ml-4.5 text-sm text-slate-300">{totalLabel}</p>
            <div className="overflow-hidden rounded-[24px] border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 bg-slate-950 text-sm">
                <thead className="bg-slate-900 text-left text-gray-300">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-4 py-4 text-gray-400">{category.id}</td>
                      <td className="px-4 py-4 font-medium">{category.name}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800/90 bg-slate-900/45 p-1.5">
                            <AdminLinkButton
                              to={`/admin/categories/${category.id}/edit`}
                              tone="secondary"
                              className={editActionClass}
                            >
                              Editar
                            </AdminLinkButton>
                            <AdminButton
                              type="button"
                              tone="subtleDanger"
                              className={deleteActionClass}
                              disabled={deletingCategoryId === category.id}
                              onClick={() => setPendingDeleteCategory(category)}
                            >
                              {deletingCategoryId === category.id
                                ? "Excluindo..."
                                : "Excluir"}
                            </AdminButton>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
          />

          {pendingDeleteCategory && (
            <AdminConfirmModal
              title="Excluir categoria"
              message={
                <>
                  Tem certeza que deseja excluir a categoria{" "}
                  <span className="font-semibold text-white">
                    {pendingDeleteCategory.name}
                  </span>
                  ?
                </>
              }
              isProcessing={deletingCategoryId === pendingDeleteCategory.id}
              onCancel={() => setPendingDeleteCategory(null)}
              onConfirm={() => {
                void removeCategory();
              }}
              tone="danger"
              confirmLabel="Excluir"
              processingLabel="Excluindo..."
            />
          )}
        </>
      </AdminPageState>
    </AdminLayout>
  );
}
