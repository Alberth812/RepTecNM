"use client";

import { useEffect, useState } from "react";
import { Search, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { CredencialPDF } from "@/components/credencial/CredencialPDF";
import QRCode from "qrcode";

interface Afiliado {
  userId: string;
  nombreCompleto: string;
  folio: string;
  membershipStatus: string;
  fotografiaArchivoId?: string;
  email: string;
  datosEmergencia?: {
    tipoSanguineo: string;
    alergiasCondiciones: string;
    nombreContacto: string;
    parentesco: string;
    telefonoContacto: string;
  } | null;
}

export default function AdminCredencialesPage() {
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [generandoPDF, setGenerandoPDF] = useState<string | null>(null);

  const cargarAfiliados = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busqueda) params.set("q", busqueda);
      if (estadoFiltro) params.set("estado", estadoFiltro);

      const res = await fetch(`/api/admin/credenciales?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAfiliados(data);
      } else {
        toast.error("Error al cargar afiliados");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar afiliados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAfiliados();
  }, [busqueda, estadoFiltro]);

  const descargarCredencial = async (afiliado: Afiliado) => {
    setGenerandoPDF(afiliado.userId);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const logoUrl = `${baseUrl}/logos/rep-tecnm.png`;
      const fotografiaUrl = afiliado.fotografiaArchivoId
        ? `${baseUrl}/api/archivo/${afiliado.fotografiaArchivoId}`
        : undefined;

      // Generar QR como base64 para el PDF
      const qrCodeDataUrl = await QRCode.toDataURL(
        `${baseUrl}/verificar/${afiliado.folio}`,
        {
          width: 200,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF"
          }
        }
      );

      const blob = await pdf(
        <CredencialPDF
          numeroAfiliado={afiliado.folio}
          nombreCompleto={afiliado.nombreCompleto}
          instituto="Instituto Tecnológico"
          anioAprobacion={new Date().getFullYear()}
          folio={afiliado.folio}
          logoUrl={logoUrl}
          fotografiaUrl={fotografiaUrl}
          qrCodeDataUrl={qrCodeDataUrl}
          datosEmergencia={afiliado.datosEmergencia}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `credencial-${afiliado.folio}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Credencial de ${afiliado.nombreCompleto} descargada`);
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error("Error al generar el PDF");
    } finally {
      setGenerandoPDF(null);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const colores: Record<string, string> = {
      ACTIVO: "bg-green-100 text-green-800 border-green-300",
      INACTIVO: "bg-yellow-100 text-yellow-800 border-yellow-300",
      SUSPENDIDO: "bg-red-100 text-red-800 border-red-300",
      PENDIENTE_APROBACION: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return <Badge className={`${colores[estado] || "bg-gray-100"} border`}>{estado}</Badge>;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#004B87]">Gestión de Credenciales</h1>
        <p className="mt-2 text-muted-foreground">
          Busca afiliados y descarga sus credenciales digitales.
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o folio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={estadoFiltro} onValueChange={(val) => setEstadoFiltro(val ?? "")}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="ACTIVO">Activos</SelectItem>
                <SelectItem value="INACTIVO">Inactivos</SelectItem>
                <SelectItem value="SUSPENDIDO">Suspendidos</SelectItem>
                <SelectItem value="PENDIENTE_APROBACION">Pendientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de afiliados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Afiliados encontrados ({afiliados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Cargando...</div>
          ) : afiliados.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No se encontraron afiliados con los filtros seleccionados.
            </div>
          ) : (
            <div className="space-y-3">
              {afiliados.map((afiliado) => (
                <div
                  key={afiliado.userId}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{afiliado.nombreCompleto}</h3>
                      {getEstadoBadge(afiliado.membershipStatus)}
                    </div>
                    <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                      <span>Folio: <span className="font-mono">{afiliado.folio}</span></span>
                      <span>Email: {afiliado.email}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => descargarCredencial(afiliado)}
                    disabled={generandoPDF === afiliado.userId}
                    className="ml-4 bg-[#004B87] hover:bg-[#003a6b]"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {generandoPDF === afiliado.userId ? "Generando..." : "Descargar"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
