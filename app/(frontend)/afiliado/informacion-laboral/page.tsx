// @/app/informacion-laboral/page.tsx
//
// Ajusta la ruta del archivo a tu estructura real (p. ej. dentro de un grupo
// de rutas protegidas como app/(afiliado)/perfil/informacion-laboral/page.tsx).
//
// Es un Server Component: obtiene los datos previos directamente de la base
// de datos (sin round-trip HTTP a /api/informacion-laboral) y los pasa como
// `defaultValues` al formulario. El guardado (POST) sí va por el endpoint,
// vía <InformacionLaboralFormClient />.

import type { Metadata } from "next";

import { requireAfiliado } from "@/lib/auth/session";
import { getInformacionLaboralSeccion } from "@/lib/seguimiento/informacion-laboral";
import { InformacionLaboralFormClient } from "@/components/informacion-laboral/informacion-laboral-form-client";
import { mapRowToFormDefaults } from "@/components/informacion-laboral/informacion-laboral-mappers";

export const metadata: Metadata = {
 title: "Información laboral",
};

export default async function InformacionLaboralPage() {
 // Nota: `requireAfiliado()` lanza `ApiError` (forbidden/unauthorized) si la
 // sesión no es válida o no corresponde a un afiliado. En una página (a
 // diferencia de un route handler) ese throw termina en tu `error.tsx` más
 // cercano en vez de convertirse en una respuesta HTTP con status propio.
 // Si prefieres redirigir a /login en vez de mostrar una página de error,
 // considera un guard específico para páginas (p. ej. uno que haga
 // `redirect("/login")` en vez de `throw`).
 const { afiliado } = await requireAfiliado();

 const seccion = await getInformacionLaboralSeccion(afiliado.userId);
 const defaultValues = mapRowToFormDefaults(seccion);

 return (
 <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
 <InformacionLaboralFormClient defaultValues={defaultValues} />
 </div>
 );
}
