// app/publicaciones/nueva/page.tsx
"use client";

/**
 * Página "Nueva publicación".
 *
 * Es un Client Component (no puede exportar `metadata`) porque necesita
 * `useRouter` para redirigir tras crear la publicación. Si quieres un
 * `<title>` propio para esta ruta, divide en:
 * - page.tsx (Server Component, exporta `metadata`)
 * - un componente hijo "use client" que renderice esto mismo.
 *
 * Ajusta la ruta de redirección (`/publicaciones/${publicacion.id}`) a la
 * que uses realmente para el detalle de una publicación.
 */

import { useRouter } from "next/navigation";

import { CrearPublicacionForm } from "@/components/publicaciones/crear-publicacion-form";

export default function NuevaPublicacionPage() {
 const router = useRouter();

 return (
 <main className="mx-auto max-w-3xl px-4 py-10">
 <div className="mb-8 space-y-1">
 <h1 className="text-2xl font-semibold tracking-tight">
 Nueva publicación
 </h1>
 <p className="text-sm text-muted-foreground">
 Completa los metadatos y adjunta el documento PDF (máximo 5 MB).
 </p>
 </div>

 <CrearPublicacionForm
 onSuccess={(publicacion) => {
 router.push(`/publicaciones/${publicacion.id}`);
 }}
 />
 </main>
 );
}
