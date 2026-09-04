import { Stack } from "expo-router";
import AdminGuard from "../../src/components/auth/AdminGuard";
export default function AdminLayout() { return <AdminGuard><Stack screenOptions={{ headerShown: false, animation: "fade", animationDuration: 180 }} /></AdminGuard>; }
