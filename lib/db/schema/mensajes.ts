/**
 * Esquema de mensajería interna asíncrona
 * 
 * Características:
 * - Mensajes unidireccionales (no se pueden responder desde la plataforma)
 * - Inmutables (no se pueden editar ni borrar una vez enviados)
 * - Solo texto (sin archivos adjuntos)
 * - El remitente debe proporcionar datos de contacto para recibir respuesta externa
 */
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

/**
 * Tabla principal de mensajes
 * Cada fila representa un mensaje enviado entre dos usuarios
 */
export const mensajes = pgTable("mensajes", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Relaciones con usuarios (remitente y destinatario)
  remitenteId: text("remitente_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  destinatarioId: text("destinatario_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Datos de contacto que el remitente proporciona para recibir respuesta
  // Estos datos son visibles para el destinatario
  nombreParaRespuesta: text("nombre_para_respuesta").notNull(),
  correoParaRespuesta: text("correo_para_respuesta"),
  telefonoParaRespuesta: text("telefono_para_respuesta"),
  
  // Contenido del mensaje
  motivo: text("motivo").notNull(), // Asunto o razón del mensaje (máx 150 caracteres)
  contenido: text("contenido").notNull(), // Cuerpo del mensaje (máx 2000 caracteres)
  
  // Estado de lectura (para mostrar indicador de no leído en bandeja)
  leido: boolean("leido").default(false).notNull(),
  
  // Marca de tiempo de creación (única, no hay updatedAt porque es inmutable)
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Tipos TypeScript para inferir select/insert
export type Mensaje = typeof mensajes.$inferSelect;
export type NewMensaje = typeof mensajes.$inferInsert;
