ALTER TABLE "posgrados" ALTER COLUMN "modalidad" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posgrados" ALTER COLUMN "dedicacion" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posgrados" ALTER COLUMN "becado" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posgrados" ALTER COLUMN "tiene_grado" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posgrados" ALTER COLUMN "estado_civil_inicio" DROP NOT NULL;