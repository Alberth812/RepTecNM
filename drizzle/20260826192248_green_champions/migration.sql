CREATE TABLE "folios_anuales" (
	"anio" integer PRIMARY KEY,
	"ultimo_numero" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "afiliados" ADD COLUMN "folio" varchar(15);--> statement-breakpoint
ALTER TABLE "afiliados" ADD CONSTRAINT "afiliados_folio_key" UNIQUE("folio");