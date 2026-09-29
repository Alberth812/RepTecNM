// Ubicación sugerida: @/lib/components/instituciones/instituciones-pagination.tsx

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/lib/instituciones/types";

interface InstitucionesPaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function InstitucionesPagination({
  pagination,
  onPageChange,
}: InstitucionesPaginationProps) {
  const { page, totalPages, total } = pagination;

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Página {page} de {totalPages} · {total} institucion
        {total === 1 ? "" : "es"}
      </span>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
