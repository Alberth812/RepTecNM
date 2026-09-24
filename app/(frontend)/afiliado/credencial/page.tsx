"use client";

import { useEffect, useState } from "react";
import { Download, QrCode, Eye, EyeOff, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { CredencialPDF } from "@/components/credencial/CredencialPDF";

interface CredencialData {
  numeroAfiliado: string;
  folio: string;
  nombreCompleto: string;
  instituto: string;
  anioAprobacion: number;
  fotografiaUrl?: string;
  datosEmergencia?: {
    tipoSanguineo: string;
    alergiasCondiciones: string;
    nombreContacto: string;
    parentesco: string;
    telefonoContacto: string;
  };
  mostrarEmergencia: boolean;
}

export default function CredencialDigitalPage() {
  const [credencial, setCredencial] = useState<CredencialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [verEmergencia, setVerEmergencia] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    fetch("/api/afiliado/credencial")
      .then((res) => {
        if (res.status === 404) throw new Error("No tienes una credencial generada.");
        if (!res.ok) throw new Error("Error al cargar credencial");
        return res.json();
      })
      .then((data) => {
        setCredencial(data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.message);
        setLoading(false);
      });
  }, []);

  const verificarPassword = async () => {
    setVerificando(true);
    try {
      const res = await fetch("/api/afiliado/credencial/verificar-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setVerEmergencia(true);
        setShowPasswordModal(false);
        setPassword("");
        toast.success("Datos de emergencia visibles");
      } else {
        toast.error("Contraseña incorrecta");
      }
    } catch {
      toast.error("Error al verificar contraseña");
    } finally {
      setVerificando(false);
    }
  };

  const descargarPDF = async () => {
    if (!credencial) return;
    try {
      toast.info("Generando PDF...");
      const blob = await pdf(
        <CredencialPDF
          numeroAfiliado={credencial.numeroAfiliado}
          nombreCompleto={credencial.nombreCompleto}
          instituto={credencial.instituto}
          anioAprobacion={credencial.anioAprobacion}
          folio={credencial.folio}
          fotografiaUrl={credencial.fotografiaUrl}
          datosEmergencia={credencial.datosEmergencia}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `credencial-${credencial.numeroAfiliado}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("PDF descargado correctamente");
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error("Error al generar el PDF");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Cargando credencial...</p>
      </div>
    );
  }

  if (!credencial) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-yellow-500" />
            <h2 className="text-xl font-semibold">Credencial no disponible</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              No tienes una credencial generada. Contacta al administrador general.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const urlVerificacion = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/verificar/${credencial.folio}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#004B87]">Credencial Digital</h1>
        <p className="mt-2 text-muted-foreground">
          Tu credencial oficial de afiliado REP-TecNM. Descárgala o compártela mediante el código QR.
        </p>
      </div>

      {/* Vista Digital de la Credencial */}
      <Card className="mb-6 overflow-hidden border-2 border-[#004B87]/20">
        {/* Header institucional */}
        <div className="bg-gradient-to-br from-[#004B87] to-[#003a6b] p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">REP-TecNM</p>
              <h2 className="text-2xl font-bold">Red de Egresados de Posgrado</h2>
              <p className="text-sm opacity-90">TecNM</p>
            </div>
            <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">
              ACTIVO
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-[1fr_auto]">
            {/* Información principal */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Número de Afiliado
                </p>
                <p className="text-2xl font-bold text-[#004B87]">{credencial.numeroAfiliado}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Nombre Completo
                </p>
                <p className="text-lg font-semibold">{credencial.nombreCompleto}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Instituto
                  </p>
                  <p className="text-sm">{credencial.instituto}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Año de Aprobación
                  </p>
                  <p className="text-sm">{credencial.anioAprobacion}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Folio de Verificación
                </p>
                <p className="font-mono text-sm">{credencial.folio}</p>
              </div>
            </div>

            {/* Código QR */}
            <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/50 p-4">
              <div className="rounded-lg border-2 border-white bg-white p-3 shadow-sm">
                <QRCodeSVG value={urlVerificacion} size={140} />
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Escanea para verificar
              </p>
            </div>
          </div>

          {/* Datos de Emergencia - RF-CRED-006 */}
          {credencial.datosEmergencia && (
            <div className="mt-6 rounded-lg border-2 border-red-200 bg-red-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  EN CASO DE EMERGENCIA
                </h3>
                {!verEmergencia ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswordModal(true)}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Ver información
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVerEmergencia(false)}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <EyeOff className="mr-2 h-4 w-4" />
                    Ocultar
                  </Button>
                )}
              </div>

              {verEmergencia && (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-red-100 p-3 text-center">
                    <p className="text-xs font-medium text-red-900">Tipo Sanguíneo</p>
                    <p className="text-2xl font-bold text-red-700">
                      {credencial.datosEmergencia.tipoSanguineo}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-900">Contacto de Emergencia</p>
                    <p className="font-semibold">{credencial.datosEmergencia.nombreContacto}</p>
                    <p className="text-sm text-red-600">
                      {credencial.datosEmergencia.parentesco} •{" "}
                      {credencial.datosEmergencia.telefonoContacto}
                    </p>
                  </div>
                  {credencial.datosEmergencia.alergiasCondiciones && (
                    <div className="md:col-span-2">
                      <p className="text-xs font-medium text-red-900">Alergias / Condiciones</p>
                      <p className="text-sm">{credencial.datosEmergencia.alergiasCondiciones}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={descargarPDF} className="bg-[#004B87] hover:bg-[#003a6b]">
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF (Imprimible)
        </Button>
        <Button variant="outline" onClick={() => window.open(urlVerificacion, "_blank")}>
          <QrCode className="mr-2 h-4 w-4" />
          Abrir URL de Verificación
        </Button>
      </div>

      {/* Modal de contraseña - RF-CRED-006 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Verificar Identidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ingresa tu contraseña para ver los datos de emergencia de tu credencial.
              </p>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verificarPassword()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={verificarPassword} className="bg-[#004B87]" disabled={verificando}>
                  {verificando ? "Verificando..." : "Verificar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
