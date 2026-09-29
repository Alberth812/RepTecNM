// Ubicación sugerida: @/lib/components/instituciones/instituciones-toolbar.tsx

"use client";

import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EstadoFilter = "TODOS" | "ACTIVO" | "INACTIVO";

interface InstitucionesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  estadoFilter: EstadoFilter;
  onEstadoFilterChange: (value: EstadoFilter) => void;
  onAddNew: () => void;
}

export function InstitucionesToolbar({
  search,
  onSearchChange,
  estadoFilter,
  onEstadoFilterChange,
  onAddNew,
}: InstitucionesToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nombre..."
            className="pl-8"
            aria-label="Buscar institución por nombre"
          />
        </div>

        <Select
          value={estadoFilter}
          onValueChange={(value) => onEstadoFilterChange(value as EstadoFilter)}
        >
          <SelectTrigger
            className="w-full sm:w-[180px]"
            aria-label="Filtrar por estado"
          >
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos los estados</SelectItem>
            <SelectItem value="ACTIVO">Activo</SelectItem>
            <SelectItem value="INACTIVO">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onAddNew} className="gap-2">
        <Plus className="h-4 w-4" />
        Añadir nueva
      </Button>
    </div>
  );
}
