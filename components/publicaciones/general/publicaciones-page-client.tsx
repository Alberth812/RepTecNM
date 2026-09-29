"use client";

import { useCallback, useState } from "react";

import type { BuscarPublicacionesQuery } from "@/lib/validation/publicaciones-busqueda";
import { DEFAULT_BUSQUEDA_PAGE_SIZE } from "@/lib/validation/publicaciones-busqueda";
import { PublicacionesPagination } from "@/components/publicaciones/general/publicaciones-pagination";
import { PublicacionesResultados } from "@/components/publicaciones/general/publicaciones-resultados";
import { PublicacionesSearchForm } from "@/components/publicaciones/general/publicaciones-search-form";
import { usePublicacionesQuery } from "@/lib/publicaciones/hooks/use-publicaciones-query";

const CONSULTA_INICIAL: BuscarPublicacionesQuery = {
  page: 1,
  pageSize: DEFAULT_BUSQUEDA_PAGE_SIZE,
};

export function PublicacionesPageClient() {
  // Única fuente de verdad de la consulta EFECTIVAMENTE aplicada (la que se
  // envía a la API). Los campos del formulario viven en estado local aparte
  // (dentro de PublicacionesSearchForm) y solo se sincronizan aquí al pulsar
  // "Buscar" o "Limpiar".
  const [appliedQuery, setAppliedQuery] =
    useState<BuscarPublicacionesQuery>(CONSULTA_INICIAL);

  const publicacionesQuery = usePublicacionesQuery(appliedQuery);

  const handleBuscar = useCallback(
    (filtros: Omit<BuscarPublicacionesQuery, "page" | "pageSize">) => {
      // Nueva búsqueda: siempre vuelve a la página 1.
      setAppliedQuery((prev) => ({
        ...filtros,
        page: 1,
        pageSize: prev.pageSize,
      }));
    },
    [],
  );

  const handleLimpiar = useCallback(() => {
    // Limpia todos los filtros y vuelve a la página 1.
    setAppliedQuery((prev) => ({ page: 1, pageSize: prev.pageSize }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    // Conserva todos los criterios actuales; solo cambia `page`.
    setAppliedQuery((prev) => ({ ...prev, page }));
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Publicaciones académicas
        </h1>
        <p className="text-sm text-muted-foreground">
          Explora, busca y filtra las publicaciones académicas registradas.
        </p>
      </div>

      <PublicacionesSearchForm
        onBuscar={handleBuscar}
        onLimpiar={handleLimpiar}
        disabled={publicacionesQuery.isFetching}
      />

      {publicacionesQuery.isSuccess && (
        <p className="text-sm text-muted-foreground">
          {publicacionesQuery.data.total}{" "}
          {publicacionesQuery.data.total === 1
            ? "publicación encontrada"
            : "publicaciones encontradas"}
        </p>
      )}

      <PublicacionesResultados
        query={publicacionesQuery}
        onLimpiarFiltros={handleLimpiar}
      />

      {publicacionesQuery.isSuccess && (
        <PublicacionesPagination
          page={publicacionesQuery.data.page}
          totalPages={publicacionesQuery.data.totalPages}
          onPageChange={handlePageChange}
          disabled={publicacionesQuery.isFetching}
        />
      )}
    </div>
  );
}
