import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../shared/AdminLayout";
import {
  AdminLinkButton,
  AdminPageState,
  AdminStatusBadge,
  adminBackToPanelClass,
  createEmptyMeta,
} from "../shared/adminShared";
import Pagination from "../../globals/Pagination";
import api from "../../../services/api";
import { resolvePlatformLogoUrl } from "../../../services/assets";
import {
  getApiErrorMessage,
  type PaginatedResponse,
} from "../../../services/http";
import type { AdminPlatform } from "../shared/admin.types";

const PAGE_SIZE = 8;
const emptyPagination = createEmptyMeta(PAGE_SIZE);
const actionBaseClass =
  "inline-flex min-h-9 items-center justify-center rounded-xl border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70";
const editActionClass = `${actionBaseClass} border-slate-700 bg-slate-950 text-slate-100 hover:border-blue-500/45 hover:bg-slate-900`;

export default function AdminPlatforms() {
  const [platforms, setPlatforms] = useState<AdminPlatform[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchPlatformsPage = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const { data } = await api.get<PaginatedResponse<AdminPlatform>>(
        "/platforms",
        {
          params: { page: currentPage, limit: PAGE_SIZE },
        },
      );

      setPlatforms(data.items ?? []);
      setPagination(data.meta ?? emptyPagination);
    } catch (error) {
      setPlatforms([]);
      setPagination(emptyPagination);
      setErrorMessage(
        getApiErrorMessage(error, "Não foi possível carregar as plataformas."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    void fetchPlatformsPage();
  }, [fetchPlatformsPage]);

  const totalLabel = `${pagination.total} plataforma${
    pagination.total === 1 ? " cadastrada" : "s cadastradas"
  }`;

  return (
    <AdminLayout
      title="Plataformas"
      description="Cadastre as plataformas que aparecem no monitor de jogos e nos listings da loja."
      backTo="/admin"
      backLabel="Voltar ao painel"
      backClassName={adminBackToPanelClass}
      actions={
        <AdminLinkButton to="/admin/platforms/new" tone="primary">
          Nova plataforma
        </AdminLinkButton>
      }
    >
      <AdminPageState
        loading={isLoading}
        error={errorMessage}
        isEmpty={platforms.length === 0}
        loadingText="Carregando plataformas..."
        emptyText="Nenhuma plataforma cadastrada."
      >
        <>
          <div className="nexus-card p-4">
            <p className="pb-4 text-sm text-slate-300">{totalLabel}</p>
            <div className="overflow-hidden rounded-[24px] border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 bg-slate-950 text-sm">
                <thead className="bg-slate-900 text-left text-gray-300">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Logo</th>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {platforms.map((platform) => (
                    <tr key={platform.id}>
                      <td className="px-4 py-4 text-gray-400">{platform.id}</td>
                      <td className="px-4 py-4">
                        <img
                          src={resolvePlatformLogoUrl(
                            platform.name,
                            platform.iconUrl,
                          )}
                          alt={platform.name}
                          className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900 object-contain p-1.5"
                        />
                      </td>
                      <td className="px-4 py-4 font-medium">{platform.name}</td>
                      <td className="px-4 py-4 text-slate-300">
                        {platform.slug}
                      </td>
                      <td className="px-4 py-4">
                        <AdminStatusBadge
                          active={platform.isActive}
                          activeLabel="Ativa"
                          inactiveLabel="Inativa"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <AdminLinkButton
                            to={`/admin/platforms/${platform.id}/edit`}
                            tone="secondary"
                            className={editActionClass}
                          >
                            Editar
                          </AdminLinkButton>
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
        </>
      </AdminPageState>
    </AdminLayout>
  );
}
