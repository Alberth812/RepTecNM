// lib/publicaciones/schemas/tipo-publicacion-labels.ts
import {
 TipoPublicacion,
 type TipoPublicacionType,
} from "@/lib/validation/publicaciones";

export const TIPO_PUBLICACION_LABELS: Record<TipoPublicacionType, string> = {
 [TipoPublicacion.ARTICULO]: "Artículo",
 [TipoPublicacion.TESIS]: "Tesis",
 [TipoPublicacion.LIBRO]: "Libro",
 [TipoPublicacion.MEMORIA_CONGRESO]: "Memoria de congreso",
 [TipoPublicacion.PRESENTACION]: "Presentación",
 [TipoPublicacion.ENSAYO]: "Ensayo",
 [TipoPublicacion.REPORTE_TECNICO]: "Reporte técnico",
 [TipoPublicacion.OTRO]: "Otro",
};

export const TIPO_PUBLICACION_OPTIONS: Array<{
 value: TipoPublicacionType;
 label: string;
}> = Object.entries(TIPO_PUBLICACION_LABELS).map(([value, label]) => ({
 value: value as TipoPublicacionType,
 label,
}));
