"use client";
import { useState, useEffect, useMemo } from "react";
import { X, Info, AlertTriangle, AlertCircle, CheckCircle, Bell, ChevronRight, ChevronLeft } from "lucide-react";
import { useFetchResiliente } from "@/lib/hooks/use-fetch-resiliente";

interface Aviso {
  id?: number | string;
  titulo: string;
  contenido: string;
  tipo: string;
  imagen_url?: string | null;
  imagen_base64?: string | null;
}

interface CMSData {
  avisos?: Aviso[];
}

export function AvisosFlotantes() {
  const { data } = useFetchResiliente<CMSData>({
    url: "/api/cms/contenido-inicio/publico/",
    fallback: { avisos: [] },
    cacheKey: "rep-cms-cache",
    timeoutMs: 5000,
    mostrarIndicador: false,
  });

  const avisos = useMemo(() => {
    return (data?.avisos || []).filter((a) => a.titulo && a.contenido);
  }, [data]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Bloquear scroll del body cuando hay avisos visibles
  useEffect(() => {
    if (avisos.length > 0 && visible) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [avisos.length, visible]);

  // Navegación con teclado (flechas izquierda/derecha)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!visible) return;
      if (e.key === "ArrowLeft") avisoAnterior();
      if (e.key === "ArrowRight") siguienteAviso();
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [visible, currentIndex, avisos.length]);

  if (!visible || avisos.length === 0) return null;

  const avisoActual = avisos[currentIndex];
  const hayMasAvisos = avisos.length > 1;
  const esPrimero = currentIndex === 0;
  const esUltimo = currentIndex === avisos.length - 1;

  const getIcono = (tipo: string) => {
    switch (tipo) {
      case "warning": return <AlertTriangle className="h-6 w-6" />;
      case "error": return <AlertCircle className="h-6 w-6" />;
      case "success": return <CheckCircle className="h-6 w-6" />;
      case "urgente": return <Bell className="h-6 w-6" />;
      default: return <Info className="h-6 w-6" />;
    }
  };

  const getColor = (tipo: string) => {
    switch (tipo) {
      case "warning": return "bg-amber-50 border-amber-300 text-amber-900";
      case "error": return "bg-red-50 border-red-300 text-red-900";
      case "success": return "bg-green-50 border-green-300 text-green-900";
      case "urgente": return "bg-purple-50 border-purple-300 text-purple-900";
      default: return "bg-blue-50 border-blue-300 text-blue-900";
    }
  };

  const avisoAnterior = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const siguienteAviso = () => {
    if (currentIndex < avisos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setVisible(false);
    }
  };

  const imagenSrc = avisoActual.imagen_url || avisoActual.imagen_base64;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Overlay con blur, clickeable para cerrar todo */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setVisible(false)}
      />

      {/* Contenedor del aviso actual */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className={`relative w-full border-2 shadow-2xl ${getColor(avisoActual.tipo)}`}>
          {/* Botón cerrar absoluto */}
          <button
            onClick={() => setVisible(false)}
            className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors"
            aria-label="Cerrar aviso"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Contenido con scroll interno si es muy largo */}
          <div className="max-h-[85vh] overflow-y-auto">
            {imagenSrc && (
              <div className="w-full">
                <img
                  src={imagenSrc}
                  alt={avisoActual.titulo}
                  className="w-full h-auto object-contain"
                />
              </div>
            )}

            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-1 p-3 bg-white/60 rounded-full">
                  {getIcono(avisoActual.tipo)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-2xl md:text-3xl mb-3">{avisoActual.titulo}</h4>
                  <p className="text-base md:text-lg whitespace-pre-wrap leading-relaxed mb-6">
                    {avisoActual.contenido}
                  </p>

                  {/* Indicador de progreso y botones de navegación */}
                  {hayMasAvisos && (
                    <div className="flex items-center justify-between pt-4 border-t border-black/10 gap-3">
                      <span className="text-sm font-medium opacity-70">
                        Aviso {currentIndex + 1} de {avisos.length}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Botón Anterior - solo aparece si no es el primero */}
                        {!esPrimero && (
                          <button
                            onClick={avisoAnterior}
                            className="flex items-center gap-2 rounded-lg border-2 border-current bg-white/60 px-4 py-2.5 text-sm font-bold transition-all hover:bg-white hover:scale-105 active:scale-95"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                          </button>
                        )}
                        {/* Botón Siguiente / Cerrar */}
                        <button
                          onClick={siguienteAviso}
                          className="flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-bold text-amber-950 shadow-md transition-all hover:bg-amber-300 hover:scale-105 active:scale-95"
                        >
                          {esUltimo ? "Cerrar" : "Ver siguiente aviso"}
                          {!esUltimo && <ChevronRight className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
