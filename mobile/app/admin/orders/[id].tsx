import { useLocalSearchParams } from "expo-router";
import AdminOrderDetails from "../../../src/components/admin/orders/AdminOrderDetails";

export default function AdminOrderDetailsPage() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  return <AdminOrderDetails orderId={Array.isArray(id) ? id[0] : id} />;
}
