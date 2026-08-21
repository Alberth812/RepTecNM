import { redirect } from "next/navigation";
import { getCurrentSession, getAdministradorProfile } from "@/lib/permissions";
import { AppShell } from "@/components/ui/AppShell";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

const links = [
  { key: "home", href: "/home", label: "Inicio" },
  { key: "admin", href: "/admin", label: "Administradores" },
];

export default async function AdminPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in");
  if (session.user.role !== "ADMINISTRADOR") redirect("/home");

  const admin = await getAdministradorProfile(session.user.id);
  if (!admin) redirect("/home");

  return (
    <AppShell activeNav="admin" links={links}>
      <AdminDashboard current={{ id: session.user.id, subtype: admin.subtype, isRoot: admin.isRoot }} />
    </AppShell>
  );
}
