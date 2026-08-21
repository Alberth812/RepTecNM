import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/permissions";
import { AppShell } from "@/components/ui/AppShell";
import { ChangeEmailForm } from "@/components/account/ChangeEmailForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";

const links = [
  { key: "home", href: "/home", label: "Inicio" },
  { key: "account", href: "/account", label: "Mi cuenta" },
];

export default async function AccountPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in");
  // RF-AUTH-012 describe este flujo específicamente para afiliados.
  if (session.user.role !== "AFILIADO") redirect("/home");

  return (
    <AppShell activeNav="account" links={links}>
      <div className="flex flex-col gap-8">
        <section className="rounded-2xl border border-sand-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold text-brand-900">Correo de inicio de sesión</h2>
          <p className="mt-1 text-sm text-brand-500">
            Cambiar tu correo requiere confirmar tu contraseña actual y un código enviado al correo nuevo.
          </p>
          <div className="mt-6">
            <ChangeEmailForm currentEmail={session.user.email} />
          </div>
        </section>

        <section className="rounded-2xl border border-sand-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold text-brand-900">Contraseña</h2>
          <p className="mt-1 text-sm text-brand-500">Actualiza tu contraseña de acceso.</p>
          <div className="mt-6">
            <ChangePasswordForm />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
