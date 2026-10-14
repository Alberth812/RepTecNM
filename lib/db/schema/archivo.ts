import { bigint, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const archivos = pgTable("archivo", {
 id: uuid("id").defaultRandom().primaryKey(),

 bucket: text("bucket").notNull(),

 objectKey: text("object_key").notNull().unique(),

 originalName: text("original_name").notNull(),

 contentType: text("content_type").notNull(),

 size: bigint("size", { mode: "number" }).notNull(),

 createdAt: timestamp("created_at", {
 withTimezone: true,
 })
 .defaultNow()
 .notNull(),
}); 

export type Archivo = typeof archivos.$inferSelect;
export type NewArchivo = typeof archivos.$inferInsert;
