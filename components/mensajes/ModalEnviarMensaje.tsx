import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ModalEnviarMensajeProps {
  destinatarioId: string;
  destinatarioNombre: string;
  isOpen: boolean;
  onClose: () => void;
}

const MAX_PALABRAS = 600;
const MIN_DIGITOS_TELEFONO = 10;
const MAX_DIGITOS_TELEFONO = 12;

export function ModalEnviarMensaje({
  destinatarioId,
  destinatarioNombre,
  isOpen,
  onClose,
}: ModalEnviarMensajeProps) {
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    motivo: "",
    contenido: "",
    nombreParaRespuesta: "",
    correoParaRespuesta: "",
    telefonoParaRespuesta: "",
  });

  const conteoPalabras = useMemo(() => {
    if (!formData.contenido.trim()) return 0;
    return formData.contenido.trim().split(/\s+/).filter((p) => p.length > 0).length;
  }, [formData.contenido]);

  const excedePalabras = conteoPalabras > MAX_PALABRAS;

  const handleTelefonoChange = (valor: string) => {
    let limpio = valor;
    if (limpio.startsWith("+")) {
      const resto = limpio.slice(1).replace(/\D/g, "");
      limpio = "+" + resto;
    } else {
      limpio = limpio.replace(/\D/g, "");
    }

    const digitos = limpio.replace("+", "");
    if (digitos.length > MAX_DIGITOS_TELEFONO) {
      limpio = (limpio.startsWith("+") ? "+" : "") + digitos.slice(0, MAX_DIGITOS_TELEFONO);
    }

    setFormData({ ...formData, telefonoParaRespuesta: limpio });
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (formData.motivo.trim().length < 5) {
      nuevosErrores.motivo = "El motivo debe tener al menos 5 caracteres";
    }
    if (formData.motivo.length > 150) {
      nuevosErrores.motivo = "El motivo no puede exceder 150 caracteres";
    }

    if (formData.contenido.trim().length < 10) {
      nuevosErrores.contenido = "El mensaje debe tener al menos 10 caracteres";
    }
    if (excedePalabras) {
      nuevosErrores.contenido = `El mensaje no puede exceder ${MAX_PALABRAS} palabras`;
    }

    // Nombre: OBLIGATORIO
    if (formData.nombreParaRespuesta.trim().length < 2) {
      nuevosErrores.nombreParaRespuesta = "El nombre es obligatorio";
    }

    // Correo: OBLIGATORIO
    if (!formData.correoParaRespuesta.trim()) {
      nuevosErrores.correoParaRespuesta = "El correo electrónico es obligatorio";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correoParaRespuesta)) {
        nuevosErrores.correoParaRespuesta = "Correo no válido";
      }
    }

    // Teléfono: OPCIONAL (pero si se ingresa, debe ser válido)
    if (formData.telefonoParaRespuesta) {
      const telRegex = /^\+?\d{10,12}$/;
      if (!telRegex.test(formData.telefonoParaRespuesta)) {
        nuevosErrores.telefonoParaRespuesta = `Teléfono debe tener 10-12 dígitos (ej: 5512345678 o +525512345678)`;
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores({});

    if (!validarFormulario()) return;

    setEnviando(true);

    try {
      const response = await fetch("/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinatarioId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar mensaje");
      }

      toast.success("Mensaje enviado correctamente");
      setFormData({
        motivo: "",
        contenido: "",
        nombreParaRespuesta: "",
        correoParaRespuesta: "",
        telefonoParaRespuesta: "",
      });
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al enviar mensaje");
    } finally {
      setEnviando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 sticky top-0 bg-white rounded-t-lg z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Enviar mensaje</h2>
            <p className="text-sm text-slate-600">
              Para: <span className="font-medium">{destinatarioNombre}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">Importante:</p>
            <p>
              El destinatario no podrá responder desde la plataforma. Proporciona tus datos de
              contacto para que pueda comunicarse contigo por medios externos.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">
              Motivo del mensaje <span className="text-red-500">*</span>
            </Label>
            <Input
              id="motivo"
              placeholder="Ej: Consulta sobre servicios profesionales"
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              maxLength={150}
            />
            <p className="text-xs text-slate-500 text-right">{formData.motivo.length}/150</p>
            {errores.motivo && <p className="text-sm text-red-500">{errores.motivo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contenido">
              Mensaje <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="contenido"
              placeholder="Escribe tu mensaje aquí..."
              rows={6}
              value={formData.contenido}
              onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
              className={excedePalabras ? "border-red-500" : ""}
            />
            <p
              className={`text-xs text-right ${
                excedePalabras ? "text-red-500 font-medium" : "text-slate-500"
              }`}
            >
              {conteoPalabras}/{MAX_PALABRAS} palabras
            </p>
            {errores.contenido && <p className="text-sm text-red-500">{errores.contenido}</p>}
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-200">
            <Label className="text-sm font-semibold">
              Tus datos de contacto <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-slate-600">Nombre y correo son obligatorios</p>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="nombre">
                  Nombre para que te respondan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  placeholder="Tu nombre completo"
                  value={formData.nombreParaRespuesta}
                  onChange={(e) =>
                    setFormData({ ...formData, nombreParaRespuesta: e.target.value })
                  }
                />
                {errores.nombreParaRespuesta && (
                  <p className="text-sm text-red-500">{errores.nombreParaRespuesta}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="correo">
                  Correo electrónico <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="correo"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.correoParaRespuesta}
                  onChange={(e) =>
                    setFormData({ ...formData, correoParaRespuesta: e.target.value })
                  }
                />
                {errores.correoParaRespuesta && (
                  <p className="text-sm text-red-500">{errores.correoParaRespuesta}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="telefono">Teléfono (opcional)</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="5512345678 o +525512345678"
                  value={formData.telefonoParaRespuesta}
                  onChange={(e) => handleTelefonoChange(e.target.value)}
                  inputMode="numeric"
                />
                <p className="text-xs text-slate-500">
                  Solo números. 10-12 dígitos (con o sin +52).
                </p>
                {errores.telefonoParaRespuesta && (
                  <p className="text-sm text-red-500">{errores.telefonoParaRespuesta}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={enviando}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={enviando || excedePalabras}
              className="bg-[#004B87] hover:bg-[#003a68]"
            >
              {enviando ? "Enviando..." : "Enviar mensaje"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
