import { router } from "expo-router";
import { Text, View } from "react-native";
import AdminLayout, { AdminButton, adminColors, adminStyles } from "../shared/adminShared";

const sections = [
  { title: "Jogos", label: "Catálogo", description: "Cadastre, edite, exclua e abra as ofertas de cada jogo.", to: "/admin/games", cta: "Gerenciar jogos" },
  { title: "Categorias", label: "Organização", description: "Mantenha a classificação usada na loja e no admin.", to: "/admin/categories", cta: "Gerenciar categorias" },
  { title: "Plataformas", label: "Catálogo", description: "Cadastre as plataformas disponíveis para os jogos e ofertas.", to: "/admin/platforms", cta: "Gerenciar plataformas" },
  { title: "Pedidos", label: "Operação", description: "Consulte todos os pedidos da loja com filtros e detalhe completo.", to: "/admin/orders", cta: "Ver pedidos" },
  { title: "Auditoria", label: "Preço", description: "Acompanhe o histórico do preço base de cada oferta e quem alterou.", to: "/admin/price-history", cta: "Ver histórico" },
  { title: "Ofertas", label: "Promoções", description: "Cadastre promoções em grupo e acompanhe os jogos vinculados.", to: "/admin/ofertas", cta: "Gerenciar ofertas" },
];

export default function AdminDashboard() {
  return <AdminLayout title="Painel admin" description="Acesse os fluxos principais de gestão da demo.">
    <View style={adminStyles.wrap}>{sections.map((section) => <View key={section.title} style={[adminStyles.card, { flex: 1, minWidth: 280 }]}><Text style={{ color: "#bfdbfe", fontSize: 11, fontWeight: "800", letterSpacing: 1.5 }}>{section.label.toUpperCase()}</Text><Text style={[adminStyles.sectionTitle, { marginTop: 9 }]}>{section.title}</Text><Text style={[adminStyles.description, { marginTop: 7 }]}>{section.description}</Text><AdminButton onPress={() => router.push(section.to as never)} style={{ alignSelf: "flex-start", marginTop: 14 }}><Text style={{ color: adminColors.white, fontSize: 13, fontWeight: "700" }}>{section.cta}</Text></AdminButton></View>)}</View>
  </AdminLayout>;
}
