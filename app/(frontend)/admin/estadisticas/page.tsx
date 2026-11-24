// app/admin/estadisticas/page.tsx

import type { Metadata } from "next";

import { AfiliadosDashboard } from "@/components/admin/estadisticas/afiliados-dashboard";

import { requireAdminGeneral } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Estadísticas de afiliados",
  description:
    "Dashboard de estadísticas de la Red de Egresados de Posgrado del TecNM.",
};

export const dynamic = "force-dynamic";

export default async function AfiliadosEstadisticasPage() {
  await requireAdminGeneral();

  return (
    <main className="container mx-auto max-w-screen-2xl px-4 py-6 lg:px-6">
      <AfiliadosDashboard />
    </main>
  );
}
