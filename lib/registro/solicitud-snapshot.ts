// lib/registro/solicitud-snapshot.ts
import type { RegistroFormOutput } from "./schema";

export type SolicitudDatosSnapshot = Omit<
 RegistroFormOutput,
 "fotografia" | "comprobante_membresia"
>;

/** Quita los `File` validados; esos van a `archivos`, no al JSONB. */
export function toSolicitudSnapshot(
 data: RegistroFormOutput,
): SolicitudDatosSnapshot {
 const { fotografia, comprobante_membresia, ...resto } = data;
 return resto;
}
