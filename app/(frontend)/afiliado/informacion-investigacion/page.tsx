// app/afiliados/investigacion/page.tsx

import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { requireAfiliado } from "@/lib/auth/session";
import { afiliadosInvestigacion } from "@/lib/db/schema/afiliados-investigacion";
import { AfiliadoInvestigacionForm } from "@/components/informacion-investigacion/afiliado-investigacion-form";

// Datos propios del afiliado autenticado: no tiene sentido cachear/generar
// esta página estáticamente.
export const dynamic = "force-dynamic";

export default async function InvestigacionPage() {
  const { afiliado } = await requireAfiliado();

  const [registro] = await db
    .select()
    .from(afiliadosInvestigacion)
    .where(eq(afiliadosInvestigacion.userId, afiliado.userId))
    .limit(1);

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Investigación</h1>

        <p className="text-sm text-muted-foreground">
          Información sobre tu producción académica, tu situación ante el SNI,
          redes temáticas y reconocimientos.
        </p>
      </div>

      <AfiliadoInvestigacionForm initialData={registro ?? null} />
    </div>
  );
}
