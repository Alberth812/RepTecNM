import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

export const mensajes = pgTable("mensajes", {
 id: uuid("id").primaryKey().defaultRandom(),
 remitenteId: text("remitente_id").notNull().references(() => users.id, { onDelete: "cascade" }),
 destinatarioId: text("destinatario_id").notNull().references(() => users.id, { onDelete: "cascade" }),
 
 // Datos de contacto para que el destinatario pueda responder externamente
 nombreParaRespuesta: text("nombre_para_respuesta").notNull(),
 correoParaRespuesta: text("correo_para_respuesta"),
 telefonoParaRespuesta: text("telefono_para_respuesta"),
 
 // Contenido del mensaje
 motivo: text("motivo").notNull(),
 contenido: text("contenido").notNull(),
 
 // Estado
 leido: boolean("leido").default(false).notNull(),
 eliminadoParaDestinatario: boolean("eliminado_para_destinatario").default(false).notNull(),
 
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
 index("mensajes_destinatario_idx").on(table.destinatarioId, table.createdAt),
 index("mensajes_remitente_idx").on(table.remitenteId, table.createdAt),
]);

export type Mensaje = typeof mensajes.$inferSelect;
export type NuevoMensaje = typeof mensajes.$inferInsert;
