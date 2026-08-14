import { Stack } from "expo-router";
import AdminGuard from "../../src/components/admin/shared/AdminGuard";
export default function AdminLayout() { return <AdminGuard><Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} /></AdminGuard>; }
