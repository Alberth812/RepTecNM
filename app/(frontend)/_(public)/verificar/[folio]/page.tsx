"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, XCircle, AlertTriangle, Phone, Droplet, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function VerificarCredencialPage() {
  const params = useParams();
  const folio = params?.folio as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!folio) return;
    fetch(`/api/verificar/${folio}`)
      .then((res) => {
        if (res.status === 404) throw new Error("Credencial no encontrada");
        if (!res.ok) throw new Error("Error al verificar");
        return res.json();
      })
      .then((json) => {
        setData(json.afiliado);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [folio]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-muted-foreground">Verificando credencial...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <XCircle className="mb-4 h-16 w-16 text-red-500" />
            <h2 className="text-xl font-bold text-red-700">Credencial no válida</h2>
            <p className="mt-2 text-sm text-red-600">
              El folio escaneado no corresponde a ninguna credencial activa en el sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const esActivo = data.membershipStatus === "ACTIVO";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Encabezado de verificación */}
        <div className="text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#004B87] text-white">
            {esActivo ? <CheckCircle className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
          </div>
          <h1 className="text-2xl font-bold text-[#004B87]">REP-TecNM</h1>
          <p className="text-sm text-muted-foreground">Verificación de Credencial Digital</p>
        </div>

        {/* Tarjeta de Identidad */}
        <Card className="border-2 border-[#004B87]/20">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-lg">
              {esActivo ? "AFILIACIÓN VIGENTE" : "AFILIACIÓN NO VIGENTE"}
            </CardTitle>
            <Badge variant={esActivo ? "default" : "destructive"} className="mt-1">
              {data.membershipStatus}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="text-xl font-semibold">{data.nombreCompleto || "Nombre no disponible"}</div>
            <div className="text-sm text-muted-foreground">Folio: {folio}</div>
            
            {/* Foto (si existe y está autorizada) */}
            {data.fotografiaArchivoId && (
              <div className="mx-auto mt-4 h-32 w-32 overflow-hidden rounded-full border-4 border-[#004B87]/10 bg-gray-200">
                {/* Aquí iría la URL real de la imagen desde Garage/S3 */}
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Foto de Perfil
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tarjeta de Emergencia (Solo si está habilitada) */}
        {data.datosEmergencia && esActivo && (
          <Card className="border-l-4 border-l-red-500 bg-red-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-red-700">
                <AlertCircle className="h-5 w-5" />
                EN CASO DE EMERGENCIA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <div>
                  <p className="font-semibold">{data.datosEmergencia.nombreContacto}</p>
                  <p className="text-muted-foreground">
                    {data.datosEmergencia.parentesco} {data.datosEmergencia.parentescoOtro && `(${data.datosEmergencia.parentescoOtro})`}
                  </p>
                  <p className="font-mono text-red-700">{data.datosEmergencia.telefono}</p>
                </div>
              </div>
              
              <div className="border-t border-red-200 pt-2">
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-red-600" />
                  <span className="font-semibold">Tipo Sanguíneo:</span>
                  <span className="font-mono">{data.datosEmergencia.tipoSanguineo}</span>
                </div>
                {data.datosEmergencia.alergiasCondicionesMedicas && (
                  <div className="mt-2">
                    <p className="font-semibold text-red-700">Alergias / Condiciones:</p>
                    <p className="text-muted-foreground">{data.datosEmergencia.alergiasCondicionesMedicas}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Verificación realizada el {new Date().toLocaleDateString("es-MX")}
        </p>
      </div>
    </div>
  );
}
