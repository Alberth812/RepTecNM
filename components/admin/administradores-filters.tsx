// components/admin/administradores-filters.tsx

"use client";

import { Input } from "@/components/ui/input";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { ADMIN_SUBTYPES } from "@/lib/constants";
import type { AdminSubtype } from "@/lib/admins/types";

const SUBTYPE_LABELS: Record<AdminSubtype, string> = {
 GENERAL: "General",
 CONTENIDO: "Contenido",
};

// Valor centinela para representar "sin filtro" en los <Select>, que no
// aceptan value="" como opción seleccionable.
const ALL_VALUE = "__all__";

interface AdministradoresFiltersProps {
 search: string;
 onSearchChange: (value: string) => void;
 subtype: AdminSubtype | undefined;
 onSubtypeChange: (value: AdminSubtype | undefined) => void;
 isActive: boolean | undefined;
 onIsActiveChange: (value: boolean | undefined) => void;
}

export function AdministradoresFilters({
 search,
 onSearchChange,
 subtype,
 onSubtypeChange,
 isActive,
 onIsActiveChange,
}: AdministradoresFiltersProps) {
 return (
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
 <Input
 placeholder="Buscar por nombre o correo..."
 value={search}
 onChange={(event) => onSearchChange(event.target.value)}
 className="sm:max-w-xs"
 aria-label="Buscar administradores"
 />

 <Select
 value={subtype ?? ALL_VALUE}
 onValueChange={(value) =>
 onSubtypeChange(
 value === ALL_VALUE ? undefined : (value as AdminSubtype),
 )
 }
 >
 <SelectTrigger className="sm:w-44" aria-label="Filtrar por subtipo">
 <SelectValue placeholder="Subtipo" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value={ALL_VALUE}>Todos los subtipos</SelectItem>
 {Object.values(ADMIN_SUBTYPES).map((value) => (
 <SelectItem key={value} value={value}>
 {SUBTYPE_LABELS[value as AdminSubtype]}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Select
 value={isActive === undefined ? ALL_VALUE : String(isActive)}
 onValueChange={(value) =>
 onIsActiveChange(value === ALL_VALUE ? undefined : value === "true")
 }
 >
 <SelectTrigger className="sm:w-44" aria-label="Filtrar por estado">
 <SelectValue placeholder="Estado" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value={ALL_VALUE}>Todos los estados</SelectItem>
 <SelectItem value="true">Activos</SelectItem>
 <SelectItem value="false">Inactivos</SelectItem>
 </SelectContent>
 </Select>
 </div>
 );
}
