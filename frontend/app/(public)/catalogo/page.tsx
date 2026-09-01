import Link from "next/link";
import { Construction, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CatalogoProximamentePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <Construction className="mb-6 h-16 w-16 text-[#004B87]/40" />
      <h1 className="font-serif text-3xl font-bold text-[#004B87]">
        Catálogo en Construcción
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Estamos trabajando para ofrecerte un catálogo completo de profesionales 
        afiliados. Próximamente podrás buscar y conectar con egresados de posgrado 
        del TecNM.
      </p>
      <Link href="/" className="mt-8">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
        </Button>
      </Link>
    </div>
  );
}
