CREATE TYPE "institucion_estado" AS ENUM('ACTIVO', 'INACTIVO');--> statement-breakpoint
ALTER TABLE "administradores" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "instituciones" ADD COLUMN "estado" "institucion_estado" DEFAULT 'ACTIVO'::"institucion_estado" NOT NULL;--> statement-breakpoint
ALTER TABLE "instituciones" ADD COLUMN "last_changed_to_inactivo_at" timestamp with time zone;