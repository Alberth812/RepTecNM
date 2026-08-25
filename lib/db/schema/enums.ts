import { pgEnum } from "drizzle-orm/pg-core";

export const accountRoleEnum = pgEnum("account_role", [
  "AFILIADO",
  "ADMINISTRADOR",
]);

export const adminSubtypeEnum = pgEnum("admin_subtype", [
  "GENERAL",
  "CONTENIDO",
]);

export const tipoSanguineoEnum = pgEnum("tipo_sanguineo", [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
]);

export const membershipStatusEnum = pgEnum("membership_status", [
  "NO_INICIADA",
  "PENDIENTE_APROBACION",
  "REQUIERE_CORRECCION",
  "RECHAZADO",
  "ACTIVO",
  "INACTIVO",
  "SUSPENDIDO",
  "BAJA",
]);

// db/schema/enums.ts (agregar)
export const revisionDecisionEnum = pgEnum("revision_decision", [
  "APROBADO",
  "REQUIERE_CORRECCION",
  "RECHAZADO",
]);
