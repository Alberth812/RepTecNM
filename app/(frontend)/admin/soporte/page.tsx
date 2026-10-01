"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle, Clock, MessageSquare, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Ticket {
  id: string;
  asunto: string;
  estado: string;
  categoria: string;
  createdAt: string;
  afiliado: {
    nombres: string;
    apellidoPaterno: string;
  };
}

function getEstadoBadge(estado: string) {
  switch (estado) {
    case "PENDIENTE":
      return <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50"><AlertCircle className="mr-1 h-3 w-3" /> Pendiente</Badge>;
    case "ATENDIDO":
      return <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50"><MessageSquare className="mr-1 h-3 w-3" /> Atendido</Badge>;
    case "SOLUCIONADO":
      return <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50"><CheckCircle className="mr-1 h-3 w-3" /> Solucionado</Badge>;
    case "CERRADO":
      return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> Cerrado</Badge>;
    default:
      return <Badge variant="secondary">{estado}</Badge>;
  }
}

export default function AdminSoportePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");

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

  useEffect(() => {
    cargarTickets();
  }, []);

  const ticketsFiltrados = tickets.filter((ticket) => {
    const coincideEstado = filtroEstado === "TODOS" || ticket.estado === filtroEstado;
    const coincideBusqueda = ticket.asunto.toLowerCase().includes(busqueda.toLowerCase());
    return coincideEstado && coincideBusqueda;
  });

  const pendientes = tickets.filter((t) => t.estado === "PENDIENTE").length;
  const atendidos = tickets.filter((t) => t.estado === "ATENDIDO").length;
  const solucionados = tickets.filter((t) => t.estado === "SOLUCIONADO").length;

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando tickets...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#004B87]">Gestión de Tickets de Soporte</h1>
        <p className="mt-2 text-muted-foreground">
          Revisa y gestiona las solicitudes de soporte de los afiliados.
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{atendidos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Solucionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{solucionados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Select value={filtroEstado} onValueChange={(val) => setFiltroEstado(val ?? "")}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos los estados</SelectItem>
              <SelectItem value="PENDIENTE">Pendientes</SelectItem>
              <SelectItem value="ATENDIDO">Atendidos</SelectItem>
              <SelectItem value="SOLUCIONADO">Solucionados</SelectItem>
              <SelectItem value="CERRADO">Cerrados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por asunto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de tickets */}
      <div className="grid gap-4">
        {ticketsFiltrados.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold">No hay tickets</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No se encontraron tickets con los filtros seleccionados.
            </p>
          </Card>
        ) : (
          ticketsFiltrados.map((ticket) => (
            <Link key={ticket.id} href={`/admin/soporte/${ticket.id}`}>
              <Card className="transition-all hover:border-[#004B87] hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">{ticket.asunto}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Categoría: <span className="font-medium">{ticket.categoria}</span>
                      </p>
                    </div>
                    {getEstadoBadge(ticket.estado)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Creado el {new Date(ticket.createdAt).toLocaleDateString("es-MX")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
