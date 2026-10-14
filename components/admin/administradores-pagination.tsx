// components/admin/administradores-pagination.tsx

"use client";

import { Button } from "@/components/ui/button";
import type { AdminListPagination } from "@/lib/admins/types";

interface AdministradoresPaginationProps {
 pagination: AdminListPagination;
 onPageChange: (page: number) => void;
}

export function AdministradoresPagination({
 pagination,
 onPageChange,
}: AdministradoresPaginationProps) {
 const { page, totalPages, total } = pagination;

 return (
 <div className="flex items-center justify-between">
 <p className="text-sm text-muted-foreground">
 {total} administrador{total === 1 ? "" : "es"} en total
 </p>
 <div className="flex items-center gap-2">
 <span className="text-sm text-muted-foreground">
 Página {page} de {totalPages}
 </span>
 <Button
 type="button"
 variant="outline"
 size="sm"
 disabled={page <= 1}
 onClick={() => onPageChange(page - 1)}
 >
 Anterior
 </Button>
 <Button
 type="button"
 variant="outline"
 size="sm"
 disabled={page >= totalPages}
 onClick={() => onPageChange(page + 1)}
 >
 Siguiente
 </Button>
 </div>
 </div>
 );
}
