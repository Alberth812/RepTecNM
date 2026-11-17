CREATE TYPE "disponibilidad_actualizacion" AS ENUM('mananas', 'tardes', 'fines_de_semana', 'unicamente_sabados', 'sin_disponibilidad');--> statement-breakpoint
CREATE TYPE "produccion_academica_opcion" AS ENUM('articulos_revistas', 'articulos_divulgacion', 'articulos_periodicos', 'libros', 'capitulos_libro', 'ponencias', 'conferencias', 'direccion_tesis', 'informes_tecnicos', 'prototipos_productos', 'propiedad_intelectual', 'proyectos_investigacion', 'grupos_investigacion', 'divulgacion_cientifica', 'otra');--> statement-breakpoint
CREATE TYPE "situacion_sni" AS ENUM('nunca', 'anterior', 'actual', 'anterior_y_actual');--> statement-breakpoint
CREATE TYPE "cumplimiento_expectativas" AS ENUM('muy_de_acuerdo', 'de_acuerdo', 'ni_de_acuerdo_ni_en_desacuerdo', 'en_desacuerdo', 'muy_en_desacuerdo');--> statement-breakpoint
CREATE TYPE "satisfaccion_formacion" AS ENUM('totalmente_satisfecho', 'muy_satisfecho', 'regularmente_satisfecho', 'poco_satisfecho', 'nada_satisfecho');--> statement-breakpoint
CREATE TYPE "valoracion" AS ENUM('excelente', 'buena', 'regular', 'mala', 'pesima');--> statement-breakpoint
CREATE TABLE "afiliado_actualizacion_profesional" (
	"user_id" text PRIMARY KEY,
	"ha_tomado_actualizacion" boolean NOT NULL,
	"actividades_actualizacion" jsonb,
	"actualizacion_deseada" varchar(1000) NOT NULL,
	"disponibilidad_actualizacion" "disponibilidad_actualizacion"[] NOT NULL,
	"horario_actualizacion" varchar(100),
	"creacion_empresa" boolean NOT NULL,
	"nombre_empresa" varchar(200),
	"puesto_5_anios" varchar(500),
	"ha_ocupado_cargo_eleccion_popular" boolean NOT NULL,
	"detalle_cargo_publico" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ap_actividades_coherentes" CHECK ((
  ("ha_tomado_actualizacion" AND "actividades_actualizacion" IS NOT NULL AND jsonb_typeof("actividades_actualizacion") = 'array'
    AND jsonb_array_length("actividades_actualizacion") BETWEEN 1 AND 15)
  OR (NOT "ha_tomado_actualizacion" AND "actividades_actualizacion" IS NULL)
)),
	CONSTRAINT "ap_empresa_coherente" CHECK ((
  ("creacion_empresa" AND "nombre_empresa" IS NOT NULL) OR (NOT "creacion_empresa" AND "nombre_empresa" IS NULL)
)),
	CONSTRAINT "ap_cargos_coherentes" CHECK ((
  ("ha_ocupado_cargo_eleccion_popular" AND "detalle_cargo_publico" IS NOT NULL AND jsonb_typeof("detalle_cargo_publico") = 'array'
    AND jsonb_array_length("detalle_cargo_publico") BETWEEN 1 AND 15)
  OR (NOT "ha_ocupado_cargo_eleccion_popular" AND "detalle_cargo_publico" IS NULL)
)),
	CONSTRAINT "ap_disponibilidad_valida" CHECK ((
        cardinality("disponibilidad_actualizacion") BETWEEN 1 AND 5
        AND (
          NOT ('sin_disponibilidad' = ANY("disponibilidad_actualizacion"))
          OR cardinality("disponibilidad_actualizacion") = 1
        )
      ))
);
--> statement-breakpoint
CREATE TABLE "afiliados_investigacion" (
	"user_id" text PRIMARY KEY,
	"participacion_produccion_conocimiento" boolean,
	"produccion_academica" "produccion_academica_opcion"[],
	"otros_productos_academicos" text,
	"situacion_sni" "situacion_sni",
	"sni_periodo_anterior" text,
	"sni_periodo_actual" text,
	"red_tematica_conacyt" boolean,
	"nombre_red" text,
	"ha_recibido_premios_reconocimientos" boolean,
	"detalle_reconocimiento" text,
	"pertenece_academia_sociedad" boolean,
	"nombre_organizacion" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluacion_programa_estudios" (
	"user_id" text PRIMARY KEY,
	"nombre_tesis" text,
	"correspondencia_plan_estudios" "valoracion" NOT NULL,
	"estrategias_didacticas" "valoracion" NOT NULL,
	"formas_evaluacion" "valoracion" NOT NULL,
	"bibliografia" "valoracion" NOT NULL,
	"asesoria_tesis" integer NOT NULL,
	"satisfaccion_formacion" "satisfaccion_formacion" NOT NULL,
	"evaluacion_infraestructura" jsonb NOT NULL,
	"tiene_otro_aspecto_infraestructura" boolean NOT NULL,
	"otro_aspecto_infraestructura" text,
	"calificacion_otro_aspecto_infraestructura" integer,
	"cumplimiento_expectativas" "cumplimiento_expectativas" NOT NULL,
	"calidad_programa" "valoracion" NOT NULL,
	"areas_mejora" text NOT NULL,
	"mejoras_plan_estudios" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "asesoria_tesis_range" CHECK ("asesoria_tesis" BETWEEN 1 AND 10),
	CONSTRAINT "calificacion_otro_aspecto_infraestructura_range" CHECK ("calificacion_otro_aspecto_infraestructura" IS NULL
          OR "calificacion_otro_aspecto_infraestructura" BETWEEN 1 AND 10),
	CONSTRAINT "otro_aspecto_infraestructura_coherence" CHECK ((
            "tiene_otro_aspecto_infraestructura" = false
            AND "otro_aspecto_infraestructura" IS NULL
            AND "calificacion_otro_aspecto_infraestructura" IS NULL
          ) OR (
            "tiene_otro_aspecto_infraestructura" = true
            AND "otro_aspecto_infraestructura" IS NOT NULL
            AND "calificacion_otro_aspecto_infraestructura" IS NOT NULL
          ))
);
--> statement-breakpoint
ALTER TABLE "afiliado_actualizacion_profesional" ADD CONSTRAINT "afiliado_actualizacion_profesional_V8OyLakhzVa1_fkey" FOREIGN KEY ("user_id") REFERENCES "afiliados"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "afiliados_investigacion" ADD CONSTRAINT "afiliados_investigacion_user_id_afiliados_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "afiliados"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "evaluacion_programa_estudios" ADD CONSTRAINT "evaluacion_programa_estudios_user_id_afiliados_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "afiliados"("user_id") ON DELETE CASCADE;