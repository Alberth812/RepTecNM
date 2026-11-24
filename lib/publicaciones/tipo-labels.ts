import type { TipoPublicacionType } from "@/lib/validation/publicaciones";
import { TipoPublicacion } from "@/lib/validation/publicaciones";

/** Etiquetas legibles para cada tipo de publicación soportado por el sistema. */
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

/** Etiqueta a mostrar para un tipo de publicación, respetando `tipoOtro` cuando aplica. */
export function getTipoPublicacionLabel(
  tipo: TipoPublicacionType,
  tipoOtro?: string | null,
): string {
  if (tipo === TipoPublicacion.OTRO && tipoOtro) {
    return tipoOtro;
  }
  return TIPO_PUBLICACION_LABELS[tipo];
}

/** Opciones listas para usar en un `<Select>` de filtro. */
export const TIPO_PUBLICACION_OPTIONS: Array<{
  value: TipoPublicacionType | "__todos__";
  label: string;
}> = [
  { value: "__todos__", label: "Todos los tipos" },
  ...(Object.values(TipoPublicacion) as TipoPublicacionType[]).map((value) => ({
    value,
    label: TIPO_PUBLICACION_LABELS[value],
  })),
];
