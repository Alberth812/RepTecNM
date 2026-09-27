// components/admin/administradores-table.tsx

"use client";

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
import type { AdminListItem } from "@/lib/admins/types";

type SortableField = "nombreCompleto" | "email";

interface AdministradoresTableProps {
  admins: AdminListItem[];
  isLoading: boolean;
  sortBy: SortableField;
  sortOrder: "asc" | "desc";
  onSortChange: (field: SortableField) => void;
  onRequestStatusChange: (admin: AdminListItem) => void;
}

const COLUMN_LABELS: Record<SortableField, string> = {
  nombreCompleto: "Nombre completo",
  email: "Correo electrónico",
};

function SortButton({
  field,
  label,
  sortBy,
  sortOrder,
  onSortChange,
}: {
  field: SortableField;
  label: string;
  sortBy: SortableField;
  sortOrder: "asc" | "desc";
  onSortChange: (field: SortableField) => void;
}) {
  const isActive = sortBy === field;
  const Icon = !isActive
    ? ArrowUpDown
    : sortOrder === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 gap-1.5"
      onClick={() => onSortChange(field)}
    >
      {label}
      <Icon className="size-3.5" />
    </Button>
  );
}

export function AdministradoresTable({
  admins,
  isLoading,
  sortBy,
  sortOrder,
  onSortChange,
  onRequestStatusChange,
}: AdministradoresTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton
                field="nombreCompleto"
                label={COLUMN_LABELS.nombreCompleto}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
            </TableHead>
            <TableHead>Subtipo</TableHead>
            <TableHead>
              <SortButton
                field="email"
                label={COLUMN_LABELS.email}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
            </TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                Cargando administradores...
              </TableCell>
            </TableRow>
          ) : admins.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                No se encontraron administradores.
              </TableCell>
            </TableRow>
          ) : (
            admins.map((admin) => (
              <TableRow key={admin.userId}>
                <TableCell className="font-medium">
                  {admin.nombreCompleto}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {admin.subtype === "GENERAL" ? "General" : "Contenido"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {admin.email}
                </TableCell>
                <TableCell>
                  <Badge variant={admin.isActive ? "default" : "secondary"}>
                    {admin.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant={admin.isActive ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => onRequestStatusChange(admin)}
                  >
                    {admin.isActive ? "Desactivar" : "Activar"}
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
