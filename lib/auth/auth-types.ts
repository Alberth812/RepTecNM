export type MembershipStatus =
  | "NO_INICIADA"
  | "PENDIENTE_APROBACION"
  | "REQUIERE_CORRECCION"
  | "RECHAZADO"
  | "ACTIVO"
  | "INACTIVO"
  | "SUSPENDIDO"
  | "BAJA";

export type AdminSubtype = "GENERAL" | "CONTENIDO";

// Estados de afiliación que deben continuar el flujo de registro.
export const REGISTRATION_STATUSES = [
  "NO_INICIADA",
  "PENDIENTE_APROBACION",
  "REQUIERE_CORRECCION",
] as const satisfies readonly MembershipStatus[];
