"use client";

import { useEffect, useState } from "react";
import { Download, QrCode, EyeOff, AlertCircle, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { CredencialPDFSimple } from "@/components/credencial/CredencialPDFSimple";

interface CredencialData {
  numeroAfiliado: string;
  folio: string;
  nombreCompleto: string;
  instituto: string;
  anioAprobacion: number;
  fotografiaArchivoId?: string;
  datosEmergencia?: {
    tipoSanguineo: string;
    alergiasCondiciones: string;
    nombreContacto: string;
    parentesco: string;
    telefonoContacto: string;
  } | null;
}

export default function CredencialDigitalPage() {
  const [credencial, setCredencial] = useState<CredencialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [verEmergencia, setVerEmergencia] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  useEffect(() => {
    fetch("/api/afiliado/credencial")
      .then((res) => {
        if (res.status === 404) throw new Error("No tienes una credencial activa.");
        if (!res.ok) throw new Error("Error al cargar la credencial");
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
    setGenerandoPDF(true);
    try {
      toast.info("Generando PDF...");
      
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const logoUrl = `${baseUrl}/logos/rep-tecnm.png`;
      const fotografiaUrl = credencial.fotografiaArchivoId 
        ? `${baseUrl}/api/archivo/${credencial.fotografiaArchivoId}`
        : undefined;

      const blob = await pdf(
        <CredencialPDFSimple
          numeroAfiliado={credencial.numeroAfiliado}
          nombreCompleto={credencial.nombreCompleto}
          instituto={credencial.instituto}
          anioAprobacion={credencial.anioAprobacion}
          folio={credencial.folio}
          logoUrl={logoUrl}
          fotografiaUrl={fotografiaUrl}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `credencial-${credencial.numeroAfiliado}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF descargado correctamente");
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error("Error al generar el PDF");
    } finally {
      setGenerandoPDF(false);
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
              Tu cuenta no está en estado ACTIVO o no has completado el registro.
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

      <Card className="mb-6 overflow-hidden border-2 border-[#004B87]/20 shadow-lg">
        <div className="bg-[#004B87] p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-2">
              <img 
                src="/logos/rep-tecnm.png" 
                alt="Logo REP-TecNM" 
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">REP-TecNM</h2>
              <p className="text-sm opacity-90">Red de Egresados de Posgrado</p>
              <Badge className="mt-2 bg-white/20 text-white hover:bg-white/30 border-0">
                AFILIACIÓN VIGENTE
              </Badge>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-[1fr_auto]">
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100 border border-gray-200">
                  <User className="h-10 w-10 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Nombre Completo
                  </p>
                  <p className="text-lg font-bold text-[#004B87]">{credencial.nombreCompleto}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    No. de Afiliado
                  </p>
                  <p className="text-base font-mono font-bold">{credencial.numeroAfiliado}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Instituto
                  </p>
                  <p className="text-sm font-medium">{credencial.instituto}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Año
                  </p>
                  <p className="text-sm font-medium">{credencial.anioAprobacion}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Folio de Verificación
                  </p>
                  <p className="text-sm font-mono text-[#004B87]">{credencial.folio}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl border bg-gray-50 p-4">
              <div className="rounded-lg border-2 border-white bg-white p-2 shadow-sm">
                <QRCodeSVG value={urlVerificacion} size={120} />
              </div>
              <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
                Escanea para verificar
              </p>
            </div>
          </div>

          {credencial.datosEmergencia && (
            <div className="mt-6 rounded-xl border-2 border-red-200 bg-red-50/50 p-5">
              <div className="mb-4 flex items-center justify-between">
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
                <div className="grid gap-4 md:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="rounded-lg bg-red-100 p-4 text-center">
                    <p className="text-xs font-semibold uppercase text-red-900">Tipo Sanguíneo</p>
                    <p className="text-3xl font-bold text-red-700">
                      {credencial.datosEmergencia.tipoSanguineo}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-red-900">Contacto de Emergencia</p>
                    <p className="text-lg font-bold">{credencial.datosEmergencia.nombreContacto}</p>
                    <p className="text-sm text-red-700">
                      {credencial.datosEmergencia.parentesco} • {credencial.datosEmergencia.telefonoContacto}
                    </p>
                  </div>
                  {credencial.datosEmergencia.alergiasCondiciones && credencial.datosEmergencia.alergiasCondiciones !== "Ninguna" && (
                    <div className="md:col-span-2 rounded-lg bg-white p-3 border border-red-200">
                      <p className="text-xs font-semibold uppercase text-red-900 mb-1">Alergias / Condiciones</p>
                      <p className="text-sm text-gray-800">{credencial.datosEmergencia.alergiasCondiciones}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={descargarPDF} 
          className="bg-[#004B87] hover:bg-[#003a6b]"
          disabled={generandoPDF}
        >
          <Download className="mr-2 h-4 w-4" />
          {generandoPDF ? "Generando PDF..." : "Descargar PDF (Imprimible)"}
        </Button>
        <Button variant="outline" onClick={() => window.open(urlVerificacion, "_blank")}>
          <QrCode className="mr-2 h-4 w-4" />
          Abrir URL de Verificación
        </Button>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Verificar Identidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ingresa tu contraseña actual para revelar los datos de emergencia de tu credencial.
              </p>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verificarPassword()}
                autoFocus
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
