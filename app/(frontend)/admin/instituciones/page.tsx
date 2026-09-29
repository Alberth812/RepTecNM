// Ubicación sugerida: src/app/instituciones/page.tsx (ajusta el segmento de ruta si usas un grupo, p.ej. (admin)/instituciones/page.tsx)

import { redirect } from "next/navigation";

import { requireAdminGeneral } from "@/lib/auth/session";
import { InstitucionesPageClient } from "@/components/instituciones/instituciones-page-client";

export const metadata = {
  title: "Instituciones",
};

// Server Component: la autorización real vuelve a comprobarse en cada
// endpoint de la API, pero validamos aquí también para no renderizar
// la pantalla completa a un usuario sin permisos.
export default async function InstitucionesPage() {
  try {
    await requireAdminGeneral();
  } catch {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Instituciones</h1>
        <p className="text-sm text-muted-foreground">
          Administra las instituciones registradas en el sistema.
        </p>
      </div>

      <InstitucionesPageClient />
    </div>
  );
}
