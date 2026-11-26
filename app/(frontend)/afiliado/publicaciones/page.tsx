// app/afiliado/publicaciones/page.tsx
import type { Metadata } from "next";

import { PublicacionesAfiliadoList } from "@/components/afiliado/publicaciones/publicaciones-afiliado-list";

export const metadata: Metadata = {
  title: "Mis publicaciones",
};

//
export default function MisPublicacionesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Mis publicaciones
        </h1>
        <p className="text-sm text-muted-foreground">
          Consulta, busca y administra tus publicaciones académicas.
        </p>
      </div>

      <PublicacionesAfiliadoList />
    </div>
  );
}
