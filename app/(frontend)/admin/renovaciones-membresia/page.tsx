import { RenovacionesTable } from "@/components/admin/renovaciones-table";

export const metadata = {
  title: "Administrar renovaciones",
  description: "Gestión de solicitudes de renovación de membresía.",
};

export default function RenovacionesPage() {
  return (
    <main className="container mx-auto space-y-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Renovaciones de membresía
        </h1>
        <p className="text-muted-foreground">
          Consulta, revisa y administra las solicitudes de renovación de los
          afiliados.
        </p>
      </div>

      <RenovacionesTable />
    </main>
  );
}
