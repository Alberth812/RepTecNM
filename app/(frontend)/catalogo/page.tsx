"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X, ChevronDown, ChevronUp, User, Briefcase, MapPin, GraduationCap, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ModalEnviarMensaje } from "@/components/mensajes/ModalEnviarMensaje";

interface AfiliadoCatalogo {
  userId: string;
  nombreCompleto: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  estadoResidencia: string;
  ciudadResidencia: string;
  areaConocimiento: string[];
  perfilProfesional: string;
  tipoServicios: string[];
  descripcionServicios: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const estadosDisponibles = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

const areasConocimiento = [
  "Ciencias Agropecuarias", "Ciencias de la Salud", "Ciencias Económico Administrativas",
  "Ciencias Sociales y Humanidades", "Educación", "Ingeniería y Tecnología", "Ciencias Naturales y Exactas"
];

const tiposServicios = [
  "Consultoría", "Asesoría Técnica", "Capacitación", "Investigación",
  "Desarrollo de Proyectos", "Auditoría", "Docencia"
];

export default function CatalogoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [afiliados, setAfiliados] = useState<AfiliadoCatalogo[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 25, total: 0, totalPages: 0 });
  const [cargando, setCargando] = useState(true);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false); // CONTRAÍDO POR DEFECTO

  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [tipoPosgradoFilter, setTipoPosgradoFilter] = useState({ maestria: false, doctorado: false });
  const [areasSelected, setAreasSelected] = useState<string[]>([]);
  const [serviciosSelected, setServiciosSelected] = useState<string[]>([]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [destinatarioActual, setDestinatarioActual] = useState<{ id: string; nombre: string } | null>(null);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setEstadoFilter(searchParams.get("estado") || "");
    
    const tipoPosgrado = searchParams.get("tipoPosgrado");
    if (tipoPosgrado) {
      const tipos = tipoPosgrado.split(",");
      setTipoPosgradoFilter({
        maestria: tipos.includes("maestria"),
        doctorado: tipos.includes("doctorado")
      });
    }
    
    setAreasSelected(searchParams.getAll("areaConocimiento"));
    setServiciosSelected(searchParams.getAll("tipoServicios"));
    
    cargarCatalogo();
  }, [searchParams]);

  const cargarCatalogo = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (estadoFilter) params.set("estado", estadoFilter);
      
      const posgradosActivos = [];
      if (tipoPosgradoFilter.maestria) posgradosActivos.push("maestria");
      if (tipoPosgradoFilter.doctorado) posgradosActivos.push("doctorado");
      if (posgradosActivos.length > 0) {
        params.set("tipoPosgrado", posgradosActivos.join(","));
      }
      
      areasSelected.forEach(area => params.append("areaConocimiento", area));
      serviciosSelected.forEach(servicio => params.append("tipoServicios", servicio));
      
      const page = searchParams.get("page") || "1";
      params.set("page", page);
      params.set("limit", "25");

      const hasActiveFilters = Boolean(
        search || estadoFilter || posgradosActivos.length > 0 || 
        areasSelected.length > 0 || serviciosSelected.length > 0
      );
      
      if (!hasActiveFilters) {
        params.set("random", "true");
      } else {
        params.delete("random");
      }

      const res = await fetch(`/api/catalogo?${params.toString()}`);
      const data = await res.json();
      
      if (data && data.data !== undefined) {
        setAfiliados(data.data);
        setPagination(data.pagination || { page: 1, limit: 25, total: 0, totalPages: 0 });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams);
    params.set("search", value);
    params.set("page", "1");
    router.push(`/catalogo?${params.toString()}`, { scroll: false });
  };

  const limpiarFiltros = () => {
    setSearch("");
    setEstadoFilter("");
    setTipoPosgradoFilter({ maestria: false, doctorado: false });
    setAreasSelected([]);
    setServiciosSelected([]);
    router.push("/catalogo?random=true", { scroll: false });
  };

  const handleEnviarMensaje = (afiliadoId: string, nombre: string) => {
    setDestinatarioActual({ id: afiliadoId, nombre });
    setModalAbierto(true);
  };

  const contarFiltrosActivos = () => {
    let count = 0;
    if (estadoFilter) count++;
    if (tipoPosgradoFilter.maestria || tipoPosgradoFilter.doctorado) count++;
    if (areasSelected.length > 0) count++;
    if (serviciosSelected.length > 0) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header Institucional */}
      <div className="bg-gradient-to-r from-[#004B87] to-[#003a68] text-white py-12 shadow-lg">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-5xl font-bold mb-3 tracking-tight">Catálogo de Profesionales</h1>
          <p className="text-xl text-blue-100 font-light">
            Conecta con egresados de posgrado del TecNM según tus necesidades
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Barra de Búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="Buscar por nombre, palabra clave o perfil profesional..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-14 text-lg bg-white border-2 border-slate-200 focus:border-[#004B87] shadow-sm rounded-lg"
            />
          </div>
        </div>

        {/* Panel de Filtros - CONTRAÍDO POR DEFECTO */}
        <Card className="mb-8 border-2 border-slate-200 shadow-sm">
          <div 
            className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
          >
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-[#004B87]" />
              <h2 className="text-lg font-semibold text-slate-900">Filtros de Búsqueda</h2>
              {contarFiltrosActivos() > 0 && (
                <Badge className="bg-[#004B87] text-white ml-2">
                  {contarFiltrosActivos()} activo{contarFiltrosActivos() > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              {contarFiltrosActivos() > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    limpiarFiltros();
                  }}
                  className="text-sm text-slate-600 hover:text-[#004B87]"
                >
                  <X className="h-4 w-4 mr-1" /> Limpiar
                </Button>
              )}
              <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${filtrosAbiertos ? 'rotate-180' : ''}`} />
            </div>
          </div>
          
          {filtrosAbiertos && (
            <CardContent className="px-6 pb-6 space-y-6 border-t border-slate-200 pt-6">
              {/* Estado de Residencia */}
              <div>
                <Label className="text-sm font-semibold mb-2 flex items-center gap-2 text-slate-700">
                  <MapPin className="h-4 w-4 text-[#004B87]" /> Estado de Residencia
                </Label>
                <Select value={estadoFilter} onValueChange={(value) => {
                  const params = new URLSearchParams(searchParams);
                  if (value) { params.set("estado", value); setEstadoFilter(value); } 
                  else { params.delete("estado"); setEstadoFilter(""); }
                  params.set("page", "1");
                  router.push(`/catalogo?${params.toString()}`, { scroll: false });
                }}>
                  <SelectTrigger className="w-full md:w-72">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    {estadosDisponibles.map(estado => <SelectItem key={estado} value={estado}>{estado}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Tipo de Posgrado */}
              <div>
                <Label className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-700">
                  <GraduationCap className="h-4 w-4 text-[#004B87]" /> Tipo de Posgrado
                </Label>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="maestria" checked={tipoPosgradoFilter.maestria} onCheckedChange={(checked) => {
                      const nuevo = { ...tipoPosgradoFilter, maestria: checked as boolean };
                      setTipoPosgradoFilter(nuevo);
                      const params = new URLSearchParams(searchParams);
                      params.delete("tipoPosgrado");
                      const activos = [];
                      if (nuevo.maestria) activos.push("maestria");
                      if (nuevo.doctorado) activos.push("doctorado");
                      if (activos.length > 0) params.set("tipoPosgrado", activos.join(","));
                      params.set("page", "1");
                      router.push(`/catalogo?${params.toString()}`, { scroll: false });
                    }} />
                    <Label htmlFor="maestria" className="cursor-pointer text-slate-700">Maestría</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="doctorado" checked={tipoPosgradoFilter.doctorado} onCheckedChange={(checked) => {
                      const nuevo = { ...tipoPosgradoFilter, doctorado: checked as boolean };
                      setTipoPosgradoFilter(nuevo);
                      const params = new URLSearchParams(searchParams);
                      params.delete("tipoPosgrado");
                      const activos = [];
                      if (nuevo.maestria) activos.push("maestria");
                      if (nuevo.doctorado) activos.push("doctorado");
                      if (activos.length > 0) params.set("tipoPosgrado", activos.join(","));
                      params.set("page", "1");
                      router.push(`/catalogo?${params.toString()}`, { scroll: false });
                    }} />
                    <Label htmlFor="doctorado" className="cursor-pointer text-slate-700">Doctorado</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Áreas de Conocimiento */}
              <div>
                <Label className="text-sm font-semibold mb-3 block text-slate-700">Áreas de Conocimiento</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {areasConocimiento.map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox id={`area-${area}`} checked={areasSelected.includes(area)} onCheckedChange={(checked) => {
                        const nuevas = checked ? [...areasSelected, area] : areasSelected.filter(a => a !== area);
                        setAreasSelected(nuevas);
                        const params = new URLSearchParams(searchParams);
                        params.delete("areaConocimiento");
                        nuevas.forEach(a => params.append("areaConocimiento", a));
                        params.set("page", "1");
                        router.push(`/catalogo?${params.toString()}`, { scroll: false });
                      }} />
                      <Label htmlFor={`area-${area}`} className="text-sm cursor-pointer flex-1 text-slate-700">{area}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Tipos de Servicios */}
              <div>
                <Label className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-700">
                  <Briefcase className="h-4 w-4 text-[#004B87]" /> Tipos de Servicios
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tiposServicios.map((servicio) => (
                    <div key={servicio} className="flex items-center space-x-2">
                      <Checkbox id={`servicio-${servicio}`} checked={serviciosSelected.includes(servicio)} onCheckedChange={(checked) => {
                        const nuevos = checked ? [...serviciosSelected, servicio] : serviciosSelected.filter(s => s !== servicio);
                        setServiciosSelected(nuevos);
                        const params = new URLSearchParams(searchParams);
                        params.delete("tipoServicios");
                        nuevos.forEach(s => params.append("tipoServicios", s));
                        params.set("page", "1");
                        router.push(`/catalogo?${params.toString()}`, { scroll: false });
                      }} />
                      <Label htmlFor={`servicio-${servicio}`} className="text-sm cursor-pointer flex-1 text-slate-700">{servicio}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200 mt-6">
                <Button variant="outline" onClick={limpiarFiltros} className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-[#004B87]">
                  <X className="h-4 w-4 mr-2" /> Limpiar todos los filtros
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Resultados */}
        {cargando ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004B87]"></div>
          </div>
        ) : afiliados.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-slate-300 bg-slate-50">
            <User className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No se encontraron resultados</h3>
            <p className="text-slate-600 mb-4">Intenta ajustar los filtros o los términos de búsqueda.</p>
            <Button onClick={limpiarFiltros} variant="outline" className="text-[#004B87] border-[#004B87] hover:bg-[#004B87] hover:text-white">
              Mostrar todos los perfiles
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {afiliados.map((afiliado) => (
                <Card key={afiliado.userId} className="hover:shadow-xl transition-all duration-300 border-t-4 border-t-[#004B87] bg-white group">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl text-[#004B87] font-bold group-hover:text-[#003a68] transition-colors">
                      {afiliado.nombres} {afiliado.apellidoPaterno} {afiliado.apellidoMaterno}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary" className="bg-blue-50 text-[#004B87] border border-blue-200">
                        <MapPin className="h-3 w-3 mr-1" />
                        {afiliado.estadoResidencia}
                      </Badge>
                      {afiliado.areaConocimiento?.slice(0, 2).map((area, idx) => (
                        <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-700">{area}</Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">{afiliado.perfilProfesional}</p>
                    {afiliado.tipoServicios?.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Servicios:</p>
                        <div className="flex flex-wrap gap-1">
                          {afiliado.tipoServicios.slice(0, 3).map((servicio, idx) => (
                            <span key={idx} className="text-xs bg-[#004B87]/10 text-[#004B87] px-2 py-1 rounded font-medium">
                              {servicio}
                            </span>
                          ))}
                          {afiliado.tipoServicios.length > 3 && (
                            <span className="text-xs text-slate-500">+{afiliado.tipoServicios.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}
                    <Button 
                      onClick={() => handleEnviarMensaje(afiliado.userId, afiliado.nombreCompleto)}
                      className="w-full bg-[#004B87] hover:bg-[#003a68] shadow-sm hover:shadow-md transition-all"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Enviar Mensaje
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 py-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", (pagination.page - 1).toString());
                    router.push(`/catalogo?${params.toString()}`, { scroll: false });
                  }}
                  disabled={pagination.page === 1}
                  className="border-slate-300"
                >
                  Anterior
                </Button>
                <span className="text-sm text-slate-600 font-medium">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", (pagination.page + 1).toString());
                    router.push(`/catalogo?${params.toString()}`, { scroll: false });
                  }}
                  disabled={pagination.page === pagination.totalPages}
                  className="border-slate-300"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Mensaje */}
      {modalAbierto && destinatarioActual && (
        <ModalEnviarMensaje
          destinatarioId={destinatarioActual.id}
          destinatarioNombre={destinatarioActual.nombre}
          isOpen={modalAbierto}
          onClose={() => {
            setModalAbierto(false);
            setDestinatarioActual(null);
          }}
        />
      )}
    </div>
  );
}
