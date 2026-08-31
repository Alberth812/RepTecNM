import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, AlertTriangle } from "lucide-react";
import { DashboardCharts } from "@/components/admin/dashboard-charts";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Panel de Administración</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Afiliados Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">1,248</div>
            <p className="text-xs text-muted-foreground">+12% respecto al mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes de Aprobación</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">Requieren revisión del Admin General</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reportes de Documentos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Pendientes de resolver (RF-ADMIN-011)</p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts />
    </div>
  );
}