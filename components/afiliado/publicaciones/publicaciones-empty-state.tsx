// components/afiliado/publicaciones/publicaciones-empty-state.tsx
import { FileSearch } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PublicacionesEmptyStateProps {
 hayFiltro: boolean;
 onLimpiarFiltros: () => void;
}

export function PublicacionesEmptyState({
 hayFiltro,
 onLimpiarFiltros,
}: PublicacionesEmptyStateProps) {
 return (
 <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
 <FileSearch className="h-10 w-10 text-muted-foreground" />
 <div className="space-y-1">
 <p className="font-medium">No se encontraron publicaciones</p>
 <p className="text-sm text-muted-foreground">
 {hayFiltro
 ? "Ninguna publicación coincide con tu búsqueda."
 : "Todavía no has registrado ninguna publicación."}
 </p>
 </div>
 {hayFiltro && (
 <Button variant="outline" size="sm" onClick={onLimpiarFiltros}>
 Limpiar filtros
 </Button>
 )}
 </div>
 );
}
