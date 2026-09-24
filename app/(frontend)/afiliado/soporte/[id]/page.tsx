"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, User, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

function getEstadoBadge(estado: string) {
  const estilos: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-300",
    ATENDIDO: "bg-blue-100 text-blue-800 border-blue-300",
    SOLUCIONADO: "bg-green-100 text-green-800 border-green-300",
    CERRADO: "bg-gray-100 text-gray-800 border-gray-300",
  };
  return <Badge className={`${estilos[estado] || "bg-gray-100"} border`}>{estado}</Badge>;
}

// En Next.js 15+, params es una Promise
export default function TicketDetallePage({ params }: { params: Promise<{ id: string }> }) {
  // Desenrollar la promesa de params
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const cargarDetalle = async () => {
    try {
      const res = await fetch(`/api/soporte/tickets/${ticketId}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket);
        setMensajes(data.mensajes);
      } else {
        router.push("/afiliado/soporte");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDetalle(); }, [ticketId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes]);

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    setEnviando(true);
    try {
      const res = await fetch(`/api/soporte/tickets/${ticketId}/mensajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: nuevoMensaje }),
      });

      if (res.ok) {
        setNuevoMensaje("");
        cargarDetalle();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando ticket...</div>;
  if (!ticket) return null;

  const puedeResponder = ticket.estado !== "CERRADO" && ticket.estado !== "SOLUCIONADO";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" onClick={() => router.push("/afiliado/soporte")} className="mb-4 pl-0 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Mis Tickets
      </Button>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
            <div>
              <CardTitle className="text-xl">{ticket.asunto}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Categoría: <span className="font-medium text-foreground">{ticket.categoria}</span> • 
                Creado el {new Date(ticket.createdAt).toLocaleDateString("es-MX")}
              </p>
            </div>
            {getEstadoBadge(ticket.estado)}
          </div>
        </CardHeader>
        <CardContent className="border-t pt-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{ticket.descripcion}</p>
        </CardContent>
      </Card>

      <div className="mb-4 space-y-4" ref={scrollRef}>
        {mensajes.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.autorRol === "ADMINISTRADOR" ? "flex-row" : "flex-row-reverse"}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.autorRol === "ADMINISTRADOR" ? "bg-[#004B87] text-white" : "bg-muted text-muted-foreground"}`}>
              {msg.autorRol === "ADMINISTRADOR" ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.autorRol === "ADMINISTRADOR" ? "bg-muted" : "bg-[#004B87] text-white"}`}>
              <p className="mb-1 text-xs font-semibold opacity-80">
                {msg.autorRol === "ADMINISTRADOR" ? "Soporte RepTecNM" : "Tú"} • {new Date(msg.createdAt).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.contenido}</p>
              {msg.esRespuestaOficial && (
                <Badge className="mt-2 bg-green-600 text-white hover:bg-green-700">Respuesta Oficial / Solución</Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {puedeResponder ? (
        <form onSubmit={enviarMensaje} className="mt-6 flex gap-3">
          <Textarea
            placeholder="Escribe tu respuesta o agrega más detalles..."
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            className="min-h-[80px] resize-none"
            disabled={enviando}
          />
          <Button type="submit" className="h-auto shrink-0 bg-[#004B87] px-6 hover:bg-[#003a6b]" disabled={enviando || !nuevoMensaje.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          Este ticket está <span className="font-semibold text-foreground">{ticket.estado.toLowerCase()}</span>. Si necesitas más ayuda, por favor abre un nuevo ticket.
        </div>
      )}
    </div>
  );
}
