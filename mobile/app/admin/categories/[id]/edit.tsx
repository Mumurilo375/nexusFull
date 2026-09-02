import { useLocalSearchParams } from "expo-router";
import AdminCategoryForm from "../../../../src/components/admin/categories/AdminCategoryForm";

export default function AdminCategoryEdit() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  return <AdminCategoryForm id={Array.isArray(id) ? id[0] : id} />;
}
