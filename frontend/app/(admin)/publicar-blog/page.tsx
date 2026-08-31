"use client";

import { useState, useEffect } from "react";
import { Upload, Link as LinkIcon, Save, X, ArrowLeft, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

// Función auxiliar para obtener el token CSRF de las cookies
const getCookie = (name: string) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

interface Publicacion {
  id: number;
  folio: string;
  titulo: string;
  subtitulo: string;
  tipo: string;
  estado: string;
  contenido: string;
  imagen_url: string | null;
  link_destacado: string;
  texto_boton_link: string;
  fecha_publicacion: string;
}

type Vista = "lista" | "formulario";

export default function GestionBlogPage() {
  const [vista, setVista] = useState<Vista>("lista");
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [folioActual, setFolioActual] = useState<string>("");
  const [loadingForm, setLoadingForm] = useState(false);
  const [imagenPreview, setImagenPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    titulo: "",
    subtitulo: "",
    tipo: "noticia",
    estado: "borrador",
    contenido: "",
    link_destacado: "",
    texto_boton_link: "Ver más"});
  const [imagenFile, setImagenFile] = useState<File | null>(null);

  const cargarPublicaciones = async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/blog/publicaciones/", { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const lista = Array.isArray(data) ? data : data.results || [];
        setPublicaciones(lista);
      } else {
        toast.error("Error al cargar publicaciones");
      }
    } catch (error) {
      console.error("Error fetching publicaciones:", error);
      toast.error("No se pudieron cargar las publicaciones");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (vista === "lista") {
      cargarPublicaciones();
    }
  }, [vista]);

  const handleEditar = (pub: Publicacion) => {
    setEditandoId(pub.id);
    setFolioActual(pub.folio);
    setFormData({
      titulo: pub.titulo,
      subtitulo: pub.subtitulo || "",
      tipo: pub.tipo,
      estado: pub.estado,
      contenido: pub.contenido,
      link_destacado: pub.link_destacado || "",
      texto_boton_link: pub.texto_boton_link || "Ver más"});
    setImagenPreview(pub.imagen_url || "");
    setImagenFile(null);
    setVista("formulario");
  };

  const handleNuevo = () => {
    setEditandoId(null);
    setFolioActual("");
    setFormData({
      titulo: "",
      subtitulo: "",
      tipo: "noticia",
      estado: "borrador",
      contenido: "",
      link_destacado: "",
      texto_boton_link: "Ver más"});
    setImagenPreview("");
    setImagenFile(null);
    setVista("formulario");
  };

  const handleEliminar = async (id: number, titulo: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${titulo}"?`)) return;
    try {
      const csrftoken = getCookie('csrftoken');
      const res = await fetch(`/api/blog/publicaciones/${id}/`, { 
        method: "DELETE",
        credentials: 'include',
        headers: { 'X-CSRFToken': csrftoken || '' }
      });
      if (res.ok) {
        toast.success("Publicación eliminada");
        cargarPublicaciones();
      } else {
        toast.error("Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleSubmit = async (estadoFinal: "borrador" | "publicado") => {
    if (!formData.titulo.trim()) {
      toast.error("El título es obligatorio.");
      return;
    }

    setLoadingForm(true);
    const data = new FormData();
    data.append("titulo", formData.titulo);
    data.append("subtitulo", formData.subtitulo);
    data.append("tipo", formData.tipo);
    data.append("estado", estadoFinal);
    data.append("contenido", formData.contenido);
    data.append("link_destacado", formData.link_destacado);
    data.append("texto_boton_link", formData.texto_boton_link);
    
    if (imagenFile) {
      data.append("imagen_principal", imagenFile);
    }

    try {
      const url = editandoId ? `/api/blog/publicaciones/${editandoId}/` : "/api/blog/publicaciones/";
      const method = editandoId ? "PATCH" : "POST";
      const csrftoken = getCookie('csrftoken');
      
      const response = await fetch(url, { 
        method, 
        body: data,
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrftoken || ''}
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del servidor:", response.status, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (editandoId) {
        toast.success("Publicación actualizada");
      } else {
        toast.success(`Publicación creada. Folio: ${result.folio}`);
      }
      
      setVista("lista");
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setLoadingForm(false);
    }
  };

  const publicacionesFiltradas = publicaciones.filter(p => 
    p.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
    (p.folio && p.folio.toLowerCase().includes(busqueda.toLowerCase()))
  );

  if (vista === "lista") {
    return (
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#004B87]">Gestión de Publicaciones</h1>
            <p className="text-muted-foreground">Administra el contenido del blog.</p>
          </div>
          <Button onClick={handleNuevo} className="bg-[#004B87] hover:bg-[#003562]">
            <Upload className="mr-2 h-4 w-4" /> Nueva Publicación
          </Button>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o folio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Folio</th>
                  <th className="px-4 py-3 text-left font-medium">Título</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Fecha</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cargando ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Cargando publicaciones...</td></tr>
                ) : publicacionesFiltradas.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No se encontraron publicaciones.</td></tr>
                ) : (
                  publicacionesFiltradas.map((pub) => (
                    <tr key={pub.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{pub.folio || "Pendiente"}</td>
                      <td className="px-4 py-3 font-medium">{pub.titulo}</td>
                      <td className="px-4 py-3 capitalize">{pub.tipo}</td>
                      <td className="px-4 py-3">
                        <Badge variant={pub.estado === "publicado" ? "default" : "secondary"} className={pub.estado === "publicado" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""}>
                          {pub.estado}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {pub.fecha_publicacion ? new Date(pub.fecha_publicacion).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditar(pub)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleEliminar(pub.id, pub.titulo)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setVista("lista")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#004B87]">
            {editandoId ? `Editar Publicación` : "Nueva Publicación"}
          </h1>
          {folioActual && <p className="text-sm text-muted-foreground font-mono">Folio: {folioActual}</p>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} placeholder="Ej: Convocatoria 2026" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitulo">Subtítulo <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Input id="subtitulo" value={formData.subtitulo} onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })} placeholder="Breve descripción" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="noticia">Noticia</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="reunion">Reunión</SelectItem>
                  <SelectItem value="curiosidad">Curiosidad</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => { if (value === "borrador" || value === "publicado") setFormData({ ...formData, estado: value }) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="publicado">Publicado</SelectItem>
                  <SelectItem value="borrador">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Contenido <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <RichTextEditor 
              content={formData.contenido}
              onChange={(html) => setFormData({ ...formData, contenido: html })}
              placeholder="Escribe el contenido de la publicación aquí..."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Imagen <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-4 hover:bg-muted/50">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{imagenFile ? imagenFile.name : (imagenPreview ? "Cambiar imagen" : "Subir imagen")}</span>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { setImagenFile(file); setImagenPreview(URL.createObjectURL(file)); }
              }} />
            </label>
            {imagenPreview && (
              <div className="mt-2 overflow-hidden rounded-lg border relative group">
                <img src={imagenPreview} alt="Preview" className="h-48 w-full object-cover" />
                <button onClick={() => { setImagenFile(null); setImagenPreview(""); }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Link Destacado <span className="text-muted-foreground text-xs font-normal">(opcional)</span></h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>URL del enlace</Label>
                <Input 
                  placeholder="https://youtube.com/..., https://drive.google.com/..., etc." 
                  value={formData.link_destacado}
                  onChange={(e) => setFormData({ ...formData, link_destacado: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Texto del botón</Label>
                <Input 
                  placeholder="Ver más, Descargar, Ver video, etc." 
                  value={formData.texto_boton_link}
                  onChange={(e) => setFormData({ ...formData, texto_boton_link: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t pt-6">
        <Button variant="outline" onClick={() => handleSubmit("borrador")} disabled={loadingForm}>
          <Save className="mr-2 h-4 w-4" /> Guardar Borrador
        </Button>
        <Button onClick={() => handleSubmit("publicado")} disabled={loadingForm} className="bg-[#004B87] hover:bg-[#003562]">
          {loadingForm ? "Guardando..." : (editandoId ? "Actualizar" : "Publicar")}
        </Button>
      </div>
    </div>
  );
}
