"use client";

import { useEffect, useState } from "react";
import { Inbox, Mail, Phone, Loader2, Send, Archive, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cargarMensajes, marcarLeido, type Mensaje } from "@/lib/mensajes";
import { toast } from "sonner";

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

export default function MensajeriaPage() {
 const [mensajes, setMensajes] = useState<Mensaje[]>([]);
 const [pestana, setPestana] = useState<"recibidos" | "enviados">("recibidos");
 const [abierto, setAbierto] = useState<Mensaje | null>(null);
 const [cargando, setCargando] = useState(true);
 const [copiado, setCopiado] = useState<string | null>(null);

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

 {cargando ? (
 <div className="flex h-[60vh] items-center justify-center bg-white rounded-lg border border-slate-200">
 <Loader2 className="h-8 w-8 animate-spin text-[#004B87]" />
 <span className="ml-3 text-slate-600">Cargando mensajes...</span>
 </div>
 ) : (
 <div className="grid gap-4 md:grid-cols-3 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
 {/* Lista de mensajes */}
 <div className="md:col-span-1 border-r border-slate-200 max-h-[70vh] overflow-y-auto">
 {mensajes.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400">
 <Archive className="h-12 w-12 mb-3 opacity-40" />
 <p className="text-sm font-medium">No hay mensajes</p>
 <p className="text-xs mt-1 text-center px-4">
 {pestana === "recibidos" ? "Tu bandeja está vacía" : "Aún no has enviado mensajes"}
 </p>
 </div>
 ) : (
 <div className="divide-y divide-slate-100">
 {mensajes.map((m) => (
 <button
 key={m.id}
 onClick={() => abrir(m)}
 className={`w-full text-left p-4 transition-all hover:bg-slate-50 ${
 abierto?.id === m.id
 ? "bg-[#004B87]/5 border-l-4 border-l-[#004B87]"
 : m.leido
 ? "border-l-4 border-l-transparent"
 : "bg-blue-50/30 border-l-4 border-l-[#004B87]"
 }`}
 >
 <div className="flex justify-between items-start mb-1.5">
 <span className={`text-sm truncate ${!m.leido && pestana === "recibidos" ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
 {pestana === "recibidos" 
 ? (m.remitenteNombre || "Desconocido")
 : (m.destinatarioNombre || "Desconocido")}
 </span>
 <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
 {fechaCorta(m.createdAt)}
 </span>
 </div>
 <p className={`text-sm truncate ${!m.leido && pestana === "recibidos" ? "font-semibold text-slate-800" : "text-slate-600"}`}>
 {m.motivo}
 </p>
 <p className="text-xs text-slate-400 truncate mt-1">
 {m.contenido.substring(0, 60)}...
 </p>
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Detalle del mensaje */}
 <div className="md:col-span-2 min-h-[70vh]">
 {abierto ? (
 <div className="p-6 h-full flex flex-col">
 {/* Encabezado del mensaje */}
 <div className="border-b border-slate-200 pb-4 mb-4">
 <h2 className="text-xl font-bold text-slate-900 mb-3">
 {abierto.motivo}
 </h2>
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-full bg-[#004B87] flex items-center justify-center text-white font-semibold text-sm shrink-0">
 {(pestana === "recibidos" ? abierto.remitenteNombre : abierto.destinatarioNombre || "U")?.[0]?.toUpperCase() || "U"}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-slate-900 truncate">
 {pestana === "recibidos" 
 ? abierto.remitenteNombre || "Desconocido"
 : `Para: ${abierto.destinatarioNombre || "Desconocido"}`}
 </p>
 <p className="text-xs text-slate-500 truncate">
 {pestana === "recibidos" 
 ? abierto.remitenteEmail || "Sin correo"
 : abierto.destinatarioEmail || "Sin correo"}
 </p>
 </div>
 <span className="text-xs text-slate-400 shrink-0">
 {fechaCompleta(abierto.createdAt)}
 </span>
 </div>
 </div>

 {/* Datos de contacto con botones de copiar */}
 {pestana === "recibidos" && (abierto.nombreParaRespuesta || abierto.correoParaRespuesta || abierto.telefonoParaRespuesta) && (
 <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
 <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
 Datos de contacto del remitente
 </p>
 <div className="space-y-3 text-sm">
 {abierto.nombreParaRespuesta && (
 <div className="flex items-center gap-2 text-slate-700">
 <span className="text-slate-500 font-medium w-20 shrink-0">Nombre:</span>
 <span>{abierto.nombreParaRespuesta}</span>
 </div>
 )}
 {abierto.correoParaRespuesta && (
 <div className="flex items-center gap-2">
 <Mail className="h-4 w-4 text-slate-400 shrink-0" />
 <span className="text-[#004B87] font-medium flex-1 truncate">{abierto.correoParaRespuesta}</span>
 <button
 onClick={() => copiarAlPortapapeles(abierto.correoParaRespuesta!, "Correo")}
 className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-[#004B87] transition-colors shrink-0"
 title="Copiar correo"
 >
 {copiado === "Correo" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
 </button>
 </div>
 )}
 {abierto.telefonoParaRespuesta && (
 <div className="flex items-center gap-2">
 <Phone className="h-4 w-4 text-slate-400 shrink-0" />
 <span className="text-slate-700 flex-1">{abierto.telefonoParaRespuesta}</span>
 <button
 onClick={() => copiarAlPortapapeles(abierto.telefonoParaRespuesta!, "Teléfono")}
 className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-[#004B87] transition-colors shrink-0"
 title="Copiar teléfono"
 >
 {copiado === "Teléfono" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
 </button>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Contenido del mensaje */}
 <div className="flex-1">
 <div className="whitespace-pre-wrap text-slate-800 leading-relaxed text-sm">
 {abierto.contenido}
 </div>
 </div>

 {/* Botón de respuesta por correo */}
 {pestana === "recibidos" && abierto.correoParaRespuesta && (
 <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
 <a
 href={`mailto:${abierto.correoParaRespuesta}?subject=Re: ${encodeURIComponent(abierto.motivo)}&body=${encodeURIComponent(`Hola ${abierto.nombreParaRespuesta || ''},\n\nRespecto a tu mensaje sobre "${abierto.motivo}":\n\n`)}`}
 className="inline-flex items-center gap-2 px-4 py-2 bg-[#004B87] text-white rounded-md hover:bg-[#003a68] transition-colors text-sm font-medium shadow-sm"
 >
 <Mail className="h-4 w-4" />
 Responder por correo
 </a>
 </div>
 )}
 </div>
 ) : (
 <div className="h-full flex items-center justify-center bg-slate-50/50">
 <div className="text-center">
 <Inbox className="h-16 w-16 mx-auto mb-4 text-slate-300" />
 <p className="text-slate-500 font-medium">Selecciona un mensaje</p>
 <p className="text-sm text-slate-400 mt-1">
 Haz clic en un mensaje de la lista para ver su contenido
 </p>
 </div>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
