"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, MapPin, Briefcase, MessageSquare, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AfiliadoCatalogo {
  id: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  estadoResidencia: string;
  areaConocimiento: string[];
  tipoServicios: string[];
  fotografiaUrl?: string;
  autorizaPublicacion: boolean;
  correoPublico: boolean;
  telefonoPublico: boolean;
}

export default function CatalogoPage() {
  const [afiliados, setAfiliados] = useState<AfiliadoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [area, setArea] = useState("");
  const [rolUsuario, setRolUsuario] = useState<"visitante" | "afiliado" | "admin">("visitante");

  useEffect(() => {
    // Detectar rol del usuario
    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.rol === "ADMINISTRADOR") setRolUsuario("admin");
        else if (data?.user?.rol === "AFILIADO") setRolUsuario("afiliado");
      })
      .catch(() => setRolUsuario("visitante"));

    // Cargar catálogo
    const params = new URLSearchParams();
    if (busqueda) params.set("search", busqueda);
    if (estado) params.set("estado", estado);
    if (area) params.set("area", area);

    fetch(`/api/catalogo?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setAfiliados(data.afiliados || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [busqueda, estado, area]);

  const getNombreCompleto = (a: AfiliadoCatalogo) => {
    return `${a.nombres} ${a.apellidoPaterno} ${a.apellidoMaterno}`.trim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#004B87]">
          Catálogo de Profesionales
        </h1>
        <p className="mt-2 text-muted-foreground">
          {rolUsuario === "visitante"
            ? "Explora los perfiles de nuestros egresados de posgrado."
            : "Conecta con egresados de posgrado del TecNM según tus necesidades."}
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, área o servicio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger>
            <SelectValue placeholder="Estado de residencia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los estados</SelectItem>
            <SelectItem value="CDMX">Ciudad de México</SelectItem>
            <SelectItem value="Jalisco">Jalisco</SelectItem>
            <SelectItem value="Nuevo León">Nuevo León</SelectItem>
            {/* Agregar más estados según necesidad */}
          </SelectContent>
        </Select>
        <Select value={area} onValueChange={setArea}>
          <SelectTrigger>
            <SelectValue placeholder="Área de conocimiento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las áreas</SelectItem>
            <SelectItem value="Ingeniería">Ingeniería</SelectItem>
            <SelectItem value="Ciencias">Ciencias</SelectItem>
            <SelectItem value="Administración">Administración</SelectItem>
            {/* Agregar más áreas según necesidad */}
          </SelectContent>
        </Select>
      </div>

      {/* Resultados */}
      {afiliados.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No se encontraron perfiles con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {afiliados.map((afiliado) => (
            <Card key={afiliado.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Foto: solo para afiliados y admins */}
                {(rolUsuario === "afiliado" || rolUsuario === "admin") && afiliado.fotografiaUrl && (
                  <div className="mb-4 flex justify-center">
                    <img
                      src={afiliado.fotografiaUrl}
                      alt={getNombreCompleto(afiliado)}
                      className="h-24 w-24 rounded-full object-cover ring-2 ring-[#004B87]/20"
                    />
                  </div>
                )}

                {/* Nombre */}
                <h3 className="text-lg font-semibold text-center mb-2">
                  {getNombreCompleto(afiliado)}
                </h3>

                {/* Estado */}
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{afiliado.estadoResidencia}</span>
                </div>

                {/* Áreas de conocimiento */}
                {afiliado.areaConocimiento && afiliado.areaConocimiento.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Áreas de conocimiento:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {afiliado.areaConocimiento.slice(0, 3).map((area, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Servicios */}
                {afiliado.tipoServicios && afiliado.tipoServicios.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Servicios:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {afiliado.tipoServicios.slice(0, 3).map((servicio, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {servicio}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón de acción según rol */}
                <div className="flex gap-2 justify-center">
                  <Link href={`/catalogo/${afiliado.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver perfil
                    </Button>
                  </Link>

                  {/* Solo afiliados ACTIVOS pueden enviar mensajes */}
                  {rolUsuario === "afiliado" && (
                    <Link href={`/mensajeria?destinatario=${afiliado.id}`}>
                      <Button size="sm" className="bg-[#004B87] hover:bg-[#003a6b]">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contactar
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Nota para visitantes */}
                {rolUsuario === "visitante" && (
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Inicia sesión para ver el perfil completo y contactar.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
