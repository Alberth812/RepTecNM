"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Eye, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

interface Publicacion {
  id: number;
  titulo: string;
  subtitulo: string;
  tipo: string;
  estado: string;
  es_destacada: boolean;
  contenido: string;
  imagen_url: string | null;
  autor_nombre: string;
  fecha_publicacion: string;
  fecha_creacion: string;
}

export default function AdminPublicacionesPage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  useEffect(() => {
    cargarPublicaciones();
  }, []);

  const cargarPublicaciones = async () => {
    try {
      const response = await fetch("/api/blog/publicaciones/");
      if (!response.ok) throw new Error("Error al cargar");
      const data = await response.json();
      setPublicaciones(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudieron cargar las publicaciones");
    } finally {
      setLoading(false);
    }
  };

  const eliminarPublicacion = async (id: number, titulo: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${titulo}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/publicaciones/${id}/`, {
        method: "DELETE",
        credentials: "include"});

      if (!response.ok) {
        if (response.status === 403) {
          toast.error("No tienes permisos para eliminar esta publicación");
          return;
        }
        throw new Error("Error al eliminar");
      }

      setPublicaciones(publicaciones.filter(p => p.id !== id));
      toast.success("Publicación eliminada correctamente");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar la publicación");
    }
  };

  const publicacionesFiltradas = publicaciones.filter(pub => {
    const coincideBusqueda = pub.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                            pub.subtitulo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === "todos" || pub.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  const getColorEstado = (estado: string) => {
    return estado === "publicado" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
  };

  const getColorTipo = (tipo: string) => {
    const colores: Record<string, string> = {
      'evento': 'bg-purple-100 text-purple-800',
      'reunion': 'bg-blue-100 text-blue-800',
      'curiosidad': 'bg-green-100 text-green-800',
      'noticia': 'bg-red-100 text-red-800'};
    return colores[tipo] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Publicaciones</h1>
          <p className="text-muted-foreground mt-1">Administra el contenido del blog</p>
        </div>
        <Link href="/publicar-blog">
          <Button className="bg-[#004B87] hover:bg-[#003562]">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Publicación
          </Button>
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o subtítulo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="todos">Todos los estados</option>
          <option value="publicado">Publicados</option>
          <option value="borrador">Borradores</option>
        </select>
      </div>

      {/* Lista de publicaciones */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#004B87] border-t-transparent"></div>
        </div>
      ) : publicacionesFiltradas.length === 0 ? (
        <div className="text-center py-20 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">No hay publicaciones que coincidan con los filtros</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {publicacionesFiltradas.map((pub) => (
            <div
              key={pub.id}
              className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Imagen miniatura */}
                {pub.imagen_url ? (
                  <img
                    src={pub.imagen_url}
                    alt={pub.titulo}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">Sin imagen</span>
                  </div>
                )}

                {/* Información */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-lg truncate">{pub.titulo}</h3>
                      {pub.subtitulo && (
                        <p className="text-sm text-muted-foreground truncate">{pub.subtitulo}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorEstado(pub.estado)}`}>
                        {pub.estado}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorTipo(pub.tipo)}`}>
                        {pub.tipo}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>{pub.autor_nombre || "Admin"}</span>
                      <span>•</span>
                      <span>{new Date(pub.fecha_creacion).toLocaleDateString('es-MX')}</span>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex gap-2">
                      <Link href={`/admin/publicaciones/${pub.id}/ver`}>
                        <Button variant="outline" size="sm" title="Ver">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/publicaciones/${pub.id}/editar`}>
                        <Button variant="outline" size="sm" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => eliminarPublicacion(pub.id, pub.titulo)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground pt-4">
        Mostrando {publicacionesFiltradas.length} de {publicaciones.length} publicaciones
      </div>
    </div>
  );
}
