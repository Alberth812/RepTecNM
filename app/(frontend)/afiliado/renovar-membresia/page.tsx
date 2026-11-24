import { RenovacionComponente } from "@/components/renovacion/renovacion-componente";

export const metadata = {
  title: "Renovar membresía",
  description: "Envía tu comprobante de pago para renovar tu membresía.",
};

export default function RenovarMembresiaPage() {
  return (
    <main className="container mx-auto max-w-2xl space-y-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Renovación de membresía
        </h1>
        <p className="text-muted-foreground">
          Envía tu comprobante de pago para solicitar la renovación de tu
          membresía.
        </p>
      </div>

      <RenovacionComponente variant="formulario" />
    </main>
  );
}
