"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, User, ShieldCheck, CheckCircle, Clock, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Mensaje {
  id: string;
  autorId: string;
  autorRol: "AFILIADO" | "ADMINISTRADOR";
  contenido: string;
  esRespuestaOficial: boolean;
  createdAt: string;
}

interface Ticket {
  id: string;
  asunto: string;
  estado: string;
  categoria: string;
  createdAt: string;
  afiliado: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correoElectronico: string;
  };
}

function getEstadoBadge(estado: string) {
  const estilos: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-300",
    ATENDIDO: "bg-blue-100 text-blue-800 border-blue-300",
    SOLUCIONADO: "bg-green-100 text-green-800 border-green-300",
    CERRADO: "bg-gray-100 text-gray-800 border-gray-300",
  };
  return <Badge className={`${estilos[estado] || "bg-gray-100"} border px-3 py-1`}>{estado}</Badge>;
}

// Nota: En Next.js 15+, params es una Promesa. La tipamos como tal.
export default function TicketDetalleAdminPage({ params }: { params: Promise<{ id: string }> }) {
  // Desenrollamos la promesa de params usando React.use()
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [actualizandoEstado, setActualizandoEstado] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const cargarDetalle = async () => {
    try {
      const res = await fetch(`/api/soporte/tickets/${ticketId}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket);
        setMensajes(data.mensajes);
        setEstadoSeleccionado(data.ticket.estado);
      } else {
        toast.error("No se pudo cargar el ticket");
        router.push("/admin/soporte");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar el ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [ticketId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes]);

  const enviarMensaje = async (e: React.FormEvent, esRespuestaOficial = false) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    setEnviando(true);
    try {
      const res = await fetch(`/api/soporte/tickets/${ticketId}/mensajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contenido: nuevoMensaje,
          esRespuestaOficial 
        }),
      });

      if (res.ok) {
        setNuevoMensaje("");
        await cargarDetalle();
        toast.success(esRespuestaOficial ? "Respuesta oficial enviada y ticket marcado como SOLUCIONADO" : "Mensaje enviado");
      } else {
        toast.error("Error al enviar el mensaje");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al enviar el mensaje");
    } finally {
      setEnviando(false);
    }
  };

  const cambiarEstado = async () => {
    setActualizandoEstado(true);
    try {
      const res = await fetch(`/api/soporte/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: estadoSeleccionado }),
      });

      if (res.ok) {
        await cargarDetalle();
        toast.success(`Estado cambiado a ${estadoSeleccionado}`);
      } else {
        toast.error("Error al cambiar el estado");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cambiar el estado");
    } finally {
      setActualizandoEstado(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando ticket...</div>;
  }

  if (!ticket) {
    return null;
  }

  const nombreAfiliado = `${ticket.afiliado.nombres} ${ticket.afiliado.apellidoPaterno} ${ticket.afiliado.apellidoMaterno}`.trim();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Button variant="ghost" onClick={() => router.push("/admin/soporte")} className="mb-4 pl-0 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Tickets
      </Button>

      {/* Información del ticket */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
            <div>
              <CardTitle className="text-xl mb-2">{ticket.asunto}</CardTitle>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span><strong>Categoría:</strong> {ticket.categoria}</span>
                <span>•</span>
                <span><strong>Afiliado:</strong> {nombreAfiliado}</span>
                <span>•</span>
                <span><strong>Email:</strong> {ticket.afiliado.correoElectronico}</span>
                <span>•</span>
                <span><strong>Creado:</strong> {new Date(ticket.createdAt).toLocaleString("es-MX")}</span>
              </div>
            </div>
            {getEstadoBadge(ticket.estado)}
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Hilo de mensajes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-4 max-h-[500px] overflow-y-auto" ref={scrollRef}>
              {mensajes.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.autorRol === "ADMINISTRADOR" ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.autorRol === "ADMINISTRADOR" ? "bg-[#004B87] text-white" : "bg-muted text-muted-foreground"}`}>
                    {msg.autorRol === "ADMINISTRADOR" ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.autorRol === "ADMINISTRADOR" ? "bg-muted" : "bg-[#004B87] text-white"}`}>
                    <p className="mb-1 text-xs font-semibold opacity-80">
                      {msg.autorRol === "ADMINISTRADOR" ? "Administrador" : nombreAfiliado} • {new Date(msg.createdAt).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.contenido}</p>
                    {msg.esRespuestaOficial && (
                      <Badge className="mt-2 bg-green-600 text-white hover:bg-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" /> Respuesta Oficial / Solución
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Formulario para enviar mensaje */}
            <form onSubmit={(e) => enviarMensaje(e, false)} className="mt-4">
              <Textarea
                placeholder="Escribe tu respuesta..."
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                className="min-h-[80px] resize-none mb-3"
                disabled={enviando}
              />
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="bg-[#004B87] hover:bg-[#003a6b]" 
                  disabled={enviando || !nuevoMensaje.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar mensaje
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={(e) => enviarMensaje(e, true)}
                  disabled={enviando || !nuevoMensaje.trim() || ticket.estado === "CERRADO"}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como solución
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Panel lateral - Cambiar estado */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gestión del Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Cambiar estado</label>
              <Select value={estadoSeleccionado} onValueChange={setEstadoSeleccionado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDIENTE">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      PENDIENTE
                    </div>
                  </SelectItem>
                  <SelectItem value="ATENDIDO">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      ATENDIDO
                    </div>
                  </SelectItem>
                  <SelectItem value="SOLUCIONADO">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      SOLUCIONADO
                    </div>
                  </SelectItem>
                  <SelectItem value="CERRADO">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      CERRADO
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={cambiarEstado} 
                className="w-full mt-3"
                disabled={actualizandoEstado || estadoSeleccionado === ticket.estado}
              >
                {actualizandoEstado ? "Actualizando..." : "Actualizar estado"}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Información adicional</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID del ticket:</span>
                  <span className="font-mono text-xs">{ticket.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total mensajes:</span>
                  <span>{mensajes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Último mensaje:</span>
                  <span>{mensajes.length > 0 ? new Date(mensajes[mensajes.length - 1].createdAt).toLocaleDateString("es-MX") : "—"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
