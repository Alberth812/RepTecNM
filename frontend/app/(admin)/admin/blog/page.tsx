"use client";

import { useState, useEffect } from "react";
import { Upload, Video, Globe, FileText, Save, Pencil, Trash2, Eye, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Publicacion {
  id: number;
  titulo: string;
  subtitulo: string;
  tipo: string;
  estado: string;
  contenido: string;
  imagen_url: string | null;
  archivo_pdf_url: string | null;
  link_youtube: string;
  link_facebook: string;
  link_drive: string;
  link_personalizado: string;
  texto_boton_link: string;
  autor_nombre: string;
  fecha_creacion: string;
}

type Vista = 'crear' | 'listar' | 'editar';

export default function AdminBlogPage() {
  const [vista, setVista] = useState<Vista>('listar');
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [publicacionEditando, setPublicacionEditando] = useState<Publicacion | null>(null);
  
  const [formData, setFormData] = useState({
    titulo: "", subtitulo: "", tipo: "noticia", estado: "borrador", contenido: "",
    imagen: null as File | null, archivo_pdf: null as File | null,
    link_youtube: "", link_facebook: "", link_drive: "", link_personalizado: "",
    texto_boton_link: "Ver más"});
  
  const [imagenPreview, setImagenPreview] = useState<string>("");
  const [pdfActual, setPdfActual] = useState<string>("");

  useEffect(() => { if (vista === 'listar') cargarPublicaciones(); }, [vista]);

  const cargarPublicaciones = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/blog/publicaciones/");
      if (!response.ok) throw new Error("Error");
      setPublicaciones(await response.json());
    } catch (error) {
      toast.error("No se pudieron cargar las publicaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imagen: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagenPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, archivo_pdf: file });
      setPdfActual(URL.createObjectURL(file));
    } else if (file) {
      toast.error("Solo se permiten archivos PDF");
    }
  };

  const resetForm = () => {
    setFormData({ titulo: "", subtitulo: "", tipo: "noticia", estado: "borrador", contenido: "", imagen: null, archivo_pdf: null, link_youtube: "", link_facebook: "", link_drive: "", link_personalizado: "", texto_boton_link: "Ver más" });
    setImagenPreview(""); setPdfActual(""); setPublicacionEditando(null);
  };

  const handleSubmit = async (estado: string) => {
    if (!formData.titulo || !formData.contenido) {
      toast.error("El título y el contenido son obligatorios");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("titulo", formData.titulo);
    data.append("subtitulo", formData.subtitulo);
    data.append("tipo", formData.tipo);
    data.append("estado", estado);
    data.append("contenido", formData.contenido);
    
    // CLAVE: Estos nombres deben coincidir EXACTAMENTE con el modelo de Django
    if (formData.imagen) data.append("imagen_principal", formData.imagen);
    if (formData.archivo_pdf) data.append("archivo_pdf", formData.archivo_pdf);
    
    data.append("link_youtube", formData.link_youtube);
    data.append("link_facebook", formData.link_facebook);
    data.append("link_drive", formData.link_drive);
    data.append("link_personalizado", formData.link_personalizado);
    data.append("texto_boton_link", formData.texto_boton_link);
    data.append("orden_destacado", "0");

    try {
      const url = publicacionEditando ? `/api/blog/publicaciones/${publicacionEditando.id}/` : "/api/blog/publicaciones/";
      const method = publicacionEditando ? "PUT" : "POST";
      
      const response = await fetch(url, { method, body: data, credentials: "include" });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del servidor:", response.status, errorText);
        throw new Error(`Error ${response.status}`);
      }

      toast.success(publicacionEditando ? "Publicación actualizada" : "Publicación creada");
      resetForm();
      setVista('listar');
    } catch (error) {
      toast.error("Error al guardar. Revisa la consola (F12).");
    } finally {
      setLoading(false);
    }
  };

  const editarPublicacion = (pub: Publicacion) => {
    setPublicacionEditando(pub);
    setFormData({
      titulo: pub.titulo, subtitulo: pub.subtitulo, tipo: pub.tipo, estado: pub.estado, contenido: pub.contenido,
      imagen: null, archivo_pdf: null, link_youtube: pub.link_youtube || "", link_facebook: pub.link_facebook || "",
      link_drive: pub.link_drive || "", link_personalizado: pub.link_personalizado || "", texto_boton_link: pub.texto_boton_link || "Ver más"});
    if (pub.imagen_url) setImagenPreview(pub.imagen_url);
    if (pub.archivo_pdf_url) setPdfActual(pub.archivo_pdf_url);
    setVista('editar');
  };

  const eliminarPublicacion = async (id: number, titulo: string) => {
    if (!confirm(`¿Eliminar "${titulo}"?`)) return;
    try {
      const response = await fetch(`/api/blog/publicaciones/${id}/`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Error");
      toast.success("Publicación eliminada");
      cargarPublicaciones();
    } catch (error) {
      toast.error("No se pudo eliminar");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión del Blog</h1>
        <div className="flex gap-2">
          <Button variant={vista === 'listar' ? 'default' : 'outline'} onClick={() => { resetForm(); setVista('listar'); }}>
            <Eye className="mr-2 h-4 w-4" /> Ver Publicaciones
          </Button>
          <Button variant={vista === 'crear' ? 'default' : 'outline'} onClick={() => { resetForm(); setVista('crear'); }} className="bg-[#004B87] hover:bg-[#003562]">
            <Upload className="mr-2 h-4 w-4" /> Nueva Publicación
          </Button>
        </div>
      </div>

      {(vista === 'crear' || vista === 'editar') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{vista === 'crear' ? 'Crear Nueva Publicación' : 'Editar Publicación'}</h2>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { resetForm(); setVista('listar'); }}><X className="mr-2 h-4 w-4" /> Cancelar</Button>
              <Button onClick={() => handleSubmit("borrador")} disabled={loading}><Save className="mr-2 h-4 w-4" /> Guardar Borrador</Button>
              <Button onClick={() => handleSubmit("publicado")} disabled={loading} className="bg-[#004B87] hover:bg-[#003562]">{loading ? "Guardando..." : "Publicar"}</Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card><CardContent className="pt-6 space-y-4">
                <div><label className="block text-sm font-medium mb-2">Título *</label><Input value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-2">Subtítulo</label><Input value={formData.subtitulo} onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-2">Contenido *</label><Textarea value={formData.contenido} onChange={(e) => setFormData({ ...formData, contenido: e.target.value })} rows={10} /></div>
              </CardContent></Card>

              <Card><CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold mb-4">Archivos y Links</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Archivo PDF (opcional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {pdfActual ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><File className="h-5 w-5 text-red-600" /><span className="text-sm">PDF cargado</span></div>
                        <Button variant="outline" size="sm" onClick={() => { setPdfActual(""); setFormData({...formData, archivo_pdf: null}); }}>Quitar</Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block text-center">
                        <File className="h-8 w-8 text-gray-400 mx-auto mb-2" /><span className="text-sm text-gray-600">Click para subir PDF</span>
                        <input type="file" accept="application/pdf" onChange={handlePdfChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3"><Video className="h-5 w-5 text-red-600 mt-2" /><Input value={formData.link_youtube} onChange={(e) => setFormData({ ...formData, link_youtube: e.target.value })} placeholder="Link a YouTube" /></div>
                  <div className="flex gap-3"><Globe className="h-5 w-5 text-blue-600 mt-2" /><Input value={formData.link_facebook} onChange={(e) => setFormData({ ...formData, link_facebook: e.target.value })} placeholder="Link a Facebook" /></div>
                  <div><label className="block text-sm font-medium mb-2 mt-4">Texto del botón</label><Input value={formData.texto_boton_link} onChange={(e) => setFormData({ ...formData, texto_boton_link: e.target.value })} /></div>
                </div>
              </CardContent></Card>
            </div>

            <div className="space-y-6">
              <Card><CardContent className="pt-6 space-y-4">
                <div><label className="block text-sm font-medium mb-2">Tipo</label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evento">Evento</SelectItem><SelectItem value="reunion">Reunión</SelectItem><SelectItem value="curiosidad">Curiosidad</SelectItem><SelectItem value="noticia">Noticia</SelectItem><SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><label className="block text-sm font-medium mb-2">Estado</label>
                  <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="borrador">Borrador</SelectItem><SelectItem value="publicado">Publicado</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Imagen principal</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {imagenPreview ? (
                      <div className="space-y-2">
                        <img src={imagenPreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                        <Button variant="outline" size="sm" onClick={() => { setImagenPreview(""); setFormData({ ...formData, imagen: null }); }}>Quitar imagen</Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" /><span className="text-sm text-gray-600">Subir imagen</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </CardContent></Card>
            </div>
          </div>
        </div>
      )}

      {vista === 'listar' && (
        <div>
          {loading ? (<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#004B87] border-t-transparent"></div></div>) : publicaciones.length === 0 ? (
            <div className="text-center py-20 bg-muted/50 rounded-lg"><p className="text-muted-foreground">No hay publicaciones</p></div>
          ) : (
            <div className="grid gap-4">
              {publicaciones.map((pub) => (
                <Card key={pub.id} className="p-4">
                  <div className="flex items-start gap-4">
                    {pub.imagen_url ? (<img src={pub.imagen_url} alt={pub.titulo} className="w-24 h-24 object-cover rounded" />) : (<div className="w-24 h-24 bg-muted rounded flex items-center justify-center"><span className="text-xs text-muted-foreground">Sin imagen</span></div>)}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div><h3 className="font-semibold text-lg">{pub.titulo}</h3><p className="text-sm text-muted-foreground">{pub.subtitulo}</p></div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${pub.estado === 'publicado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{pub.estado}</span>
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{pub.tipo}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{pub.autor_nombre || "Admin"} • {new Date(pub.fecha_creacion).toLocaleDateString('es-MX')}</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => editarPublicacion(pub)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="outline" size="sm" onClick={() => eliminarPublicacion(pub.id, pub.titulo)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
