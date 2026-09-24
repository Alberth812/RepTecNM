import { CatalogoGrid } from "@/components/catalogo/CatalogoGrid";

export default function CatalogoAfiliadoPage() {
  // TODO: Cargar afiliados desde la API
  const afiliados = [];
  
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-[#004B87] mb-2">Catálogo de Profesionales</h1>
      <p className="text-muted-foreground mb-8">Conecta con egresados de posgrado del TecNM.</p>
      <CatalogoGrid afiliados={afiliados} rolUsuario="afiliado" />
    </div>
  );
}
