"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const CATEGORIAS = ["TÉCNICO", "ADMINISTRATIVO", "CATÁLOGO", "CREDENCIAL", "OTRO"];

function getEstadoBadge(estado: string) {
  switch (estado) {
    case "PENDIENTE": return <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50"><AlertCircle className="mr-1 h-3 w-3" /> Pendiente</Badge>;
    case "ATENDIDO": return <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50"><MessageSquare className="mr-1 h-3 w-3" /> Atendido</Badge>;
    case "SOLUCIONADO": return <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50"><CheckCircle className="mr-1 h-3 w-3" /> Solucionado</Badge>;
    case "CERRADO": return <Badge variant="secondary"><XCircle className="mr-1 h-3 w-3" /> Cerrado</Badge>;
    default: return <Badge variant="secondary">{estado}</Badge>;
  }
}

export default function SoporteAfiliadoPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [asunto, setAsunto] = useState("");
  const [categoria, setCategoria] = useState("OTRO");
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cargarTickets = async () => {
    try {
      const res = await fetch("/api/soporte/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Error cargando tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarTickets(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asunto.trim() || !descripcion.trim()) return;

    setEnviando(true);
    try {
      const res = await fetch("/api/soporte/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asunto, categoria, descripcion }),
      });

      if (res.ok) {
        setDialogOpen(false);
        setAsunto("");
        setCategoria("OTRO");
        setDescripcion("");
        cargarTickets();
      } else {
        alert("Error al crear el ticket. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando tus tickets...</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#004B87]">Centro de Soporte</h1>
          <p className="mt-1 text-muted-foreground">
            ¿Tienes dudas o problemas? Abre un ticket y nuestro equipo te ayudará.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-[#004B87] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003a6b] disabled:pointer-events-none disabled:opacity-50">
            <Plus className="h-4 w-4" /> Nuevo Ticket
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Abrir Nuevo Ticket</DialogTitle>
                <DialogDescription>
                  Describe tu problema o consulta. Un administrador lo revisará pronto.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Categoría</label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Asunto</label>
                  <Input 
                    placeholder="Ej: No puedo descargar mi credencial" 
                    value={asunto} 
                    onChange={(e) => setAsunto(e.target.value)} 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Descripción detallada</label>
                  <Textarea 
                    placeholder="Explica tu situación con el mayor detalle posible..." 
                    value={descripcion} 
                    onChange={(e) => setDescripcion(e.target.value)} 
                    rows={4} 
                    required 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={enviando}>Cancelar</Button>
                <Button type="submit" className="bg-[#004B87] hover:bg-[#003a6b]" disabled={enviando}>
                  {enviando ? "Enviando..." : "Crear Ticket"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tickets.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold">No tienes tickets abiertos</h3>
            <p className="mt-2 text-sm text-muted-foreground">Cuando necesites ayuda, crea un nuevo ticket y aparecerá aquí.</p>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Link key={ticket.id} href={`/afiliado/soporte/${ticket.id}`}>
              <Card className="transition-all hover:border-[#004B87] hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">{ticket.asunto}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2 text-xs">
                        <span className="rounded bg-muted px-2 py-0.5 font-medium text-muted-foreground">{ticket.categoria}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(ticket.createdAt).toLocaleDateString("es-MX")}</span>
                      </CardDescription>
                    </div>
                    {getEstadoBadge(ticket.estado)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{ticket.descripcion}</p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
