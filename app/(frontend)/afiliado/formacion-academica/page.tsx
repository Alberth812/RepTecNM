// app/afiliado/formacion-academica/page.tsx
// (ajusta la ruta a tu estructura de carpetas)
//
// Server Component: consulta la formación académica ya capturada (si la hay)
// directamente en la BD y se la pasa a <FormacionAcademicaForm /> como
// `defaultValues`. No hace falta lógica extra para el caso "sin datos": si
// los arreglos llegan vacíos, `FormacionAcademicaForm` ya arranca cada
// sección con una fila en blanco (ver `buildDefaultValues` en el componente).

import { FormacionAcademicaForm } from "@/components/formacion-academica/formacion-academica-form";
import { requireAfiliado } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import type { FormacionAcademica } from "@/lib/validation/formacion-academica";
import Link from "next/link";

// Excluye columnas que no forman parte del esquema Zod del formulario
// (afiliadoId, createdAt, updatedAt) para que el shape calce exacto con
// `FormacionAcademica` sin necesidad de mapear campo por campo.
const OMITIR_METADATOS = {
  afiliadoId: false,
  createdAt: false,
  updatedAt: false,
} as const;

export default async function FormacionAcademicaPage() {
  const { afiliado } = await requireAfiliado();

  const [lics, posg, estancias, catalogoInstituciones] = await Promise.all([
    db.query.licenciaturas.findMany({
      where: { afiliadoId: afiliado.userId },
      columns: OMITIR_METADATOS,
    }),
    db.query.posgrados.findMany({
      where: { afiliadoId: afiliado.userId },
      columns: OMITIR_METADATOS,
    }),
    db.query.estanciasPosdoctorales.findMany({
      where: { afiliadoId: afiliado.userId },
      columns: OMITIR_METADATOS,
    }),
    db.query.instituciones.findMany({
      orderBy: (instituciones, { asc }) => asc(instituciones.nombre),
    }),
  ]);

  // Si el afiliado nunca capturó nada, `lics`/`posg`/`estancias` llegan como
  // arreglos vacíos
  // `FormacionAcademicaForm` espera para arrancar en blanco.
  const institucionesOptions = catalogoInstituciones.map((institucion) => ({
    label: institucion.nombre,
    value: institucion.id,
  }));

  const defaultValues: Partial<FormacionAcademica> = {
    licenciaturas: lics,
    posgrados: posg,
    estanciasPosdoctorales: estancias,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Formación académica</h1>
        <p className="text-sm text-muted-foreground">
          {lics.length || posg.length || estancias.length
            ? "Revisa y actualiza tu información."
            : "Aún no has capturado tu formación académica."}
        </p>
      </div>

      <FormacionAcademicaForm
        instituciones={institucionesOptions}
        defaultValues={defaultValues}
      />
      <div>
        <p>
          <Link href={"/afiliado/inicio"}>Regresar a inicio</Link>
        </p>
      </div>
    </div>
  );
}
