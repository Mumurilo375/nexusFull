import AdminDashboard from "../../src/components/admin/dashboard/AdminDashboard";
import AdminGuard from "../../src/components/auth/AdminGuard";

export default function AdminTab() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
