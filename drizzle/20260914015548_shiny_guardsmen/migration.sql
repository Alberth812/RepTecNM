CREATE TYPE "causa_desempleo" AS ENUM('poca_experiencia', 'falta_oportunidades', 'sin_grado', 'idioma', 'personales', 'otro');--> statement-breakpoint
CREATE TYPE "estrategia_consecucion_empleo" AS ENUM('periodico', 'redes_sociales', 'internet', 'convocatorias', 'recomendacion_contacto', 'autoempleo', 'emigracion', 'solicitudes', 'otro');--> statement-breakpoint
CREATE TYPE "factor_empleo" AS ENUM('prestigio_institucion', 'perfil_academico', 'experiencia_laboral', 'genero', 'edad', 'recomendaciones', 'otro');--> statement-breakpoint
CREATE TYPE "sector_primario" AS ENUM('agricultura', 'ganaderia', 'forestal', 'pesca');--> statement-breakpoint
CREATE TYPE "sector_secundario" AS ENUM('mineria', 'energia', 'agua_gas', 'construccion', 'manufactura');--> statement-breakpoint
CREATE TYPE "sector_terciario" AS ENUM('comercio_mayor', 'comercio_menor', 'transporte', 'medios', 'financiero', 'inmobiliario', 'profesionales', 'educativos', 'salud', 'cultura', 'turismo', 'otros_servicios');--> statement-breakpoint
CREATE TYPE "tiempo_primer_empleo" AS ENUM('menos_seis_meses', 'seis_meses_un_anio', 'mas_de_un_anio', 'sin_empleo');--> statement-breakpoint
CREATE TYPE "tipo_actividad_empleo" AS ENUM('academica', 'empresarial', 'gubernamental', 'independiente', 'otro');--> statement-breakpoint
CREATE TYPE "tipo_contratacion" AS ENUM('base', 'confianza', 'eventual', 'por_contrato', 'otro');--> statement-breakpoint
CREATE TYPE "tipo_institucion" AS ENUM('privada', 'gobierno', 'educacion', 'investigacion', 'social', 'otro');--> statement-breakpoint
CREATE TYPE "valoracion_impacto" AS ENUM('muy_bajo', 'bajo', 'medio', 'alto', 'muy_alto');--> statement-breakpoint
CREATE TYPE "valoracion_nivel" AS ENUM('muy_baja', 'baja', 'media', 'alta', 'muy_alta');--> statement-breakpoint
CREATE TABLE "afiliados_empleos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"afiliado_user_id" text NOT NULL,
	"puesto" varchar(200) NOT NULL,
	"institucion" varchar(250) NOT NULL,
	"fecha_inicio_anio" integer NOT NULL,
	"fecha_inicio_mes" integer NOT NULL,
	"es_actual" boolean DEFAULT false NOT NULL,
	"fecha_fin_anio" integer,
	"fecha_fin_mes" integer,
	"tipo_contratacion" "tipo_contratacion",
	"tipo_contratacion_otro" text,
	"salario_mensual_bruto" numeric(12,2),
	"horas_semanales" integer,
	"tipo_institucion" "tipo_institucion"[],
	"tipo_institucion_otro" text,
	"telefono_organismo" varchar(20),
	"sector_primario" "sector_primario"[],
	"sector_secundario" "sector_secundario"[],
	"sector_terciario" "sector_terciario"[],
	"tipo_actividad_empleo_actual" "tipo_actividad_empleo"[],
	"tipo_actividad_otro" text,
	"actividades_principales" text,
	"estrategia_empleo_actual" "estrategia_consecucion_empleo"[],
	"estrategia_empleo_actual_otro" text,
	"valoracion_coincidencia_conocimientos_con_campo_laboral" "valoracion_nivel",
	"valoracion_capacidad_resolver_problemas_laborales" "valoracion_nivel",
	"valoracion_impacto_social_actividad_profesional" "valoracion_impacto",
	"valoracion_pertinencia_programa_campo_laboral" "valoracion_nivel",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "afiliados_informacion_laboral" (
	"user_id" text PRIMARY KEY,
	"tiempo_primer_empleo" "tiempo_primer_empleo" NOT NULL,
	"factores_empleo" "factor_empleo"[],
	"factores_empleo_otro" text,
	"labora_actualmente" boolean DEFAULT false NOT NULL,
	"causas_desempleo" "causa_desempleo"[],
	"causas_desempleo_otro" text,
	"estrategia_postgrado_para_conseguir_empleo" "estrategia_consecucion_empleo"[],
	"estrategia_postgrado_otro" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "licenciaturas" DROP COLUMN "tiene_titulo";--> statement-breakpoint
ALTER TABLE "licenciaturas" DROP COLUMN "motivo_no_titulacion";--> statement-breakpoint
ALTER TABLE "licenciaturas" ALTER COLUMN "anio_titulacion" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "afiliados_empleos" ADD CONSTRAINT "afiliados_empleos_afiliado_user_id_afiliados_user_id_fkey" FOREIGN KEY ("afiliado_user_id") REFERENCES "afiliados"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "afiliados_informacion_laboral" ADD CONSTRAINT "afiliados_informacion_laboral_user_id_afiliados_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "afiliados"("user_id") ON DELETE CASCADE;