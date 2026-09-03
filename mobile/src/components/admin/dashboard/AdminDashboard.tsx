import { Text } from "@/src/components/ui/Typography";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import AdminLayout, { adminColors, adminStyles } from "../shared/adminShared";

const groups = [
  {
    title: "Catálogo",
    description: "Mantenha os itens que aparecem na loja organizados.",
    items: [
      { title: "Jogos", description: "Cadastre jogos e abra suas ofertas.", to: "/admin/games" },
      { title: "Plataformas", description: "Gerencie as plataformas disponíveis.", to: "/admin/platforms" },
      { title: "Categorias", description: "Organize a classificação do catálogo.", to: "/admin/categories" },
    ],
  },
  {
    title: "Operação",
    description: "Acompanhe vendas, promoções e alterações de preço.",
    items: [
      { title: "Pedidos", description: "Consulte pedidos e seus detalhes.", to: "/admin/orders" },
      { title: "Ofertas", description: "Crie promoções e acompanhe os vínculos.", to: "/admin/ofertas" },
      { title: "Auditoria de preços", description: "Veja o histórico de alterações das ofertas.", to: "/admin/price-history" },
    ],
  },
];

export default function AdminDashboard() {
  return <AdminLayout title="Painel admin" description="Escolha uma tarefa para continuar a operação da loja.">
    <View style={styles.groups}>{groups.map((group) => <View key={group.title} style={[adminStyles.card, styles.group]}><View style={styles.groupHeader}><Text style={styles.groupTitle}>{group.title}</Text><Text style={styles.groupDescription}>{group.description}</Text></View><View style={styles.tasks}>{group.items.map((item) => <Pressable key={item.to} accessibilityRole="button" onPress={() => router.push(item.to as never)} style={({ pressed }) => [styles.task, pressed && styles.pressed]}><View style={styles.taskCopy}><Text style={styles.taskTitle}>{item.title}</Text><Text style={styles.taskDescription}>{item.description}</Text></View><Ionicons name="chevron-forward" size={19} color={adminColors.muted} /></Pressable>)}</View></View>)}</View>
  </AdminLayout>;
}

const styles = StyleSheet.create({
  groups: { gap: 12 },
  group: { paddingTop: 14 },
  groupHeader: { paddingHorizontal: 2, paddingBottom: 14 },
  groupTitle: { color: "#67e8f9", fontSize: 12, lineHeight: 17, fontWeight: "700", letterSpacing: 1.3, textTransform: "uppercase" },
  groupDescription: { maxWidth: 520, marginTop: 5, color: adminColors.muted, fontSize: 12, lineHeight: 18 },
  tasks: { borderTopWidth: 1, borderTopColor: adminColors.softBorder },
  task: { minHeight: 70, paddingVertical: 11, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: adminColors.softBorder },
  taskCopy: { flex: 1 },
  taskTitle: { color: "#f8fafc", fontSize: 15, fontWeight: "800" },
  taskDescription: { marginTop: 3, color: adminColors.muted, fontSize: 12, lineHeight: 18 },
  pressed: { opacity: 0.68 },
});
