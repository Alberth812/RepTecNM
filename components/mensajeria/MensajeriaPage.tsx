"use client";

import { useEffect, useState } from "react";
import { Inbox, Mail, Phone, Loader2, Send, Archive, Copy, Check, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cargarMensajes, marcarLeido, eliminarMensaje, type Mensaje } from "@/lib/mensajes";
import { toast } from "sonner";

interface MensajeriaPageProps {
  rol?: "afiliado" | "admin";
}

function fechaCorta(iso: string) {
  const fecha = new Date(iso);
  const ahora = new Date();
  const esHoy = fecha.toDateString() === ahora.toDateString();
  if (esHoy) return fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  return fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

function fechaCompleta(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function MensajeriaPage({ rol }: MensajeriaPageProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [pestana, setPestana] = useState<"recibidos" | "enviados">("recibidos");
  const [abierto, setAbierto] = useState<Mensaje | null>(null);
  const [cargando, setCargando] = useState(true);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const datos = await cargarMensajes(pestana);
      setMensajes(datos);
      setCargando(false);
    };
    cargar();
  }, [pestana]);

  const abrir = async (m: Mensaje) => {
    setAbierto(m);
    if (!m.leido && pestana === "recibidos") {
      await marcarLeido(m.id);
      setMensajes((prev) =>
        prev.map((msg) => (msg.id === m.id ? { ...msg, leido: true } : msg))
      );
    }
  };

  const handleEliminar = async (mensajeId: string) => {
    if (!confirm("¿Estás seguro de eliminar este mensaje? Esta acción no se puede deshacer.")) {
      return;
    }

    setEliminando(mensajeId);
    try {
      await eliminarMensaje(mensajeId);
      setMensajes((prev) => prev.filter((m) => m.id !== mensajeId));
      if (abierto?.id === mensajeId) {
        setAbierto(null);
      }
      toast.success("Mensaje eliminado de la bandeja");
    } catch (error) {
      toast.error("Error al eliminar el mensaje");
    } finally {
      setEliminando(null);
    }
  };

  const copiarAlPortapapeles = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    toast.success(`${tipo} copiado al portapapeles`);
    setTimeout(() => setCopiado(null), 2000);
  };

  const noLeidos = mensajes.filter((m) => !m.leido).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Inbox className="h-6 w-6 text-[#004B87]" />
              Bandeja de Mensajes
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {pestana === "recibidos"
                ? `${mensajes.length} mensajes recibidos${noLeidos > 0 ? `, ${noLeidos} sin leer` : ""}`
                : `${mensajes.length} mensajes enviados`}
            </p>
          </div>

          {/* Pestañas */}
          <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => { setPestana("recibidos"); setAbierto(null); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                pestana === "recibidos"
                  ? "bg-[#004B87] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Inbox className="h-4 w-4" />
              Recibidos
              {noLeidos > 0 && (
                <Badge className="bg-red-500 text-white text-xs border-0">
                  {noLeidos}
                </Badge>
              )}
            </button>
            <button
              onClick={() => { setPestana("enviados"); setAbierto(null); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                pestana === "enviados"
                  ? "bg-[#004B87] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Send className="h-4 w-4" />
              Enviados
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          {/* Lista de mensajes */}
          <div className="space-y-2">
            {cargando ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#004B87]" />
              </div>
            ) : mensajes.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Inbox className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>No hay mensajes en esta bandeja</p>
              </div>
            ) : (
              mensajes.map((m) => (
                <div
                  key={m.id}
                  onClick={() => abrir(m)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    abierto?.id === m.id
                      ? "bg-[#004B87] text-white border-[#004B87]"
                      : m.leido
                      ? "bg-white border-slate-200 hover:border-[#004B87]/30"
                      : "bg-blue-50 border-blue-200 hover:border-[#004B87]/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className={`text-sm font-semibold truncate ${
                      abierto?.id === m.id ? "text-white" : "text-slate-900"
                    }`}>
                      {pestana === "recibidos" ? m.nombreRemitente : m.nombreDestinatario}
                    </p>
                    <span className={`text-xs ${
                      abierto?.id === m.id ? "text-white/80" : "text-slate-500"
                    }`}>
                      {fechaCorta(m.createdAt)}
                    </span>
                  </div>
                  <p className={`text-xs font-medium mb-1 ${
                    abierto?.id === m.id ? "text-white/90" : "text-[#004B87]"
                  }`}>
                    {m.motivo}
                  </p>
                  <p className={`text-xs truncate ${
                    abierto?.id === m.id ? "text-white/70" : "text-slate-600"
                  }`}>
                    {m.contenido}
                  </p>
                  {!m.leido && pestana === "recibidos" && (
                    <div className="mt-2">
                      <Badge className="bg-red-500 text-white text-[10px] border-0">NUEVO</Badge>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Detalle del mensaje */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 min-h-[400px]">
            {abierto ? (
              <div className="space-y-4">
                {/* Header del mensaje */}
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">{abierto.motivo}</h2>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>
                        {pestana === "recibidos" ? "De:" : "Para:"}{" "}
                        <strong>{pestana === "recibidos" ? abierto.nombreRemitente : abierto.nombreDestinatario}</strong>
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{fechaCompleta(abierto.createdAt)}</span>
                  </div>
                </div>

                {/* Datos de contacto (solo para recibidos) */}
                {pestana === "recibidos" && abierto.datosContacto && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Datos de contacto del remitente</h3>
                    <div className="space-y-2 text-sm">
                      {abierto.datosContacto.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-500" />
                          <span className="text-slate-700">{abierto.datosContacto.email}</span>
                          <button
                            onClick={() => copiarAlPortapapeles(abierto.datosContacto!.email, "Correo")}
                            className="ml-auto text-[#004B87] hover:underline text-xs"
                          >
                            {copiado === "Correo" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      )}
                      {abierto.datosContacto.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-500" />
                          <span className="text-slate-700">{abierto.datosContacto.telefono}</span>
                          <button
                            onClick={() => copiarAlPortapapeles(abierto.datosContacto!.telefono, "Teléfono")}
                            className="ml-auto text-[#004B87] hover:underline text-xs"
                          >
                            {copiado === "Teléfono" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contenido del mensaje */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-slate-800 whitespace-pre-wrap">{abierto.contenido}</p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  {pestana === "recibidos" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEliminar(abierto.id)}
                      disabled={eliminando === abierto.id}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      {eliminando === abierto.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                  <Mail className="h-16 w-16 mx-auto mb-3 text-slate-200" />
                  <p>Selecciona un mensaje para ver su contenido</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
