import { useLocalSearchParams } from "expo-router";
import AdminGameForm from "../../../../src/components/admin/games/AdminGameForm";

export default function AdminGameEdit() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  return <AdminGameForm id={Array.isArray(id) ? id[0] : id} />;
}
