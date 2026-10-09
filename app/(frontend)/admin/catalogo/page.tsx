import { Suspense } from "react";
import { CatalogoGrid } from "@/components/catalogo/CatalogoGrid";
import { CatalogoFiltros } from "@/components/catalogo/CatalogoFiltros";

export default async function CatalogoAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  const url = new URL("/api/catalogo", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  url.search = qs;
  const res = await fetch(url.toString(), { cache: "no-store" });
  const json = await res.json();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-[#004B87] mb-2">Catálogo (Administración)</h1>
      <p className="text-muted-foreground mb-6">Gestión y contacto de perfiles de afiliados.</p>
      <Suspense fallback={<div className="text-muted-foreground mb-8">Cargando filtros...</div>}>
        <CatalogoFiltros facets={json.facets || { areas: [], servicios: [] }} />
      </Suspense>
      <CatalogoGrid afiliados={json.data || []} rolUsuario="admin" />
    </div>
  );
}
