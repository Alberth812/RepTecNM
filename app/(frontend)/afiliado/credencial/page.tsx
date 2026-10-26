"use client";

import { useEffect, useState, useRef } from "react";
import { Download, QrCode, EyeOff, AlertCircle, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { CredencialHTML } from "@/components/credencial/CredencialHTML";
import { getTemplate } from "@/lib/credential-templates";

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

  const frenteRef = useRef<HTMLDivElement>(null);
  const reversoRef = useRef<HTMLDivElement>(null);

  // Obtener plantilla (puedes cambiar el ID aquí para usar otra plantilla)
  const template = getTemplate('rep-tecnm-2024');

  useEffect(() => {
    fetch("/api/afiliado/credencial", { credentials: "include" })
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
        credentials: "include",
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
    if (!credencial || !frenteRef.current || !reversoRef.current) return;

    setGenerandoPDF(true);
    try {
      toast.info("Generando credencial de 2 páginas...");

      // 1. Capturar el FRENTE como imagen de alta resolución
      const frenteDataUrl = await toPng(frenteRef.current, {
        quality: 1.0,
        pixelRatio: 3, // Alta resolución para impresión
        cacheBust: true,
        style: {
          transform: "none",
          transformOrigin: "top left",
        },
      });

      // 2. Capturar el REVERSO
      const reversoDataUrl = await toPng(reversoRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        cacheBust: true,
        style: {
          transform: "none",
          transformOrigin: "top left",
        },
      });

      // 3. Crear PDF en tamaño ID-1 horizontal (85.60mm × 53.98mm)
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.60, 53.98],
      });

      // 4. Agregar FRENTE (página 1)
      pdf.addImage(frenteDataUrl, "PNG", 0, 0, 85.60, 53.98);

      // 5. Agregar REVERSO (página 2)
      pdf.addPage([85.60, 53.98], "landscape");
      pdf.addImage(reversoDataUrl, "PNG", 0, 0, 85.60, 53.98);

      // 6. Descargar
      const nombreArchivo = `Credencial_${credencial.numeroAfiliado || "REPTECNM"}.pdf`;
      pdf.save(nombreArchivo);

      toast.success("Credencial de 2 páginas descargada");
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error("Error al generar la credencial");
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
  const fotoUrlWeb = credencial.fotografiaArchivoId ? `/api/archivo/${credencial.fotografiaArchivoId}` : undefined;
  const logoUrl = "/logos/rep-tecnm.png";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#004B87]">Credencial Digital</h1>
        <p className="mt-2 text-muted-foreground">
          Tu credencial oficial de afiliado REP-TecNM. Descárgala o compártela mediante el código QR.
        </p>
      </div>

      {/* VISTA WEB: CREDENCIAL DIGITAL */}
      <Card className="mb-6 border-2 border-[#004B87]/20 shadow-lg overflow-hidden">
        <div className="bg-[#004B87] px-6 py-4 flex items-center justify-center">
          <img
            src={logoUrl}
            alt="Logo REP-TecNM"
            className="h-8 w-auto object-contain brightness-0 invert"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        </div>

        <CardContent className="p-6">
          <div className="grid md:grid-cols-[1fr_auto] gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-lg overflow-hidden border-2 border-[#004B87]/20 bg-gray-100">
                  {fotoUrlWeb ? (
                    <img src={fotoUrlWeb} alt="Foto de perfil" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nombre Completo</p>
                  <p className="text-xl font-bold text-[#004B87] truncate">{credencial.nombreCompleto}</p>
                  <div className="mt-2 inline-block px-3 py-1 bg-[#C9A227]/10 rounded-full">
                    <span className="text-xs font-semibold text-[#C9A227] uppercase tracking-wide">Activo</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">No. de Afiliado</p>
                  <p className="text-sm font-mono font-bold text-gray-900">{credencial.numeroAfiliado}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Instituto</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{credencial.instituto}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Año</p>
                  <p className="text-sm font-medium text-gray-900">{credencial.anioAprobacion}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Folio</p>
                  <p className="text-xs font-mono font-bold text-[#004B87] truncate">{credencial.folio}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
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
                  <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)} className="border-red-300 text-red-700 hover:bg-red-100">
                    <Lock className="mr-2 h-4 w-4" /> Ver información
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setVerEmergencia(false)} className="border-red-300 text-red-700 hover:bg-red-100">
                    <EyeOff className="mr-2 h-4 w-4" /> Ocultar
                  </Button>
                )}
              </div>

              {verEmergencia && (
                <div className="grid gap-4 md:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="rounded-lg bg-red-100 p-4 text-center">
                    <p className="text-xs font-semibold uppercase text-red-900">Tipo Sanguíneo</p>
                    <p className="text-3xl font-bold text-red-700">{credencial.datosEmergencia.tipoSanguineo}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-red-900">Contacto de Emergencia</p>
                    <p className="text-lg font-bold">{credencial.datosEmergencia.nombreContacto}</p>
                    <p className="text-sm text-red-700">{credencial.datosEmergencia.parentesco} • {credencial.datosEmergencia.telefonoContacto}</p>
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

      {/* ============================================
          FRENTE DEL PDF (Oculto, solo para captura)
      ============================================ */}
      <div className="absolute -left-[9999px] top-0" aria-hidden="true">
        <div ref={frenteRef}>
          <CredencialHTML
            template={template}
            lado="frente"
            data={{
              numeroAfiliado: credencial.numeroAfiliado,
              nombreCompleto: credencial.nombreCompleto,
              instituto: credencial.instituto,
              anioAprobacion: credencial.anioAprobacion,
              folio: credencial.folio,
              fotografiaUrl: fotoUrlWeb,
              logoUrl: logoUrl,
            }}
          />
        </div>
      </div>

      {/* ============================================
          REVERSO DEL PDF (Oculto, solo para captura)
      ============================================ */}
      <div className="absolute -left-[9999px] top-0" aria-hidden="true">
        <div ref={reversoRef}>
          <CredencialHTML
            template={template}
            lado="reverso"
            urlVerificacion={urlVerificacion}
            data={{
              numeroAfiliado: credencial.numeroAfiliado,
              nombreCompleto: credencial.nombreCompleto,
              instituto: credencial.instituto,
              anioAprobacion: credencial.anioAprobacion,
              folio: credencial.folio,
              fotografiaUrl: fotoUrlWeb,
              logoUrl: logoUrl,
            }}
          />
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-wrap gap-3 mt-6">
        <Button onClick={descargarPDF} className="bg-[#004B87] hover:bg-[#003a6b]" disabled={generandoPDF}>
          <Download className="mr-2 h-4 w-4" />
          {generandoPDF ? "Generando PDF..." : "Descargar PDF (2 páginas)"}
        </Button>
        <Button variant="outline" onClick={() => window.open(urlVerificacion, "_blank")}>
          <QrCode className="mr-2 h-4 w-4" />
          Abrir URL de Verificación
        </Button>
      </div>

      {/* Modal de Contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardContent className="space-y-4 pt-6">
              <p className="text-sm text-muted-foreground">Ingresa tu contraseña actual para revelar los datos de emergencia.</p>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verificarPassword()}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
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