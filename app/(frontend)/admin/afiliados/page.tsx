// @/app/admin/afiliados/page.tsx
"use client";

import { useState } from "react";
import {
  AfiliadosFilters,
  type AfiliadosFiltersValue,
} from "@/components/admin/afiliados/afiliados-filters";
import { AfiliadosTable } from "@/components/admin/afiliados/afiliados-table";
import { AfiliadosPagination } from "@/components/admin/afiliados/afiliados-pagination";
import { useAfiliadosQuery } from "@/lib/hooks/use-afiliados";
import type {
  SortByAfiliados,
  SortOrderAfiliados,
} from "@/lib/validations/afiliados";

const PAGE_SIZE = 25;

export default function AfiliadosPage() {
  const [filters, setFilters] = useState<AfiliadosFiltersValue>({ search: "" });
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortByAfiliados>("nombres");
  const [sortOrder, setSortOrder] = useState<SortOrderAfiliados>("asc");

  const { data, isLoading, isFetching } = useAfiliadosQuery({
    page,
    pageSize: PAGE_SIZE,
    search: filters.search || undefined,
    estadoResidencia: filters.estadoResidencia,
    ciudadResidencia: filters.ciudadResidencia,
    membershipStatus: filters.membershipStatus,
    sortBy,
    sortOrder,
  });

  function handleFiltersChange(next: AfiliadosFiltersValue) {
    setFilters(next);
    setPage(1);
  }

  function handleSortChange(nextSortBy: SortByAfiliados) {
    if (nextSortBy === sortBy) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(nextSortBy);
      setSortOrder("asc");
    }
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Afiliados</h1>
        <p className="text-sm text-muted-foreground">
          Consulta y administra a los afiliados activos, inactivos y
          suspendidos.
        </p>
      </div>

      <AfiliadosFilters value={filters} onChange={handleFiltersChange} />

      <div
        className={
          isFetching && !isLoading ? "opacity-60 transition-opacity" : undefined
        }
      >
        <AfiliadosTable
          items={data?.items ?? []}
          isLoading={isLoading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      </div>

      {data && (
        <AfiliadosPagination
          pagination={data.pagination}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
