CREATE TYPE "campo_investigacion_posdoctorado" AS ENUM('CIENCIAS_SOCIALES_HUMANIDADES', 'CIENCIAS_NATURALES_EXACTAS', 'INGENIERIA_TECNOLOGIA', 'CIENCIAS_AGROPECUARIAS', 'EDUCACION', 'OTRO');--> statement-breakpoint
CREATE TYPE "dedicacion_posgrado" AS ENUM('TIEMPO_COMPLETO', 'MEDIO_TIEMPO', 'TIEMPO_PARCIAL');--> statement-breakpoint
CREATE TYPE "estado_civil" AS ENUM('SOLTERO', 'CASADO', 'UNION_LIBRE', 'OTRO');--> statement-breakpoint
CREATE TYPE "fuente_financiamiento_posdoctorado" AS ENUM('BECA_NACIONAL', 'BECA_INTERNACIONAL', 'APOYO_INSTITUCIONAL', 'PROYECTO_INVESTIGACION', 'OTRO');--> statement-breakpoint
CREATE TYPE "fuente_financiamiento_posgrado" AS ENUM('CONAHCYT', 'INSTITUCION_LABORA', 'PRODEP', 'INSTITUCION_POSGRADO', 'OTRO');--> statement-breakpoint
CREATE TYPE "modalidad_posgrado" AS ENUM('PRESENCIAL', 'EN_LINEA', 'HIBRIDA', 'OTRA');--> statement-breakpoint
CREATE TYPE "motivo_no_obtencion_grado" AS ENUM('EN_PROCESO', 'TESIS_PENDIENTE', 'EXAMEN_PENDIENTE', 'TRAMITE_NO_REALIZADO', 'OTRO');--> statement-breakpoint
CREATE TYPE "situacion_posdoctorado" AS ENUM('CONCLUIDA', 'ACTUAL', 'INTERES_FUTURO', 'SIN_INTERES');--> statement-breakpoint
CREATE TYPE "tipo_posgrado" AS ENUM('MAESTRIA', 'DOCTORADO');--> statement-breakpoint
CREATE TYPE "trayectoria_posgrado" AS ENUM('INDEPENDIENTE', 'INTEGRADA_MAESTRIA_DOCTORADO');--> statement-breakpoint
CREATE TABLE "estancias_posdoctorales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"afiliado_id" text NOT NULL,
	"situacion" "situacion_posdoctorado" NOT NULL,
	"institucion_id" uuid,
	"programa" text,
	"campo_investigacion" "campo_investigacion_posdoctorado",
	"campo_investigacion_otro" text,
	"linea_investigacion" text,
	"anio_inicio" integer,
	"anio_fin" integer,
	"recibio_apoyo_economico" boolean,
	"fuentes_financiamiento" "fuente_financiamiento_posdoctorado"[],
	"fuentes_financiamiento_otro" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "licenciaturas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"afiliado_id" text NOT NULL,
	"institucion_id" uuid NOT NULL,
	"programa" text NOT NULL,
	"disciplina" text NOT NULL,
	"anio_ingreso" integer,
	"anio_egreso" integer NOT NULL,
	"tiene_titulo" boolean,
	"anio_titulacion" integer,
	"motivo_no_titulacion" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posgrados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"afiliado_id" text NOT NULL,
	"tipo_posgrado" "tipo_posgrado" NOT NULL,
	"trayectoria_posgrado" "trayectoria_posgrado",
	"institucion_id" uuid NOT NULL,
	"programa" text NOT NULL,
	"disciplina" text NOT NULL,
	"linea_investigacion" text,
	"motivos_eleccion_institucion" jsonb NOT NULL,
	"anio_ingreso" integer NOT NULL,
	"anio_egreso" integer,
	"actualmente_cursa" boolean NOT NULL,
	"modalidad" "modalidad_posgrado",
	"modalidad_otra" text,
	"dedicacion" "dedicacion_posgrado",
	"becado" boolean,
	"fuentes_financiamiento" "fuente_financiamiento_posgrado"[],
	"fuentes_financiamiento_otro" text,
	"tiene_grado" boolean,
	"anio_obtencion_grado" integer,
	"meses_obtencion_grado" integer,
	"motivo_no_obtencion_grado" "motivo_no_obtencion_grado",
	"motivo_no_obtencion_grado_otro" text,
	"estado_civil_inicio" "estado_civil" NOT NULL,
	"estado_civil_inicio_otro" text,
	"estado_civil_conclusion" "estado_civil",
	"estado_civil_conclusion_otro" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resumen_posgrado" (
	"afiliado_id" text PRIMARY KEY,
	"programas_posgrado_cursados" "tipo_posgrado"[],
	"trayectoria_maestria_doctorado_integrada" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instituciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"nombre" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "estancias_posdoctorales" ADD CONSTRAINT "estancias_posdoctorales_afiliado_id_afiliados_user_id_fkey" FOREIGN KEY ("afiliado_id") REFERENCES "afiliados"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "estancias_posdoctorales" ADD CONSTRAINT "estancias_posdoctorales_institucion_id_instituciones_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "instituciones"("id");--> statement-breakpoint
ALTER TABLE "licenciaturas" ADD CONSTRAINT "licenciaturas_afiliado_id_afiliados_user_id_fkey" FOREIGN KEY ("afiliado_id") REFERENCES "afiliados"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "licenciaturas" ADD CONSTRAINT "licenciaturas_institucion_id_instituciones_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "instituciones"("id");--> statement-breakpoint
ALTER TABLE "posgrados" ADD CONSTRAINT "posgrados_afiliado_id_afiliados_user_id_fkey" FOREIGN KEY ("afiliado_id") REFERENCES "afiliados"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "posgrados" ADD CONSTRAINT "posgrados_institucion_id_instituciones_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "instituciones"("id");--> statement-breakpoint
ALTER TABLE "resumen_posgrado" ADD CONSTRAINT "resumen_posgrado_afiliado_id_afiliados_user_id_fkey" FOREIGN KEY ("afiliado_id") REFERENCES "afiliados"("user_id") ON DELETE CASCADE;