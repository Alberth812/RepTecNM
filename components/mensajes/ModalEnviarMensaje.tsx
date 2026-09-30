"use client";

import { useState } from "react";
import { X, Send, Loader2, User, Mail, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ModalEnviarMensajeProps {
  isOpen: boolean;
  onClose: () => void;
  destinatarioId: string;
  destinatarioNombre: string;
}

export function ModalEnviarMensaje({ isOpen, onClose, destinatarioId, destinatarioNombre }: ModalEnviarMensajeProps) {
  const [cargando, setCargando] = useState(false);
  const [formData, setFormData] = useState({
    nombreRemitente: "",
    correoContacto: "",
    telefonoContacto: "",
    motivo: "Consulta profesional",
    mensaje: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const res = await fetch("/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinatarioId,
          nombreRemitente: formData.nombreRemitente,
          datosContacto: {
            correo: formData.correoContacto,
            telefono: formData.telefonoContacto,
          },
          motivo: formData.motivo,
          cuerpo: formData.mensaje,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al enviar el mensaje");
      }

      toast.success("Mensaje enviado correctamente");
      onClose();
      setFormData({ nombreRemitente: "", correoContacto: "", telefonoContacto: "", motivo: "Consulta profesional", mensaje: "" });
    } catch (error: any) {
      toast.error(error.message || "No se pudo enviar el mensaje. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header con gradiente sutil */}
        <div className="bg-gradient-to-r from-[#004B87] to-[#0066b3] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Enviar Mensaje</h2>
                <p className="text-sm text-white/80">Para: <span className="font-semibold text-white">{destinatarioNombre}</span></p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Información del remitente */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <User className="h-4 w-4 text-[#004B87]" />
              Tus datos de contacto
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="nombreRemitente" className="text-sm">Nombre completo *</Label>
                <Input
                  id="nombreRemitente"
                  required
                  value={formData.nombreRemitente}
                  onChange={(e) => setFormData({ ...formData, nombreRemitente: e.target.value })}
                  placeholder="Ej. Juan Pérez García"
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="correoContacto" className="text-sm">Correo electrónico *</Label>
                  <Input
                    id="correoContacto"
                    type="email"
                    required
                    value={formData.correoContacto}
                    onChange={(e) => setFormData({ ...formData, correoContacto: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefonoContacto" className="text-sm">Teléfono</Label>
                  <Input
                    id="telefonoContacto"
                    type="tel"
                    value={formData.telefonoContacto}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d+]/g, '');
                      setFormData({ ...formData, telefonoContacto: val });
                    }}
                    placeholder="55 1234 5678"
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo" className="text-sm font-semibold text-slate-700">Motivo del mensaje *</Label>
            <select
              id="motivo"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B87]"
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
            >
              <option value="Consulta profesional">Consulta profesional</option>
              <option value="Solicitud de servicios">Solicitud de servicios</option>
              <option value="Oferta de empleo">Oferta de empleo</option>
              <option value="Colaboración académica">Colaboración académica</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Mensaje */}
          <div className="space-y-2">
            <Label htmlFor="mensaje" className="text-sm font-semibold text-slate-700">Mensaje *</Label>
            <Textarea
              id="mensaje"
              required
              rows={5}
              value={formData.mensaje}
              onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
              placeholder="Describe brevemente el motivo de tu contacto..."
              className="resize-none"
            />
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Mail className="h-3 w-3" />
              El destinatario usará tus datos de contacto para responderte
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={cargando} className="h-10 px-6">
              Cancelar
            </Button>
            <Button type="submit" className="h-10 px-6 bg-[#004B87] hover:bg-[#003a6b]" disabled={cargando}>
              {cargando ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> Enviar Mensaje</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
