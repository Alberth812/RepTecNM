import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./auth-schema";
import { administradores } from "./administradores";
import { membershipStatusEnum, tipoSanguineoEnum } from "./enums";
import { archivos } from "./archivo";

/**
 * Identidad y estado de cuenta del afiliado. Ya NO contiene los datos del
 * formulario: esos viven versionados en `solicitudesAfiliado`, porque cada
 * envío (inicial o corrección) debe poder conservarse como snapshot
 * "actual"/"anterior" para que un admin compare qué cambió.
 */
export const afiliados = pgTable("afiliados", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  membershipStatus: membershipStatusEnum("membership_status")
    .notNull()
    .default("NO_INICIADA"),

  lastEmailChangeAt: timestamp("last_email_change_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const solicitudTipoEnum = pgEnum("solicitud_tipo", [
  "ACTUAL",
  "ANTERIOR",
]);

/**
 * Snapshot versionado de cada envío del formulario. Como máximo existen 2
 * filas por afiliado (una 'ACTUAL' y opcionalmente una 'ANTERIOR'); los
 * índices únicos parciales de abajo hacen cumplir eso a nivel de BD.
 *
 * Al llegar una nueva corrección: la 'ANTERIOR' existente se borra por
 * completo (con sus archivos), la 'ACTUAL' pasa a 'ANTERIOR', y la nueva
 * respuesta se inserta como 'ACTUAL'.
 */
export const solicitudesAfiliado = pgTable(
  "solicitudes_afiliado",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    afiliadoId: text("afiliado_id")
      .notNull()
      .references(() => afiliados.userId, { onDelete: "cascade" }),
    tipo: solicitudTipoEnum("tipo").notNull(),

    // Datos generales
    apellidoPaterno: text("apellido_paterno").notNull(),
    apellidoMaterno: text("apellido_materno").notNull(),
    nombres: text("nombres").notNull(),
    fotografiaArchivoId: uuid("fotografia_archivo_id")
      .notNull()
      .references(() => archivos.id),
    comprobanteMembresiaArchivoId: uuid("comprobante_membresia_archivo_id")
      .notNull()
      .references(() => archivos.id),
    genero: text("genero").notNull(),

    // Contacto (correo NO va aquí, ver nota arriba)
    telefonoCelular: varchar("telefono_celular", { length: 10 }).notNull(),
    telefonoCasa: varchar("telefono_casa", { length: 10 }),
    correoElectronico: text("correo_electronico"),
    linkedin: text("linkedin"),
    orcid: text("orcid"),
    sitioWeb: text("sitio_web"),

    // Ubicación
    estadoResidencia: text("estado_residencia").notNull(),
    ciudadResidencia: text("ciudad_residencia").notNull(),
    disponibilidadGeografica: text("disponibilidad_geografica")
      .array()
      .notNull(),

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
    autorizaPublicacion: boolean("autoriza_publicacion")
      .notNull()
      .default(false),
    datosPublicos: text("datos_publicos").array().notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("solicitudes_afiliado_actual_unq")
      .on(table.afiliadoId)
      .where(sql`${table.tipo} = 'ACTUAL'`),
    uniqueIndex("solicitudes_afiliado_anterior_unq")
      .on(table.afiliadoId)
      .where(sql`${table.tipo} = 'ANTERIOR'`),
  ],
);

/** Proyectos relevantes (0 a 5), ligados a una versión concreta del formulario. */
export const proyectosRelevantes = pgTable("proyectos_relevantes", {
  id: uuid("id").primaryKey().defaultRandom(),
  solicitudId: uuid("solicitud_id")
    .notNull()
    .references(() => solicitudesAfiliado.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion").notNull(),
  rol: text("rol").notNull(),
  anio: integer("anio").notNull(),
});

/** Datos de emergencia, ligados a una versión concreta del formulario (1:1). */
export const datosEmergencia = pgTable("datos_emergencia", {
  id: uuid("id").primaryKey().defaultRandom(),
  solicitudId: uuid("solicitud_id")
    .notNull()
    .unique()
    .references(() => solicitudesAfiliado.id, { onDelete: "cascade" }),

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
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/**
 * Revisión de un administrador sobre una solicitud concreta. 0 o 1 por
 * solicitud (el UNIQUE en solicitudId lo garantiza) — "no hay fila" ==
 * "todavía no revisada", así modelamos el "posiblemente nula" sin permitir
 * dos revisiones sobre la misma solicitud.
 */
export const revisiones = pgTable("revisiones", {
  id: uuid("id").primaryKey().defaultRandom(),
  solicitudId: uuid("solicitud_id")
    .notNull()
    .unique()
    .references(() => solicitudesAfiliado.id, { onDelete: "cascade" }),
  adminId: text("admin_id").references(() => administradores.userId, {
    onDelete: "set null",
  }),
  observaciones: text("observaciones").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Afiliado = typeof afiliados.$inferSelect;
export type NewAfiliado = typeof afiliados.$inferInsert;
export type SolicitudAfiliado = typeof solicitudesAfiliado.$inferSelect;
export type NewSolicitudAfiliado = typeof solicitudesAfiliado.$inferInsert;
export type ProyectoRelevanteRow = typeof proyectosRelevantes.$inferSelect;
export type NewProyectoRelevante = typeof proyectosRelevantes.$inferInsert;
export type DatosEmergenciaRow = typeof datosEmergencia.$inferSelect;
export type NewDatosEmergencia = typeof datosEmergencia.$inferInsert;
export type RevisionRow = typeof revisiones.$inferSelect;
export type NewRevision = typeof revisiones.$inferInsert;
