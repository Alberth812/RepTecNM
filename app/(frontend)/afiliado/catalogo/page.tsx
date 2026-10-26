import { Suspense } from "react";
import { CatalogoGrid } from "@/components/catalogo/CatalogoGrid";
import { CatalogoFiltros } from "@/components/catalogo/CatalogoFiltros";

export default async function CatalogoAfiliadoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  
  //  CORRECCIÓN: Usar 127.0.0.1 en lugar de localhost evita problemas de resolución IPv6 en Docker
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
  const url = new URL("/api/catalogo", baseUrl);
  url.search = qs;

  let json = { data: [], facets: { areas: [], servicios: [] } };

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    json = await res.json();
  } catch (error) {
    console.error(" Error al hacer fetch a /api/catalogo:", error);
    console.error(" URL intentada:", url.toString());
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-[#004B87] mb-2">Catálogo de Afiliados</h1>
      <p className="text-muted-foreground mb-6">
        Conecta con otros egresados de posgrado del TecNM.
      </p>

      <Suspense fallback={<div className="text-muted-foreground mb-8">Cargando filtros...</div>}>
        <CatalogoFiltros facets={json.facets || { areas: [], servicios: [] }} />
      </Suspense>
      
      <CatalogoGrid afiliados={json.data || []} rolUsuario="afiliado" />
    </div>
  );
}