import { redirect } from "next/navigation";
import { getCurrentSession, getAfiliadoProfile, getAdministradorProfile } from "@/lib/permissions";
import { AppShell } from "@/components/ui/AppShell";

const MEMBERSHIP_STATUS_LABEL: Record<string, string> = {
  NO_INICIADA: "No iniciada",
  PENDIENTE_APROBACION: "Pendiente de aprobación",
  REQUIERE_CORRECCION: "Requiere corrección",
  RECHAZADO: "Rechazado",
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  SUSPENDIDO: "Suspendido",
  BAJA: "Baja",
};

const ADMIN_SUBTYPE_LABEL: Record<string, string> = {
  GENERAL: "General",
  CONTENIDO: "Contenido",
};

export default async function HomePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in");

  const isAdmin = session.user.role === "ADMINISTRADOR";

  const links = isAdmin
    ? [
        { key: "home", href: "/home", label: "Inicio" },
        { key: "admin", href: "/admin", label: "Administradores" },
      ]
    : [
        { key: "home", href: "/home", label: "Inicio" },
        { key: "account", href: "/account", label: "Mi cuenta" },
      ];

  return (
    <AppShell activeNav="home" links={links}>
      <div className="rounded-2xl border border-sand-200 bg-white p-8 shadow-sm">
        {isAdmin ? (
          <AdminWelcome accountId={session.user.id} email={session.user.email} />
        ) : (
          <AfiliadoWelcome accountId={session.user.id} email={session.user.email} />
        )}
      </div>
    </AppShell>
  );
}

async function AfiliadoWelcome({ accountId, email }: { accountId: string; email: string }) {
  const afiliado = await getAfiliadoProfile(accountId);
  const status = afiliado?.membershipStatus ?? "NO_INICIADA";

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Bienvenido, {email}</h1>
      <p className="mt-3 text-brand-700">
        Tu estado de afiliación es{" "}
        <span className="font-semibold text-brand-900">{MEMBERSHIP_STATUS_LABEL[status] ?? status}</span>.
      </p>
    </div>
  );
}

async function AdminWelcome({ accountId, email }: { accountId: string; email: string }) {
  const admin = await getAdministradorProfile(accountId);
  const subtype = admin?.subtype ?? "";

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Bienvenido, {email}</h1>
      <p className="mt-3 text-brand-700">
        Eres administrador. Tu tipo es{" "}
        <span className="font-semibold text-brand-900">{ADMIN_SUBTYPE_LABEL[subtype] ?? subtype}</span>
        {admin?.isRoot ? <span className="ml-2 rounded-full bg-gold-400/15 px-2.5 py-0.5 text-xs font-semibold text-gold-600">Raíz</span> : null}
        .
      </p>
    </div>
  );
}
