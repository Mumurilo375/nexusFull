import AdminControl from "../../src/pages/AdminControl";
import AdminGuard from "../../src/components/admin/shared/AdminGuard";

export default function AdminTab() {
  return (
    <AdminGuard>
      <AdminControl />
    </AdminGuard>
  );
}
