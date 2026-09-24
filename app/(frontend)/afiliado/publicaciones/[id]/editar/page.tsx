// app/publicaciones/[id]/editar/page.tsx
"use client";

/**
 * Página "Editar publicación".
 *
 * En Next.js 15+ `params` llega como `Promise<{ id: string }>` incluso en
 * páginas. Como este es un Client Component (necesita `useRouter` para
 * redirigir tras guardar), se desenvuelve con el hook `use()` de React en
 * vez de `await` (los Client Components no pueden ser `async`). Si más
 * adelante no necesitas redirigir aquí, esta página puede volver a ser un
 * Server Component normal con `const { id } = await params`.
 *
 * Valida el `id` como UUID antes de pedir nada: si viene mal formado,
 * activa el `not-found` de la ruta en vez de dejar que falle la petición.
 */

import { use } from "react";
import { notFound, useRouter } from "next/navigation";

import { EditarPublicacionForm } from "@/components/publicaciones/editar-publicacion-form";
import { publicacionIdParamSchema } from "@/lib/validation/publicaciones";

interface EditarPublicacionPageProps {
  params: Promise<{ id: string }>;
}

export default function EditarPublicacionPage({
  params,
}: EditarPublicacionPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const parsedId = publicacionIdParamSchema.safeParse({ id });
  if (!parsedId.success) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar publicación
        </h1>
        <p className="text-sm text-muted-foreground">
          Actualiza los metadatos de tu publicación. El documento PDF no puede
          sustituirse desde aquí.
        </p>
      </div>

      <EditarPublicacionForm
        publicacionId={id}
        onSuccess={() => {
          router.push(`/publicaciones/${id}`);
        }}
      />
    </main>
  );
}
