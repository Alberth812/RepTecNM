"use client";

import { useState, useMemo, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MAX_DIGITOS_TELEFONO = 12;
const MAX_PALABRAS = 600;
const MAX_LONGITUD_CAMPOS = {
  nombre: 100,
  correo: 255,
  telefono: 20,
  motivo: 150,
  mensaje: 10000,
};

interface ModalEnviarMensajeProps {
  destinatarioId: string;
  destinatarioNombre: string;
  isOpen: boolean;
  onClose: () => void;
}

const estadoInicialForm = {
  motivo: "",
  contenido: "",
  nombreParaRespuesta: "",
  correoParaRespuesta: "",
  telefonoParaRespuesta: "",
};

export function ModalEnviarMensaje({
  destinatarioId,
  destinatarioNombre,
  isOpen,
  onClose,
}: ModalEnviarMensajeProps) {
  const [enviando, setEnviando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState(estadoInicialForm);

  useEffect(() => {
    if (!isOpen) return;

    let activo = true;
    setCargandoDatos(true);
    setErrores({});

    fetch("/api/me")
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (!activo) return;

        if (data) {
          const nombreCompleto = data.nombres
            ? `${data.nombres} ${data.apellidoPaterno || ""} ${data.apellidoMaterno || ""}`.trim()
            : data.nombre || data.nombreCompleto || data.name || "";

          setFormData({
            motivo: "",
            contenido: "",
            nombreParaRespuesta: nombreCompleto.slice(0, MAX_LONGITUD_CAMPOS.nombre),
            correoParaRespuesta: (data.correoElectronico || data.correo || data.email || "").slice(
              0,
              MAX_LONGITUD_CAMPOS.correo
            ),
            telefonoParaRespuesta: String(data.telefonoCelular || data.telefono || data.phone || "")
              .replace(/\D/g, "")
              .slice(0, MAX_DIGITOS_TELEFONO),
          });
        } else {
          setFormData(estadoInicialForm);
        }
      })
      .catch((err) => {
        if (!activo) return;
        console.error("Error al cargar datos del usuario:", err);
        setFormData(estadoInicialForm);
      })
      .finally(() => {
        if (activo) {
          setCargandoDatos(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [isOpen]);

  const conteoPalabras = useMemo(() => {
    if (!formData.contenido.trim()) return 0;
    return formData.contenido
      .trim()
      .split(/\s+/)
      .filter((p) => p.length > 0).length;
  }, [formData.contenido]);

  const excedePalabras = conteoPalabras > MAX_PALABRAS;

  const handleTelefonoChange = (valor: string) => {
    const limpio = valor.replace(/\D/g, "").slice(0, MAX_DIGITOS_TELEFONO);
    setFormData((prev) => ({ ...prev, telefonoParaRespuesta: limpio }));
    if (errores.telefonoParaRespuesta) {
      setErrores((prev) => ({ ...prev, telefonoParaRespuesta: "" }));
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (formData.nombreParaRespuesta.trim().length < 2) {
      nuevosErrores.nombreParaRespuesta = "El nombre es obligatorio (mínimo 2 caracteres)";
    } else if (formData.nombreParaRespuesta.length > MAX_LONGITUD_CAMPOS.nombre) {
      nuevosErrores.nombreParaRespuesta = "Nombre demasiado largo";
    }

    if (!formData.correoParaRespuesta.trim()) {
      nuevosErrores.correoParaRespuesta = "El correo electrónico es obligatorio";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correoParaRespuesta)) {
        nuevosErrores.correoParaRespuesta = "Correo no válido";
      }
    }

    if (formData.telefonoParaRespuesta && formData.telefonoParaRespuesta.length < 10) {
      nuevosErrores.telefonoParaRespuesta = "Teléfono debe tener 10-12 dígitos";
    }

    if (formData.motivo.trim().length < 5) {
      nuevosErrores.motivo = "El motivo debe tener al menos 5 caracteres";
    }

    if (formData.contenido.trim().length < 10) {
      nuevosErrores.contenido = "El mensaje debe tener al menos 10 caracteres";
    } else if (excedePalabras) {
      nuevosErrores.contenido = `El mensaje no puede exceder ${MAX_PALABRAS} palabras`;
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores({});

    if (!validarFormulario()) {
      toast.error("Corrige los errores del formulario");
      return;
    }

    setEnviando(true);

    try {
      const response = await fetch("/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinatarioId,
          nombreParaRespuesta: formData.nombreParaRespuesta.trim(),
          correoParaRespuesta: formData.correoParaRespuesta.trim(),
          telefonoParaRespuesta: formData.telefonoParaRespuesta || null,
          motivo: formData.motivo,
          contenido: formData.contenido.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.detalles
          ? data.detalles.map((d: { campo: string; mensaje: string }) => `${d.campo}: ${d.mensaje}`).join(" | ")
          : data.error || "Error al enviar";
        throw new Error(errorMsg);
      }

      toast.success("Mensaje enviado correctamente");
      setFormData(estadoInicialForm);
      onClose();
    } catch (error: unknown) {
      console.error("Error al enviar mensaje:", error);
      toast.error(error instanceof Error ? error.message : "Error al enviar el mensaje");
    } finally {
      setEnviando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 sticky top-0 bg-white rounded-t-lg z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Enviar mensaje</h2>
            <p className="text-sm text-slate-600">Para: {destinatarioNombre}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            disabled={enviando || cargandoDatos}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#004B87]" />
              Tus datos de contacto
              {cargandoDatos && <Loader2 className="h-3 w-3 animate-spin text-[#004B87]" />}
            </h3>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Juan Pérez"
                value={formData.nombreParaRespuesta}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    nombreParaRespuesta: e.target.value.slice(0, MAX_LONGITUD_CAMPOS.nombre),
                  }))
                }
                maxLength={MAX_LONGITUD_CAMPOS.nombre}
                disabled={enviando || cargandoDatos}
              />
              {errores.nombreParaRespuesta && (
                <p className="text-sm text-red-500">{errores.nombreParaRespuesta}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="correo">Correo electrónico *</Label>
                <Input
                  id="correo"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.correoParaRespuesta}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      correoParaRespuesta: e.target.value.slice(0, MAX_LONGITUD_CAMPOS.correo),
                    }))
                  }
                  maxLength={MAX_LONGITUD_CAMPOS.correo}
                  disabled={enviando || cargandoDatos}
                />
                {errores.correoParaRespuesta && (
                  <p className="text-sm text-red-500">{errores.correoParaRespuesta}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono (opcional)</Label>
                <Input
                  id="telefono"
                  type="tel"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="5512345678"
                  value={formData.telefonoParaRespuesta}
                  onChange={(e) => handleTelefonoChange(e.target.value)}
                  maxLength={MAX_DIGITOS_TELEFONO}
                  disabled={enviando || cargandoDatos}
                />
                {errores.telefonoParaRespuesta && (
                  <p className="text-sm text-red-500">{errores.telefonoParaRespuesta}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo del mensaje *</Label>
            <select
              id="motivo"
              value={formData.motivo}
              onChange={(e) => setFormData((prev) => ({ ...prev, motivo: e.target.value }))}
              disabled={enviando || cargandoDatos}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B87]"
            >
              <option value="">Selecciona un motivo</option>
              <option value="Consulta profesional">Consulta profesional</option>
              <option value="Solicitud de servicios">Solicitud de servicios</option>
              <option value="Oferta de empleo">Oferta de empleo</option>
              <option value="Colaboración académica">Colaboración académica</option>
              <option value="Otro">Otro</option>
            </select>
            {errores.motivo && <p className="text-sm text-red-500">{errores.motivo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contenido">Mensaje *</Label>
            <Textarea
              id="contenido"
              placeholder="Describe brevemente el motivo de tu contacto..."
              value={formData.contenido}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contenido: e.target.value.slice(0, MAX_LONGITUD_CAMPOS.mensaje),
                }))
              }
              rows={5}
              maxLength={MAX_LONGITUD_CAMPOS.mensaje}
              disabled={enviando || cargandoDatos}
              className={`resize-none ${excedePalabras ? "border-red-500" : ""}`}
            />
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>El destinatario usará tus datos de contacto para responderte</span>
              <span className={excedePalabras ? "text-red-500 font-semibold" : ""}>
                {conteoPalabras}/{MAX_PALABRAS} palabras
              </span>
            </div>
            {errores.contenido && <p className="text-sm text-red-500">{errores.contenido}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={enviando || cargandoDatos}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={enviando || cargandoDatos || excedePalabras}
              className="bg-[#004B87] hover:bg-[#003a68]"
            >
              {enviando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Mensaje
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}