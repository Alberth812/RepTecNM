const formateadorFecha = new Intl.DateTimeFormat("es", { dateStyle: "medium" });
const formateadorFechaHora = new Intl.DateTimeFormat("es", {
 dateStyle: "medium",
 timeStyle: "short",
});

function toDate(value: string | Date): Date {
 return value instanceof Date ? value : new Date(value);
}

export function formatFecha(value: string | Date): string {
 const date = toDate(value);
 return Number.isNaN(date.getTime()) ? "—" : formateadorFecha.format(date);
}

export function formatFechaHora(value: string | Date): string {
 const date = toDate(value);
 return Number.isNaN(date.getTime()) ? "—" : formateadorFechaHora.format(date);
}

const UNIDADES_TAMANO = ["B", "KB", "MB", "GB"] as const;

/** Formatea un tamaño en bytes como una cadena legible (ej. "2.4 MB"). */
export function formatTamanoArchivo(bytes: number): string {
 if (!Number.isFinite(bytes) || bytes < 0) return "—";
 if (bytes === 0) return "0 B";

 const exponente = Math.min(
 Math.floor(Math.log(bytes) / Math.log(1024)),
 UNIDADES_TAMANO.length - 1,
 );
 const valor = bytes / 1024 ** exponente;

 return `${valor.toFixed(exponente === 0 ? 0 : 1)} ${UNIDADES_TAMANO[exponente]}`;
}
