import { pgTable, uuid, varchar, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { users } from "./auth-schema"; // Corregido: la tabla users está en auth-schema

export const soporteTickets = pgTable("soporte_tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  afiliadoId: varchar("afiliado_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  asunto: varchar("asunto", { length: 150 }).notNull(),
  descripcion: text("descripcion").notNull(),
  categoria: varchar("categoria", { length: 50 }).notNull().default("OTRO"),
  estado: varchar("estado", { length: 20 }).notNull().default("PENDIENTE"),
  adminAsignadoId: varchar("admin_asignado_id", { length: 255 }).references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
}, (table) => {
  return {
    afiliadoIdIdx: index("soporte_tickets_afiliado_id_idx").on(table.afiliadoId),
    estadoIdx: index("soporte_tickets_estado_idx").on(table.estado),
  };
});

export const soporteMensajes = pgTable("soporte_mensajes", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketId: uuid("ticket_id").notNull().references(() => soporteTickets.id, { onDelete: "cascade" }),
  autorId: varchar("autor_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  autorRol: varchar("autor_rol", { length: 20 }).notNull(),
  contenido: text("contenido").notNull(),
  esRespuestaOficial: boolean("es_respuesta_oficial").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    ticketIdIdx: index("soporte_mensajes_ticket_id_idx").on(table.ticketId),
  };
});
