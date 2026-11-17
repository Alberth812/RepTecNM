// Ubicación sugerida: @/lib/components/instituciones/instituciones-page-client.tsx

"use client";

import { useMemo, useState } from "react";

import { useDebouncedValue } from "@/lib/instituciones/hooks/use-debounced-value";
import { useInstitucionesQuery } from "@/lib/instituciones/hooks/use-instituciones";
import { InstitucionDeleteDialog } from "@/components/instituciones/institucion-delete-dialog";
import { InstitucionFormDialog } from "@/components/instituciones/institucion-form-dialog";
import { InstitucionesPagination } from "@/components/instituciones/instituciones-pagination";
import { InstitucionesTable } from "@/components/instituciones/instituciones-table";
import { InstitucionesToolbar } from "@/components/instituciones/instituciones-toolbar";
import type { Institucion } from "@/lib/instituciones/types";

const PAGE_SIZE = 10;

type EstadoFilter = "TODOS" | "ACTIVO" | "INACTIVO";

type FormDialogState =
 | { mode: "create" }
 | { mode: "edit"; institucion: Institucion }
 | null;

export function InstitucionesPageClient() {
 const [page, setPage] = useState(1);
 const [search, setSearch] = useState("");
 const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>("TODOS");
 const debouncedSearch = useDebouncedValue(search, 350);

 const [formDialogState, setFormDialogState] = useState<FormDialogState>(null);
 const [deleteTarget, setDeleteTarget] = useState<Institucion | null>(null);
 const [nonDeletableIds, setNonDeletableIds] = useState<Set<string>>(
 new Set(),
 );

 const queryParams = useMemo(
 () => ({
 page,
 pageSize: PAGE_SIZE,
 nombre: debouncedSearch.trim() || undefined,
 estado: estadoFilter === "TODOS" ? undefined : estadoFilter,
 }),
 [page, debouncedSearch, estadoFilter],
 );

 const institucionesQuery = useInstitucionesQuery(queryParams);

 function handleSearchChange(value: string) {
 setSearch(value);
 setPage(1);
 }

 function handleEstadoFilterChange(value: EstadoFilter) {
 setEstadoFilter(value);
 setPage(1);
 }

 function markAsNonDeletable(id: string) {
 setNonDeletableIds((prev) => new Set(prev).add(id));
 }

 return (
 <div className="flex flex-col gap-4">
 <InstitucionesToolbar
 search={search}
 onSearchChange={handleSearchChange}
 estadoFilter={estadoFilter}
 onEstadoFilterChange={handleEstadoFilterChange}
 onAddNew={() => setFormDialogState({ mode: "create" })}
 />

 <InstitucionesTable
 query={institucionesQuery}
 hasActiveFilters={Boolean(debouncedSearch) || estadoFilter !== "TODOS"}
 nonDeletableIds={nonDeletableIds}
 onEdit={(institucion) =>
 setFormDialogState({ mode: "edit", institucion })
 }
 onDelete={(institucion) => setDeleteTarget(institucion)}
 />

 {institucionesQuery.data &&
 institucionesQuery.data.pagination.totalPages > 1 && (
 <InstitucionesPagination
 pagination={institucionesQuery.data.pagination}
 onPageChange={setPage}
 />
 )}

 <InstitucionFormDialog
 state={formDialogState}
 onOpenChange={(open) => {
 if (!open) setFormDialogState(null);
 }}
 />

 <InstitucionDeleteDialog
 institucion={deleteTarget}
 onOpenChange={(open) => {
 if (!open) setDeleteTarget(null);
 }}
 onConflict={markAsNonDeletable}
 />
 </div>
 );
}
