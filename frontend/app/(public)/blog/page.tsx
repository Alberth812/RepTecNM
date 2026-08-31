"use client";
import { useState, useEffect } from "react";
import { Calendar, User, Video, Globe, FileText, ExternalLink, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Publicacion {
  id: number;
  folio: string | null;
  titulo: string;
  subtitulo: string;
  tipo: string;
  estado: string;
  contenido: string;
  imagen_url: string | null;
  link_personalizado: string | null; // <-- CAMBIO CLAVE: Usamos el nombre real del campo
  texto_boton_link: string;
  autor: number | null;
  fecha_publicacion: string;
  fecha_creacion: string;
}

export default function BlogPage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<Publicacion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog/publicaciones/")
      .then((res) => res.json())
      .then((data) => {
        setPublicaciones(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  // Detecta el ícono según la URL
  const getIconoLink = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return <Video className="h-4 w-4" />;
    if (url.includes("facebook.com")) return <Globe className="h-4 w-4" />;
    if (url.includes("drive.google.com")) return <FileText className="h-4 w-4" />;
    return <ExternalLink className="h-4 w-4" />;
  };

  const getColorBadge = (tipo: string) => {
    const colores: Record<string, string> = {
      evento: "bg-purple-100 text-purple-700",
      reunion: "bg-blue-100 text-blue-700",
      curiosidad: "bg-green-100 text-green-700",
      noticia: "bg-orange-100 text-orange-700",
      otro: "bg-gray-100 text-gray-700"};
    return colores[tipo?.toLowerCase()] || colores["otro"];
  };

  const renderContenido = (contenido: string) => {
    if (!contenido) return null;
    if (contenido.includes("<")) {
      return (
        <div
          className="prose prose-slate max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: contenido }}
        />
      );
    }
    return (
      <div className="text-gray-700 leading-relaxed space-y-3">
        {contenido.split("\n").map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (publicacionSeleccionada) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [publicacionSeleccionada]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#004B87] border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-[#004B87]/10 text-[#004B87] text-sm font-semibold rounded-full mb-4">
            Nuestro Blog
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-[#004B87] mb-4 font-serif">
            Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Noticias, eventos y curiosidades de nuestra asociación
          </p>
        </div>

        {/* Grid tipo Masonry */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {publicaciones.map((pub) => (
            <div
              key={pub.id}
              onClick={() => setPublicacionSeleccionada(pub)}
              className="break-inside-avoid group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Preview de imagen */}
              {pub.imagen_url && (
                <div className="relative overflow-hidden">
                  <img
                    src={pub.imagen_url}
                    alt={pub.titulo}
                    className="w-full h-auto max-h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getColorBadge(pub.tipo)} backdrop-blur-sm`}>
                      {pub.tipo}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}

              <div className="p-5">
                {!pub.imagen_url && (
                  <div className="mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getColorBadge(pub.tipo)}`}>
                      {pub.tipo}
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#004B87] transition-colors font-serif">
                  {pub.titulo}
                </h3>

                {pub.subtitulo && (
                  <p className="text-gray-600 text-sm mb-3 italic line-clamp-2">
                    {pub.subtitulo}
                  </p>
                )}

                {/* Metadata y BOTÓN DE LINK */}
                <div className="flex items-center justify-between gap-3 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{pub.autor ? "Autor" : "Admin"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(pub.fecha_publicacion).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"})}
                      </span>
                    </div>
                  </div>
                  
                  {/* BOTÓN DE LINK - AHORA USA link_personalizado */}
                  {pub.link_personalizado && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(pub.link_personalizado, "_blank");
                      }}
                      className="flex items-center gap-1 h-7 px-2 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                    >
                      {getIconoLink(pub.link_personalizado)}
                      <span className="truncate max-w-[80px]">{pub.texto_boton_link || "Ver más"}</span>
                    </Button>
                  )}
                </div>

                {/* Preview de contenido */}
                {pub.contenido && (
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {pub.contenido.replace(/<[^>]*>/g, "")}
                  </p>
                )}

                {/* Indicador de "leer más" */}
                <div className="mt-3 flex items-center text-[#004B87] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Leer más →
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {publicacionSeleccionada && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setPublicacionSeleccionada(null)}
          >
            <div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setPublicacionSeleccionada(null)}
                className="sticky top-4 float-right mr-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-gray-600 shadow-lg ring-1 ring-black/5 hover:bg-white hover:text-gray-900 transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-8 md:p-10">
                {/* Badge tipo */}
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getColorBadge(publicacionSeleccionada.tipo)} mb-4`}>
                  {publicacionSeleccionada.tipo}
                </div>

                {/* Título */}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 font-serif">
                  {publicacionSeleccionada.titulo}
                </h2>

                {/* Subtítulo */}
                {publicacionSeleccionada.subtitulo && (
                  <p className="text-lg text-gray-600 mb-4 italic">
                    {publicacionSeleccionada.subtitulo}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-6 pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{publicacionSeleccionada.autor ? "Autor" : "Administrador"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(publicacionSeleccionada.fecha_publicacion).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"})}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="mb-8">
                  {renderContenido(publicacionSeleccionada.contenido || "")}
                </div>

                {/* Link button - AHORA USA link_personalizado */}
                {publicacionSeleccionada.link_personalizado && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Enlace relacionado:</h3>
                    <Button
                      onClick={() => window.open(publicacionSeleccionada.link_personalizado, "_blank")}
                      className="w-full bg-[#004B87] hover:bg-[#003562] text-white"
                      size="lg"
                    >
                      {getIconoLink(publicacionSeleccionada.link_personalizado)}
                      <span className="ml-2">
                        {publicacionSeleccionada.texto_boton_link || "Ver más"}
                      </span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Imagen al final */}
                {publicacionSeleccionada.imagen_url && (
                  <div className="mt-8 pt-6 border-t">
                    <div className="rounded-xl overflow-hidden bg-gray-50 shadow-inner">
                      <img
                        src={publicacionSeleccionada.imagen_url}
                        alt={publicacionSeleccionada.titulo}
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: "none" }}
                      />
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-3 italic">
                      {publicacionSeleccionada.titulo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
