import { useLocalSearchParams } from "expo-router";
import AdminGameForm from "../../../../src/components/admin/games/AdminGameForm";
export default function EditGame() { const { id } = useLocalSearchParams<{ id?: string }>(); return <AdminGameForm id={Array.isArray(id) ? id[0] : id} />; }
