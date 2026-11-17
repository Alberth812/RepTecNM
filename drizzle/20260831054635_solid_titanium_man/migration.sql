CREATE TYPE "account_role" AS ENUM('AFILIADO', 'ADMINISTRADOR');--> statement-breakpoint
CREATE TYPE "admin_subtype" AS ENUM('GENERAL', 'CONTENIDO');--> statement-breakpoint
CREATE TYPE "auth_event_type" AS ENUM('EMAIL_VERIFICATION_OTP_SENT', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED', 'SIGNUP_ATTEMPTED', 'LOGIN_FAILED');--> statement-breakpoint
CREATE TYPE "membership_status" AS ENUM('NO_INICIADA', 'PENDIENTE_APROBACION', 'REQUIERE_CORRECCION', 'RECHAZADO', 'ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'BAJA');--> statement-breakpoint
CREATE TYPE "revision_decision" AS ENUM('APROBADO', 'REQUIERE_CORRECCION', 'RECHAZADO');--> statement-breakpoint
CREATE TYPE "tipo_sanguineo" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');--> statement-breakpoint
CREATE TABLE "administradores" (
	"user_id" text PRIMARY KEY,
	"nombre_completo" text NOT NULL,
	"subtype" "admin_subtype" NOT NULL,
	"is_root" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "afiliados" (
	"user_id" text PRIMARY KEY,
	"apellido_paterno" text,
	"apellido_materno" text,
	"nombres" text,
	"fotografia_archivo_id" uuid,
	"comprobante_membresia_archivo_id" uuid,
	"genero" text,
	"membership_status" "membership_status" DEFAULT 'NO_INICIADA'::"membership_status" NOT NULL,
	"last_email_change_at" timestamp with time zone,
	"folio" varchar(15) UNIQUE,
	"telefono_celular" varchar(10),
	"telefono_casa" varchar(10),
	"correo_electronico" text UNIQUE,
	"linkedin" text,
	"orcid" text,
	"sitio_web" text,
	"estado_residencia" text,
	"ciudad_residencia" text,
	"disponibilidad_geografica" text[],
	"area_conocimiento" text[],
	"area_conocimiento_otro" text,
	"perfil_profesional" text,
	"palabras_clave" text[],
	"habilidades_tecnologicas" text,
	"tipo_servicios" text[],
	"tipo_servicios_otro" text,
	"descripcion_servicios" text,
	"sectores" text[],
	"sectores_otro" text,
	"modalidad_servicios" text[],
	"interesado_en" text[],
	"interesado_en_otro" text,
	"autoriza_publicacion" boolean DEFAULT false,
	"datos_publicos" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "datos_emergencia" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"afiliado_id" text NOT NULL UNIQUE,
	"nombre_contacto" text NOT NULL,
	"parentesco" text NOT NULL,
	"parentesco_otro" text,
	"telefono" varchar(10) NOT NULL,
	"tipo_sanguineo" "tipo_sanguineo" NOT NULL,
	"alergias_condiciones_medicas" text,
	"mostrar_en_qr" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proyectos_relevantes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"afiliado_id" text NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text NOT NULL,
	"rol" text NOT NULL,
	"anio" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "archivo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"bucket" text NOT NULL,
	"object_key" text NOT NULL UNIQUE,
	"original_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY,
	"issuer" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "account_role" DEFAULT 'AFILIADO'::"account_role" NOT NULL,
	"email_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "folios_anuales" (
	"anio" integer PRIMARY KEY,
	"ultimo_numero" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"type" "auth_event_type" NOT NULL,
	"user_id" text,
	"email" text,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_lockouts" (
	"email_key" text PRIMARY KEY,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "solicitudes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"afiliado_id" text NOT NULL,
	"version" integer NOT NULL,
	"datos" jsonb NOT NULL,
	"fotografia_archivo_id" uuid NOT NULL,
	"comprobante_membresia_archivo_id" uuid NOT NULL,
	"revision_decision" "revision_decision",
	"revision_observaciones" text,
	"revisado_por_admin_id" text,
	"revisado_en" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_issuer_accountId_uidx" ON "accounts" ("issuer","account_id");--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" ("identifier");--> statement-breakpoint
CREATE INDEX "auth_events_type_user_idx" ON "auth_events" ("type","user_id","created_at");--> statement-breakpoint
CREATE INDEX "auth_events_type_email_idx" ON "auth_events" ("type","email","created_at");--> statement-breakpoint
CREATE INDEX "auth_events_type_ip_idx" ON "auth_events" ("type","ip_address","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "solicitudes_afiliado_version_unique" ON "solicitudes" ("afiliado_id","version");--> statement-breakpoint
ALTER TABLE "administradores" ADD CONSTRAINT "administradores_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "afiliados" ADD CONSTRAINT "afiliados_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "afiliados" ADD CONSTRAINT "afiliados_fotografia_archivo_id_archivo_id_fkey" FOREIGN KEY ("fotografia_archivo_id") REFERENCES "archivo"("id");--> statement-breakpoint
ALTER TABLE "afiliados" ADD CONSTRAINT "afiliados_comprobante_membresia_archivo_id_archivo_id_fkey" FOREIGN KEY ("comprobante_membresia_archivo_id") REFERENCES "archivo"("id");--> statement-breakpoint
ALTER TABLE "datos_emergencia" ADD CONSTRAINT "datos_emergencia_afiliado_id_afiliados_user_id_fkey" FOREIGN KEY ("afiliado_id") REFERENCES "afiliados"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "proyectos_relevantes" ADD CONSTRAINT "proyectos_relevantes_afiliado_id_afiliados_user_id_fkey" FOREIGN KEY ("afiliado_id") REFERENCES "afiliados"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_afiliado_id_afiliados_user_id_fkey" FOREIGN KEY ("afiliado_id") REFERENCES "afiliados"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_fotografia_archivo_id_archivo_id_fkey" FOREIGN KEY ("fotografia_archivo_id") REFERENCES "archivo"("id");--> statement-breakpoint
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_comprobante_membresia_archivo_id_archivo_id_fkey" FOREIGN KEY ("comprobante_membresia_archivo_id") REFERENCES "archivo"("id");--> statement-breakpoint
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_revisado_por_admin_id_administradores_user_id_fkey" FOREIGN KEY ("revisado_por_admin_id") REFERENCES "administradores"("user_id");