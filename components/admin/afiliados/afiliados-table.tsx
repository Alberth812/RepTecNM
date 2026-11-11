// @/components/admin/afiliados/afiliados-table.tsx
"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AfiliadoListItem } from "@/lib/api/client/afiliados";
import type {
  SortByAfiliados,
  SortOrderAfiliados,
} from "@/lib/validations/afiliados";

const SORTABLE_COLUMNS: { key: SortByAfiliados; label: string }[] = [
  { key: "nombres", label: "Nombres" },
  { key: "apellidos", label: "Apellidos" },
  { key: "folio", label: "Folio" },
];

const STATUS_VARIANT: Record<
  AfiliadoListItem["membershipStatus"],
  "default" | "secondary" | "destructive"
> = {
  ACTIVO: "default",
  INACTIVO: "secondary",
  SUSPENDIDO: "destructive",
};

const STATUS_LABEL: Record<AfiliadoListItem["membershipStatus"], string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  SUSPENDIDO: "Suspendido",
};

interface AfiliadosTableProps {
  items: AfiliadoListItem[];
  isLoading: boolean;
  sortBy: SortByAfiliados;
  sortOrder: SortOrderAfiliados;
  onSortChange: (sortBy: SortByAfiliados) => void;
}

export function AfiliadosTable({
  items,
  isLoading,
  sortBy,
  sortOrder,
  onSortChange,
}: AfiliadosTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {SORTABLE_COLUMNS.map((column) => (
              <TableHead key={column.key}>
                <button
                  type="button"
                  onClick={() => onSortChange(column.key)}
                  className="flex items-center gap-1 font-medium hover:text-foreground"
                >
                  {column.label}
                  <SortIcon active={sortBy === column.key} order={sortOrder} />
                </button>
              </TableHead>
            ))}
            <TableHead>Estado</TableHead>
            <TableHead>Estado de residencia</TableHead>
            <TableHead>Ciudad de residencia</TableHead>
            <TableHead>Correo electrónico</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-24 text-center text-muted-foreground"
              >
                Cargando afiliados…
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-24 text-center text-muted-foreground"
              >
                No se encontraron afiliados con los filtros actuales.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.userId}>
                <TableCell className="font-medium">
                  {item.nombres ?? "—"}
                </TableCell>
                <TableCell className="font-medium">
                  {item.apellidos ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.folio ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[item.membershipStatus]}>
                    {STATUS_LABEL[item.membershipStatus]}
                  </Badge>
                </TableCell>
                <TableCell>{item.estadoResidencia ?? "—"}</TableCell>
                <TableCell>{item.ciudadResidencia ?? "—"}</TableCell>
                <TableCell>{item.correoElectronico ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Button /*asChild*/ variant="outline" size="sm">
                    <Link href={`/admin/afiliados/${item.userId}`}>
                      Ver detalles
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function SortIcon({
  active,
  order,
}: {
  active: boolean;
  order: SortOrderAfiliados;
}) {
  if (!active) {
    return (
      <ArrowUpDown
        className={cn("size-3.5 text-muted-foreground")}
        aria-hidden="true"
      />
    );
  }
  return order === "asc" ? (
    <ArrowUp className="size-3.5" aria-hidden="true" />
  ) : (
    <ArrowDown className="size-3.5" aria-hidden="true" />
  );
}
