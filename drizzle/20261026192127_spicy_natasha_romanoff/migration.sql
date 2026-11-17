CREATE TYPE "institucion_estado" AS ENUM('ACTIVO', 'INACTIVO');--> statement-breakpoint
CREATE TABLE "mensajes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"remitente_id" text NOT NULL,
	"destinatario_id" text NOT NULL,
	"nombre_para_respuesta" text NOT NULL,
	"correo_para_respuesta" text,
	"telefono_para_respuesta" text,
	"motivo" text NOT NULL,
	"contenido" text NOT NULL,
	"leido" boolean DEFAULT false NOT NULL,
	"eliminado_para_destinatario" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "soporte_mensajes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"ticket_id" uuid NOT NULL,
	"autor_id" varchar(255) NOT NULL,
	"autor_rol" varchar(20) NOT NULL,
	"contenido" text NOT NULL,
	"es_respuesta_oficial" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "soporte_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"afiliado_id" varchar(255) NOT NULL,
	"asunto" varchar(150) NOT NULL,
	"descripcion" text NOT NULL,
	"categoria" varchar(50) DEFAULT 'OTRO' NOT NULL,
	"estado" varchar(20) DEFAULT 'PENDIENTE' NOT NULL,
	"admin_asignado_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "administradores" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "afiliados" ADD COLUMN "mostrar_en_qr" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "instituciones" ADD COLUMN "estado" "institucion_estado" DEFAULT 'ACTIVO'::"institucion_estado" NOT NULL;--> statement-breakpoint
ALTER TABLE "instituciones" ADD COLUMN "last_changed_to_inactivo_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "mensajes_destinatario_idx" ON "mensajes" ("destinatario_id","created_at");--> statement-breakpoint
CREATE INDEX "mensajes_remitente_idx" ON "mensajes" ("remitente_id","created_at");--> statement-breakpoint
CREATE INDEX "soporte_mensajes_ticket_id_idx" ON "soporte_mensajes" ("ticket_id");--> statement-breakpoint
CREATE INDEX "soporte_tickets_afiliado_id_idx" ON "soporte_tickets" ("afiliado_id");--> statement-breakpoint
CREATE INDEX "soporte_tickets_estado_idx" ON "soporte_tickets" ("estado");--> statement-breakpoint
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_remitente_id_users_id_fkey" FOREIGN KEY ("remitente_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_destinatario_id_users_id_fkey" FOREIGN KEY ("destinatario_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "soporte_mensajes" ADD CONSTRAINT "soporte_mensajes_ticket_id_soporte_tickets_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "soporte_tickets"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "soporte_mensajes" ADD CONSTRAINT "soporte_mensajes_autor_id_users_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "soporte_tickets" ADD CONSTRAINT "soporte_tickets_afiliado_id_users_id_fkey" FOREIGN KEY ("afiliado_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "soporte_tickets" ADD CONSTRAINT "soporte_tickets_admin_asignado_id_users_id_fkey" FOREIGN KEY ("admin_asignado_id") REFERENCES "users"("id") ON DELETE SET NULL;