import { AfiliadosDashboard } from "@/components/admin/estadisticas/afiliados-dashboard";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Panel de Administración
        </h1>
        <p className="text-sm text-muted-foreground">
          Indicadores reales calculados sobre la base de datos de afiliados y
          proyectos relevantes.
        </p>
      </div>

      <AfiliadosDashboard />
    </div>
  );
}
