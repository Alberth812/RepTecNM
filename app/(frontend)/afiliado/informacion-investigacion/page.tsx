import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { requireAfiliado } from "@/lib/auth/session";

import { afiliadosInvestigacion } from "@/lib/db/schema/afiliados-investigacion";
import { AfiliadoInvestigacionForm } from "@/components/informacion-investigacion/afiliado-investigacion-form";

export default async function InvestigacionPage() {
  const { afiliado } = await requireAfiliado();

  const [registro] = await db
    .select()
    .from(afiliadosInvestigacion)
    .where(eq(afiliadosInvestigacion.userId, afiliado.userId))
    .limit(1);

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sección 4. Investigación
        </h1>

        <p className="text-sm text-muted-foreground">
          Información relacionada con actividades de investigación, producción
          académica, pertenencia al Sistema Nacional de Investigadoras e
          Investigadores, participación en redes temáticas y reconocimientos
          académicos o profesionales.
        </p>
      </div>

      <AfiliadoInvestigacionForm initialData={registro ?? null} />
    </div>
  );
}
