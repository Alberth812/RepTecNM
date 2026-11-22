// @/lib/estadisticas/afiliados-dashboard.ts

import { z } from "zod";
import { ESTADOS_MEXICO, GENERO_OPTIONS } from "@/lib/registro/types";

/**
 * Estados de membresía disponibles.
 */
export const MEMBERSHIP_STATUS_VALUES = [
  "NO_INICIADA",
  "PENDIENTE_APROBACION",
  "REQUIERE_CORRECCION",
  "RECHAZADO",
  "ACTIVO",
  "INACTIVO",
  "SUSPENDIDO",
  "BAJA",
] as const;

export type MembershipStatus = (typeof MEMBERSHIP_STATUS_VALUES)[number];

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  NO_INICIADA: "No iniciada",
  PENDIENTE_APROBACION: "Pendiente de aprobación",
  REQUIERE_CORRECCION: "Requiere corrección",
  RECHAZADO: "Rechazado",
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  SUSPENDIDO: "Suspendido",
  BAJA: "Baja",
};

export const MEMBERSHIP_STATUS_OPTIONS = MEMBERSHIP_STATUS_VALUES.map(
  (value) => ({
    value,
    label: MEMBERSHIP_STATUS_LABELS[value],
  }),
);

export function membershipStatusLabel(status: string): string {
  return (
    MEMBERSHIP_STATUS_LABELS[status as MembershipStatus] ??
    status.replaceAll("_", " ")
  );
}

/**
 * El año actual se calcula dinámicamente.
 *
 * Se utiliza el mismo esquema de validación tanto en el frontend
 * como en el backend.
 */
export const CURRENT_YEAR = new Date().getFullYear();

/**
 * Convierte los parámetros de año provenientes de la URL
 * a números y valida sus límites.
 */
const optionalYearSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    return typeof value === "string" ? Number(value) : value;
  },
  z
    .number()
    .int("El año debe ser un número entero.")
    .min(1965, "El año mínimo permitido es 1965.")
    .max(CURRENT_YEAR, `El año máximo permitido es ${CURRENT_YEAR}.`)
    .optional(),
);

/**
 * Filtros del dashboard.
 *
 * anioDesde / anioHasta filtran por la fecha de registro
 * del afiliado (createdAt), no por el año de sus proyectos.
 */
export const afiliadosDashboardFiltersSchema = z
  .object({
    anioDesde: optionalYearSchema,
    anioHasta: optionalYearSchema,

    estadoResidencia: z.enum(ESTADOS_MEXICO).optional(),

    genero: z.enum(GENERO_OPTIONS).optional(),

    membershipStatus: z.enum(MEMBERSHIP_STATUS_VALUES).optional(),
  })
  .superRefine((values, ctx) => {
    if (
      values.anioDesde !== undefined &&
      values.anioHasta !== undefined &&
      values.anioDesde > values.anioHasta
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["anioHasta"],
        message: "El año final debe ser mayor o igual al año inicial.",
      });
    }
  });

export type AfiliadosDashboardFilters = z.infer<
  typeof afiliadosDashboardFiltersSchema
>;

export interface DistributionItem {
  label: string;
  value: number;
}

export interface TrendItem {
  year: number;
  value: number;
}

export interface TopCityItem {
  label: string;
  estado: string;
  value: number;
}

export interface AfiliadosDashboardResponse {
  generatedAt: string;

  filters: AfiliadosDashboardFilters;

  summary: {
    total: number;
    activos: number;
    inactivos: number;
    suspendidos: number;

    autorizanPublicacion: number;
    conFotografia: number;
    conPerfilProfesional: number;

    totalProyectos: number;
    afiliadosConProyecto: number;
    promedioProyectosPorAfiliado: number;

    porcentajeActivos: number;
    porcentajePublicacion: number;
  };

  distributions: {
    membershipStatus: DistributionItem[];
    genero: DistributionItem[];
    estados: DistributionItem[];

    areasConocimiento: DistributionItem[];
    tiposServicios: DistributionItem[];
    sectores: DistributionItem[];

    modalidades: DistributionItem[];
    interesadosEn: DistributionItem[];
    disponibilidadGeografica: DistributionItem[];
  };

  registrationsByYear: TrendItem[];
  projectsByYear: TrendItem[];

  topCities: TopCityItem[];
}
