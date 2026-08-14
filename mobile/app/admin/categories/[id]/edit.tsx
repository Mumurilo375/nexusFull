import { useLocalSearchParams } from "expo-router";
import AdminCategoryForm from "../../../../src/components/admin/categories/AdminCategoryForm";
export default function EditCategory() { const { id } = useLocalSearchParams<{ id?: string }>(); return <AdminCategoryForm id={Array.isArray(id) ? id[0] : id} />; }
