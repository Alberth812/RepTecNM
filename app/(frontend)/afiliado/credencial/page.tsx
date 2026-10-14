"use client";

import { useEffect, useState } from "react";
import { Download, QrCode, EyeOff, AlertCircle, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { CredencialPDF } from "@/components/credencial/CredencialPDF";
import QRCode from "qrcode";

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

async function urlToBase64(url: string): Promise<string | undefined> {
 try {
 const response = await fetch(url, { 
 method: 'GET',
 credentials: 'include'
 });
 
 if (!response.ok) {
 console.error(`Error al obtener imagen: ${response.status} ${response.statusText}`);
 return undefined;
 }

 const blob = await response.blob();
 return new Promise((resolve, reject) => {
 const reader = new FileReader();
 reader.onloadend = () => resolve(reader.result as string);
 reader.onerror = reject;
 reader.readAsDataURL(blob);
 });
 } catch (error) {
 console.error("Error convirtiendo imagen a Base64:", error);
 return undefined;
 }
}

export default function CredencialDigitalPage() {
 const [credencial, setCredencial] = useState<CredencialData | null>(null);
 const [imgError, setImgError] = useState(false);
 const [loading, setLoading] = useState(true);
 const [verEmergencia, setVerEmergencia] = useState(false);
 const [password, setPassword] = useState("");
 const [showPasswordModal, setShowPasswordModal] = useState(false);
 const [verificando, setVerificando] = useState(false);
 const [generandoPDF, setGenerandoPDF] = useState(false);

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
 if (!credencial) return;
 setGenerandoPDF(true);
 try {
 toast.info("Generando PDF, esto puede tomar unos segundos...");
 
 const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
 const logoUrl = `${baseUrl}/logos/rep-tecnm.png`;
 
 // Generar QR en base64
 const qrUrl = `${baseUrl}/verificar/${credencial.folio}`;
 const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
 width: 150,
 margin: 1,
 color: {
 dark: "#000000",
 light: "#FFFFFF"
 }
 });
 
 let fotografiaBase64: string | undefined = undefined;
 
 if (credencial.fotografiaArchivoId) {
 const imageUrl = `${baseUrl}/api/archivo/${credencial.fotografiaArchivoId}`;
 console.log(" Intentando cargar imagen para PDF desde:", imageUrl);
 fotografiaBase64 = await urlToBase64(imageUrl);
 
 if (fotografiaBase64) {
 console.log(" Imagen convertida a Base64 exitosamente");
 } else {
 console.warn(" No se pudo convertir la imagen a Base64");
 }
 }

 const blob = await pdf(
 <CredencialPDF
 numeroAfiliado={credencial.numeroAfiliado}
 nombreCompleto={credencial.nombreCompleto}
 instituto={credencial.instituto}
 anioAprobacion={credencial.anioAprobacion}
 folio={credencial.folio}
 logoUrl={logoUrl}
 fotografiaUrl={fotografiaBase64}
 qrCodeDataUrl={qrCodeDataUrl}
 datosEmergencia={credencial.datosEmergencia ? {
 ...credencial.datosEmergencia,
 telefonoContacto: credencial.datosEmergencia.telefonoContacto
 } : null}
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
 toast.error("Error al generar el PDF. Revisa la consola para más detalles.");
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

 return (
 <div className="mx-auto max-w-4xl px-4 py-8">
 <div className="mb-6">
 <h1 className="text-3xl font-bold tracking-tight text-[#004B87]">Credencial Digital</h1>
 <p className="mt-2 text-muted-foreground">
 Tu credencial oficial de afiliado REP-TecNM. Descárgala o compártela mediante el código QR.
 </p>
 </div>

 <Card className="mb-6 overflow-hidden border-2 border-[#004B87]/20 shadow-lg">
 <div className="bg-white p-6 flex justify-center border-b border-[#004B87]/10">
 <img 
 src="/logos/rep-tecnm.png" 
 alt="Logo REP-TecNM" 
 className="h-20 w-auto object-contain"
 onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
 />
 </div>

 <CardContent className="p-6">
 <div className="grid gap-6 md:grid-cols-[1fr_auto]">
 <div className="space-y-5">
 <div className="flex items-start gap-4">
 <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
 {fotoUrlWeb ? (
 <img 
 src={fotoUrlWeb} 
 alt="Foto de perfil" 
 className="h-full w-full object-cover"
 onError={() => setImgError(true)}
 />
 ) : (
 <User className="h-12 w-12 text-gray-400" />
 )}
 </div>
 <div className="flex-1">
 <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nombre Completo</p>
 <p className="text-xl font-bold text-[#004B87]">{credencial.nombreCompleto}</p>
 
 <div className="grid grid-cols-2 gap-4 pt-4 mt-2 border-t">
 <div>
 <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">No. de Afiliado</p>
 <p className="text-base font-mono font-bold">{credencial.numeroAfiliado}</p>
 </div>
 <div>
 <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Instituto</p>
 <p className="text-sm font-medium">{credencial.instituto}</p>
 </div>
 <div>
 <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Año</p>
 <p className="text-sm font-medium">{credencial.anioAprobacion}</p>
 </div>
 <div>
 <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Folio</p>
 <p className="text-sm font-mono text-[#004B87]">{credencial.folio}</p>
 </div>
 </div>
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

 <div className="flex flex-wrap gap-3">
 <Button onClick={descargarPDF} className="bg-[#004B87] hover:bg-[#003a6b]" disabled={generandoPDF}>
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
