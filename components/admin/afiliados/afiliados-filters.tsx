// @/components/admin/afiliados/afiliados-filters.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ESTADOS_MEXICO } from "@/lib/constants/mexico-estados";
import { MEMBERSHIP_STATUS_FILTRABLE } from "@/lib/validations/afiliados";
import type { MembershipStatusFiltrable } from "@/lib/validations/afiliados";

export interface AfiliadosFiltersValue {
  search: string;
  estadoResidencia?: string;
  ciudadResidencia?: string;
  membershipStatus?: MembershipStatusFiltrable;
}

type FilterKey = "estadoResidencia" | "ciudadResidencia" | "membershipStatus";

const FILTER_LABELS: Record<FilterKey, string> = {
  estadoResidencia: "Estado de residencia",
  ciudadResidencia: "Ciudad de residencia",
  membershipStatus: "Estado de membresía",
};

const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatusFiltrable, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  SUSPENDIDO: "Suspendido",
};

interface AfiliadosFiltersProps {
  value: AfiliadosFiltersValue;
  onChange: (value: AfiliadosFiltersValue) => void;
}

function useDebouncedCommit(
  draft: string,
  delay: number,
  onCommit: (value: string) => void,
) {
  useEffect(() => {
    const timer = setTimeout(() => onCommit(draft), delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);
}

function initialActiveKeys(value: AfiliadosFiltersValue): Set<FilterKey> {
  const keys = new Set<FilterKey>();
  if (value.estadoResidencia !== undefined) keys.add("estadoResidencia");
  if (value.ciudadResidencia !== undefined) keys.add("ciudadResidencia");
  if (value.membershipStatus !== undefined) keys.add("membershipStatus");
  return keys;
}

export function AfiliadosFilters({ value, onChange }: AfiliadosFiltersProps) {
  const [searchDraft, setSearchDraft] = useState(value.search);
  const [ciudadDraft, setCiudadDraft] = useState(value.ciudadResidencia ?? "");
  // Qué filtros opcionales están visibles como control, independientemente
  // de si ya tienen un valor aplicado (p. ej. "ciudad" puede estar visible
  // mientras el usuario todavía está escribiendo menos de 3 caracteres).
  const [activeKeys, setActiveKeys] = useState<Set<FilterKey>>(() =>
    initialActiveKeys(value),
  );

  useDebouncedCommit(searchDraft, 300, (committed) => {
    if (committed !== value.search) {
      onChange({ ...value, search: committed });
    }
  });

  useDebouncedCommit(ciudadDraft, 400, (committed) => {
    const trimmed = committed.trim();
    const next =
      trimmed.length >= 3 && trimmed.length <= 50 ? trimmed : undefined;
    if (next !== value.ciudadResidencia) {
      onChange({ ...value, ciudadResidencia: next });
    }
  });

  const activeFilters = Array.from(activeKeys);
  const availableFilters = (Object.keys(FILTER_LABELS) as FilterKey[]).filter(
    (key) => !activeKeys.has(key),
  );

  function addFilter(key: FilterKey) {
    // Solo se vuelve visible el control; no se aplica ningún valor por
    // defecto. El filtro empieza a afectar la consulta hasta que el usuario
    // elige un estado, escribe una ciudad válida o selecciona un estatus.
    setActiveKeys((prev) => new Set(prev).add(key));
  }

  function removeFilter(key: FilterKey) {
    setActiveKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    if (key === "ciudadResidencia") setCiudadDraft("");
    onChange({ ...value, [key]: undefined });
  }

  function clearAll() {
    setSearchDraft("");
    setCiudadDraft("");
    setActiveKeys(new Set());
    onChange({ search: "" });
  }

  const hasAnyFilter = activeFilters.length > 0 || value.search.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Buscar por nombre, apellido, folio o correo…"
            className="pl-8"
            aria-label="Buscar afiliados"
          />
        </div>

        {availableFilters.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" />}
            >
              <Plus className="size-4" />
              Agregar filtro
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
              {availableFilters.map((key) => (
                <DropdownMenuItem key={key} onSelect={() => addFilter(key)}>
                  {FILTER_LABELS[key]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {hasAnyFilter && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-end gap-3">
          {activeKeys.has("estadoResidencia") && (
            <div className="flex items-end gap-1">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">
                  Estado de residencia
                </Label>
                <Select
                  value={value.estadoResidencia}
                  onValueChange={(next) =>
                    onChange({ ...value, estadoResidencia: next ?? "" })
                  }
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_MEXICO.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Quitar filtro de estado de residencia"
                onClick={() => removeFilter("estadoResidencia")}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}

          {activeKeys.has("ciudadResidencia") && (
            <div className="flex items-end gap-1">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">
                  Ciudad de residencia
                </Label>
                <Input
                  value={ciudadDraft}
                  onChange={(e) => setCiudadDraft(e.target.value)}
                  placeholder="Mínimo 3 caracteres"
                  className="w-56"
                  minLength={3}
                  maxLength={50}
                  autoFocus
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Quitar filtro de ciudad de residencia"
                onClick={() => removeFilter("ciudadResidencia")}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}

          {activeKeys.has("membershipStatus") && (
            <div className="flex items-end gap-1">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">
                  Estado de membresía
                </Label>
                <Select
                  value={value.membershipStatus}
                  onValueChange={(next) =>
                    onChange({
                      ...value,
                      membershipStatus: next as MembershipStatusFiltrable,
                    })
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBERSHIP_STATUS_FILTRABLE.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {MEMBERSHIP_STATUS_LABELS[estado]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Quitar filtro de estado de membresía"
                onClick={() => removeFilter("membershipStatus")}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
