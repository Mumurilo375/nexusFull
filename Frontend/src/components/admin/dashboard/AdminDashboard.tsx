import AdminLayout from "../shared/AdminLayout";
import { AdminLinkButton } from "../shared/adminShared";

const sections = [
  { title: "Jogos", label: "Catálogo", description: "Cadastre, edite, exclua e abra os listings de cada jogo.", to: "/admin/games", cta: "Gerenciar jogos" },
  { title: "Categorias", label: "Organização", description: "Mantenha a classificação usada na loja e no admin.", to: "/admin/categories", cta: "Gerenciar categorias" },
  { title: "Plataformas", label: "Catálogo", description: "Cadastre as plataformas disponíveis para os jogos e listings.", to: "/admin/platforms", cta: "Gerenciar plataformas" },
  { title: "Pedidos", label: "Operação", description: "Consulte todos os pedidos da loja com filtros e detalhe completo.", to: "/admin/orders", cta: "Ver pedidos" },
  { title: "Auditoria", label: "Preço", description: "Acompanhe o histórico do preço base de cada listing e quem alterou.", to: "/admin/price-history", cta: "Ver histórico" },
  { title: "Ofertas", label: "Promoções", description: "Cadastre promoções em grupo e acompanhe os jogos vinculados.", to: "/admin/ofertas", cta: "Gerenciar ofertas" },
];

export default function AdminDashboard() {
  return (
    <AdminLayout title="Painel admin" description="Acesse os fluxos principais de gestão da demo.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map(({ title, label, description, to, cta }) => (
          <section key={title} className="nexus-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/80">
              {label}
            </p>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-gray-300">{description}</p>
            <AdminLinkButton to={to} tone="primary" className="mt-4 inline-flex">
              {cta}
            </AdminLinkButton>
          </section>
        ))}
      </div>
    </AdminLayout>
  );
}
