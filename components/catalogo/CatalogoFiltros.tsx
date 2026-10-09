"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X, MapPin, GraduationCap, Briefcase, Sparkles, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const ESTADOS = [
  "Aguascalientes","Baja California","Baja California Sur","Campeche",
  "Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima",
  "Durango","Guanajuato","Guerrero","Hidalgo","Jalisco","México",
  "Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla",
  "Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora",
  "Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas",
];
const POSGRADOS = [
  { value: "MAESTRIA", label: "Maestría" },
  { value: "DOCTORADO", label: "Doctorado" },
];

interface CatalogoFiltrosProps {
  facets: { areas: string[]; servicios: string[] };
}

export function CatalogoFiltros({ facets }: CatalogoFiltrosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filtrosAbiertos, setFiltrosAbiertos] = useState(true);

  //  Estados locales para respuesta instantánea al clic 
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [posgrado, setPosgrado] = useState("");
  const [area, setArea] = useState("");
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([]);

  // Sincronizar estados locales con la URL al cargar o cambiar filtros
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setEstado(searchParams.get("estado") || "");
    setPosgrado(searchParams.get("tipoPosgrado") || "");
    setArea(searchParams.getAll("areaConocimiento")[0] || "");
    setServiciosSeleccionados(searchParams.getAll("tipoServicios"));
  }, [searchParams]);

  // Toggle de un servicio (agregar o quitar)
  const toggleServicio = (servicio: string) => {
    setServiciosSeleccionados((prev) =>
      prev.includes(servicio)
        ? prev.filter((s) => s !== servicio)
        : [...prev, servicio]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (estado) p.set("estado", estado);
    if (posgrado) p.set("tipoPosgrado", posgrado);
    if (area) p.set("areaConocimiento", area);
    serviciosSeleccionados.forEach((s) => p.append("tipoServicios", s));
    router.push(`${pathname}?${p.toString()}`);
  };

  const handleClear = () => {
    setSearch("");
    setEstado("");
    setPosgrado("");
    setArea("");
    setServiciosSeleccionados([]);
    router.push(pathname);
  };

  const hasActiveFilters = searchParams.toString().length > 0;

  return (
    <div className="mb-10">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004B87] via-[#005a9e] to-[#0066b3] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Filtrar Profesionales</h2>
                <p className="text-xs text-white/80 mt-0.5">Refina tu búsqueda con los criterios disponibles</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-white hover:bg-white/20 border border-white/30"
                >
                  <X className="h-4 w-4 mr-1" /> Limpiar
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                className="text-white hover:bg-white/20 border border-white/30"
              >
                {filtrosAbiertos ? (
                  <><ChevronUp className="h-4 w-4 mr-1" /> Ocultar</>
                ) : (
                  <><ChevronDown className="h-4 w-4 mr-1" /> Mostrar</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Contenido colapsable */}
        {filtrosAbiertos && (
          <div className="p-6 space-y-6">
            {/* Fila 1: Búsqueda y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#004B87]" />
                  Búsqueda libre
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nombre, perfil, palabra clave..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#004B87]/20 focus:border-[#004B87] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#004B87]" />
                  Estado de residencia
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#004B87]/20 focus:border-[#004B87] focus:bg-white transition-all"
                >
                  <option value="">Todos los estados</option>
                  {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>

            {/* Fila 2: Posgrado y Área */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#004B87]" />
                  Nivel de posgrado
                </label>
                <select
                  value={posgrado}
                  onChange={(e) => setPosgrado(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#004B87]/20 focus:border-[#004B87] focus:bg-white transition-all"
                >
                  <option value="">Cualquiera</option>
                  {POSGRADOS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#004B87]" />
                  Área de conocimiento
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#004B87]/20 focus:border-[#004B87] focus:bg-white transition-all"
                >
                  <option value="">Todas las áreas</option>
                  {facets.areas.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            {/* Fila 3: Servicios (Chips interactivos) */}
            {facets.servicios.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#004B87]" />
                  Tipo de servicio profesional
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {facets.servicios.map((servicio) => {
                    const estaSeleccionado = serviciosSeleccionados.includes(servicio);
                    return (
                      <button
                        key={servicio}
                        type="button"
                        onClick={() => toggleServicio(servicio)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border-2 transition-all duration-200 ${
                          estaSeleccionado
                            ? "bg-[#004B87] border-[#004B87] text-white shadow-md scale-[1.02]"
                            : "bg-white border-slate-300 text-slate-700 hover:border-[#004B87]/50 hover:bg-slate-50"
                        }`}
                      >
                        <div className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-all ${
                          estaSeleccionado ? "bg-white border-white" : "border-slate-400"
                        }`}>
                          {estaSeleccionado && <Check className="h-3 w-3 text-[#004B87]" strokeWidth={3} />}
                        </div>
                        <span className="text-sm font-medium">{servicio}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Botón Aplicar */}
            <div className="flex justify-end pt-5 border-t border-slate-200">
              <Button type="submit" className="h-11 px-8 bg-[#004B87] hover:bg-[#003a6b] text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                <Filter className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
