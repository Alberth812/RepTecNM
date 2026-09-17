// app/afiliado/evaluacion-programa-estudios/page.tsx

import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { requireAfiliado } from "@/lib/auth/session";
import { EvaluacionProgramaEstudiosForm } from "@/components/evaluacion-programa/evaluacion-programa-estudios-form";
import { evaluacionProgramaEstudios } from "@/lib/db/schema";

export default async function EvaluacionProgramaEstudiosPage() {
  const { afiliado } = await requireAfiliado();

  const evaluacion = await db.query.evaluacionProgramaEstudios.findFirst({
    where: eq(evaluacionProgramaEstudios.userId, afiliado.userId),
  });

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="mb-6 text-2xl font-semibold">
        Evaluación del programa de estudios cursado
      </h1>

      <EvaluacionProgramaEstudiosForm initialData={evaluacion ?? null} />
    </div>
  );
}
