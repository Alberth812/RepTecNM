CREATE TYPE "estado_publicacion" AS ENUM('ACTIVO');--> statement-breakpoint
CREATE TYPE "tipo_publicacion" AS ENUM('ARTICULO', 'TESIS', 'LIBRO', 'MEMORIA_CONGRESO', 'PRESENTACION', 'ENSAYO', 'REPORTE_TECNICO', 'OTRO');--> statement-breakpoint
CREATE TABLE "publicacion_autores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"publicacion_id" uuid NOT NULL,
	"nombres" text NOT NULL,
	"apellidos" text NOT NULL,
	"orden" integer NOT NULL,
	CONSTRAINT "publicacion_autores_nombres_length_check" CHECK (char_length("nombres") BETWEEN 3 AND 150),
	CONSTRAINT "publicacion_autores_apellidos_length_check" CHECK (char_length("apellidos") BETWEEN 3 AND 150),
	CONSTRAINT "publicacion_autores_orden_check" CHECK ("orden" >= 1)
);
--> statement-breakpoint
CREATE TABLE "publicacion_palabras_clave" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"publicacion_id" uuid NOT NULL,
	"valor" text NOT NULL,
	CONSTRAINT "publicacion_palabras_clave_valor_length_check" CHECK (char_length("valor") BETWEEN 3 AND 50)
);
--> statement-breakpoint
CREATE TABLE "publicaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"afiliado_id" text NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text NOT NULL,
	"tipo" "tipo_publicacion" NOT NULL,
	"tipo_otro" text,
	"anio_publicacion" integer NOT NULL,
	"doi" text,
	"revista_congreso" text,
	"editorial" text,
	"isbn" text,
	"issn" text,
	"url" text,
	"documento_archivo_id" uuid NOT NULL,
	"descargo_version" integer NOT NULL,
	"descargo_aceptado_at" timestamp with time zone NOT NULL,
	"estado" "estado_publicacion" DEFAULT 'ACTIVO'::"estado_publicacion" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "publicaciones_tipo_otro_check" CHECK (("tipo" = 'OTRO' AND "tipo_otro" IS NOT NULL)
        OR ("tipo" <> 'OTRO' AND "tipo_otro" IS NULL)),
	CONSTRAINT "publicaciones_tipo_otro_length_check" CHECK ("tipo_otro" IS NULL
        OR char_length("tipo_otro") BETWEEN 3 AND 50),
	CONSTRAINT "publicaciones_titulo_length_check" CHECK (char_length("titulo") BETWEEN 3 AND 300),
	CONSTRAINT "publicaciones_descripcion_length_check" CHECK (char_length("descripcion") BETWEEN 10 AND 1800),
	CONSTRAINT "publicaciones_anio_check" CHECK ("anio_publicacion" BETWEEN 1950
        AND EXTRACT(YEAR FROM CURRENT_DATE)::int)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "publicacion_autores_publicacion_orden_unique" ON "publicacion_autores" ("publicacion_id","orden");--> statement-breakpoint
CREATE INDEX "publicacion_autores_publicacion_id_idx" ON "publicacion_autores" ("publicacion_id");--> statement-breakpoint
CREATE UNIQUE INDEX "publicacion_palabras_clave_publicacion_valor_unique" ON "publicacion_palabras_clave" ("publicacion_id","valor");--> statement-breakpoint
CREATE INDEX "publicacion_palabras_clave_valor_idx" ON "publicacion_palabras_clave" ("valor");--> statement-breakpoint
CREATE UNIQUE INDEX "publicaciones_documento_archivo_id_unique" ON "publicaciones" ("documento_archivo_id");--> statement-breakpoint
CREATE INDEX "publicaciones_afiliado_id_idx" ON "publicaciones" ("afiliado_id");--> statement-breakpoint
CREATE INDEX "publicaciones_estado_idx" ON "publicaciones" ("estado");--> statement-breakpoint
CREATE INDEX "publicaciones_created_at_idx" ON "publicaciones" ("created_at");--> statement-breakpoint
CREATE INDEX "publicaciones_tipo_idx" ON "publicaciones" ("tipo");--> statement-breakpoint
CREATE INDEX "publicaciones_anio_publicacion_idx" ON "publicaciones" ("anio_publicacion");--> statement-breakpoint
ALTER TABLE "publicacion_autores" ADD CONSTRAINT "publicacion_autores_publicacion_id_publicaciones_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "publicaciones"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "publicacion_palabras_clave" ADD CONSTRAINT "publicacion_palabras_clave_publicacion_id_publicaciones_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "publicaciones"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_afiliado_id_afiliados_user_id_fkey" FOREIGN KEY ("afiliado_id") REFERENCES "afiliados"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_documento_archivo_id_archivo_id_fkey" FOREIGN KEY ("documento_archivo_id") REFERENCES "archivo"("id") ON DELETE RESTRICT;