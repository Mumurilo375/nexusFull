import { useLocalSearchParams } from "expo-router";
import AdminPlatformForm from "../../../../src/components/admin/platforms/AdminPlatformForm";
export default function EditPlatform() { const { id } = useLocalSearchParams<{ id?: string }>(); return <AdminPlatformForm id={Array.isArray(id) ? id[0] : id} />; }
