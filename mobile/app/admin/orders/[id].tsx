import { useLocalSearchParams } from "expo-router";
import AdminOrderDetails from "../../../src/components/admin/orders/AdminOrderDetails";
export default function OrderDetails() { const { id } = useLocalSearchParams<{ id?: string }>(); return <AdminOrderDetails orderId={Array.isArray(id) ? id[0] : id} />; }
