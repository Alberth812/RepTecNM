// /app/(frontend)/(public)/layout.tsx
import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { buttonVariants } from "@/components/ui/button";

/**
 * Layout para páginas públicas (login, registro, etc.).
 * Solo renderiza el contenido si NO hay sesión activa.
 * Si hay sesión, muestra un estado de "No autorizado" con accesos
 * al panel correspondiente según el rol.
 */
const ROLE_HOME: Record<string, string> = {
  ADMINISTRADOR: "/admin/inicio",
  AFILIADO: "/afiliado/inicio",
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  // Sin sesión: render normal del contenido público
  if (!session) {
    return <>{children}</>;
  }

  // Con sesión: bloqueamos el acceso a rutas públicas
  const role = session.user?.role as string | undefined;
  const homeHref = role ? ROLE_HOME[role] : undefined;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">No autorizado</h1>
        <p className="max-w-md text-muted-foreground">
          Ya tienes una sesión activa. No puedes acceder a esta página mientras
          estés autenticado.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {homeHref && (
          <Link href={homeHref} className={buttonVariants()}>
            Ir a mi panel
          </Link>
        )}
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
