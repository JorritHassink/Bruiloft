import { isAdminAuthenticated } from "@/lib/admin-auth";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}
