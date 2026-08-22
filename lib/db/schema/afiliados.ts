import { user } from "./auth-schema";
import { membershipStatusEnum, tipoSanguineoEnum } from "./enums";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Datos "públicos" del afiliado: lo que puede mostrarse en el catálogo de
 * egresados (sujeto a `autoriza_publicacion` / `datos_publicos`).
 */
export const afiliados = pgTable("afiliados", {
  accountId: text("account_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  // Datos generales
  apellidoPaterno: text("apellido_paterno").notNull(),
  apellidoMaterno: text("apellido_materno").notNull(),
  nombres: text("nombres").notNull(),
  fotografiaUrl: text("fotografia_url").notNull(),
  comprobanteMembresiaUrl: text("comprobante_membresia_url"),
  genero: text("genero").notNull(),

  //Estado de membresía
  membershipStatus: membershipStatusEnum("membership_status")
    .notNull()
    .default("NO_INICIADA"),

  // Contacto
  telefonoCelular: varchar("telefono_celular", { length: 10 }).notNull(),
  telefonoCasa: varchar("telefono_casa", { length: 10 }),
  correoElectronico: text("correo_electronico").notNull().unique(),
  linkedin: text("linkedin"),
  orcid: text("orcid"),
  sitioWeb: text("sitio_web"),

  // Ubicación para el catálogo
  estadoResidencia: text("estado_residencia").notNull(),
  ciudadResidencia: text("ciudad_residencia").notNull(),
  disponibilidadGeografica: text("disponibilidad_geografica").array().notNull(),

  // Perfil profesional público
  areaConocimiento: text("area_conocimiento").array().notNull(),
  areaConocimientoOtro: text("area_conocimiento_otro"),
  perfilProfesional: text("perfil_profesional").notNull(),
  palabrasClave: text("palabras_clave").array().notNull(),
  habilidadesTecnologicas: text("habilidades_tecnologicas").notNull(),

  // Servicios profesionales
  tipoServicios: text("tipo_servicios").array().notNull(),
  tipoServiciosOtro: text("tipo_servicios_otro"),
  descripcionServicios: text("descripcion_servicios").notNull(),
  sectores: text("sectores").array().notNull(),
  sectoresOtro: text("sectores_otro"),
  modalidadServicios: text("modalidad_servicios").array().notNull(),
  interesadoEn: text("interesado_en").array().notNull(),
  interesadoEnOtro: text("interesado_en_otro"),

  // Visibilidad
  autorizaPublicacion: boolean("autoriza_publicacion").notNull().default(false),
  datosPublicos: text("datos_publicos").array().notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Proyectos relevantes del afiliado (0 a 5, capturados en el paso 4). */
export const proyectosRelevantes = pgTable("proyectos_relevantes", {
  id: uuid("id").primaryKey().defaultRandom(),
  afiliadoId: uuid("afiliado_id")
    .notNull()
    .references(() => afiliados.accountId, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion").notNull(),
  rol: text("rol").notNull(),
  anio: integer("anio").notNull(),
});

/**
 * Datos de emergencia: el JSON original es explícito en que esta información
 * es privada y NUNCA debe mostrarse en el catálogo público, solo en la
 * credencial QR del afiliado (y solo si `mostrar_en_qr` es verdadero). Por
 * eso viven en su propia tabla, separada de `afiliados`, para poder aplicar
 * permisos/políticas de acceso (p. ej. Row Level Security) independientes.
 */
export const datosEmergencia = pgTable("datos_emergencia", {
  id: uuid("id").primaryKey().defaultRandom(),
  afiliadoId: uuid("afiliado_id")
    .notNull()
    .unique()
    .references(() => afiliados.accountId, { onDelete: "cascade" }),
  nombreContacto: text("nombre_contacto").notNull(),
  parentesco: text("parentesco").notNull(),
  parentescoOtro: text("parentesco_otro"),
  telefono: varchar("telefono", { length: 10 }).notNull(),
  tipoSanguineo: tipoSanguineoEnum("tipo_sanguineo").notNull(),
  alergiasCondicionesMedicas: text("alergias_condiciones_medicas"),
  mostrarEnQr: boolean("mostrar_en_qr").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Afiliado = typeof afiliados.$inferSelect;
export type NewAfiliado = typeof afiliados.$inferInsert;
export type ProyectoRelevanteRow = typeof proyectosRelevantes.$inferSelect;
export type NewProyectoRelevante = typeof proyectosRelevantes.$inferInsert;
export type DatosEmergenciaRow = typeof datosEmergencia.$inferSelect;
export type NewDatosEmergencia = typeof datosEmergencia.$inferInsert;
