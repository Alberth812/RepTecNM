"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, XCircle, User, FileText, GraduationCap, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface VerificacionData {
 encontrado: boolean;
 folio: string;
 nombreCompleto?: string;
 membershipStatus?: string;
 fotografiaArchivoId?: string;
 instituto?: string;
 anioAprobacion?: number;
 areaConocimiento?: string[];
}

export default function VerificarCredencialPage() {
 const params = useParams();
 const folio = params.folio as string;
 const [data, setData] = useState<VerificacionData | null>(null);
 const [loading, setLoading] = useState(true);
 const [fotoUrl, setFotoUrl] = useState<string | null>(null);

 useEffect(() => {
 async function cargarVerificacion() {
 try {
 const res = await fetch(`/api/verificar/${folio}`);
 const result = await res.json();
 
 if (result.encontrado && result.fotografiaArchivoId) {
 try {
 const fotoRes = await fetch(`/api/archivo/${result.fotografiaArchivoId}`, {
 credentials: "include"
 });
 if (fotoRes.ok) {
 const blob = await fotoRes.blob();
 const url = URL.createObjectURL(blob);
 setFotoUrl(url);
 }
 } catch (error) {
 console.warn("No se pudo cargar la foto:", error);
 }
 }
 
 setData(result);
 setLoading(false);
 } catch (error) {
 console.error("Error cargando verificación:", error);
 setLoading(false);
 }
 }
 
 cargarVerificacion();
 }, [folio]);

 if (loading) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
 <header className="bg-white border-b border-slate-200">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-16">
 <Link href="/" className="flex items-center gap-2">
 <img src="/logo.png" alt="REP-TecNM" className="h-10 w-auto" />
 </Link>
 </div>
 </div>
 </header>

 <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
 <div className="text-center">
 <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#004B87] mx-auto mb-4"></div>
 <p className="text-slate-600">Verificando credencial...</p>
 </div>
 </div>
 </div>
 );
 }

 // Si no se encontró la credencial
 if (!data || !data.encontrado) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
 <header className="bg-white border-b border-slate-200">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-16">
 <Link href="/" className="flex items-center gap-2">
 <img src="/logo.png" alt="REP-TecNM" className="h-10 w-auto" />
 </Link>
 <div className="flex items-center gap-3">
 <Link href="/login">
 <Button variant="outline" size="sm">
 Iniciar sesión
 </Button>
 </Link>
 </div>
 </div>
 </div>
 </header>

 <main className="flex items-center justify-center py-20 px-4">
 <div className="max-w-2xl w-full">
 <Card className="border-2 border-red-200 shadow-xl">
 <CardContent className="flex flex-col items-center p-12 text-center">
 <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
 <XCircle className="h-12 w-12 text-red-600" />
 </div>
 <h1 className="text-3xl font-bold text-red-700 mb-3">
 Credencial No Válida
 </h1>
 <p className="text-slate-600 mb-6 text-lg">
 El folio escaneado no corresponde a ninguna credencial activa en el sistema.
 </p>
 
 <div className="bg-slate-50 rounded-lg px-6 py-4 mb-8">
 <p className="text-sm text-slate-600 mb-2">Folio consultado:</p>
 <p className="font-mono font-semibold text-[#004B87] text-lg">{folio}</p>
 </div>

 <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
 <Link href="/" className="flex-1 sm:flex-none">
 <Button variant="outline" className="w-full sm:w-auto">
 <Home className="mr-2 h-4 w-4" />
 Ir al inicio
 </Button>
 </Link>
 </div>

 <div className="mt-8 pt-6 border-t border-slate-200">
 <p className="text-sm text-slate-500 mb-2">
 ¿Tienes dudas sobre tu credencial?
 </p>
 <Link href="/contacto" className="text-[#004B87] hover:underline text-sm font-medium">
 Contactar a la Red de Egresados
 </Link>
 </div>
 </CardContent>
 </Card>
 </div>
 </main>

 <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center text-slate-600">
 <p className="text-sm">
 Red de Egresados de Posgrado del TecNM © {new Date().getFullYear()}
 </p>
 </div>
 </div>
 </footer>
 </div>
 );
 }

 const esActivo = data.membershipStatus === "ACTIVO";

 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
 {/* Header Institucional */}
 <header className="bg-white border-b border-slate-200">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-16">
 <Link href="/" className="flex items-center gap-2">
 <img src="/logo.png" alt="REP-TecNM" className="h-10 w-auto" />
 </Link>
 <div className="flex items-center gap-3">
 <Link href="/login">
 <Button variant="outline" size="sm">
 Iniciar sesión
 </Button>
 </Link>
 </div>
 </div>
 </div>
 </header>

 {/* Contenido Principal */}
 <main className="py-12 px-4">
 <div className="max-w-2xl mx-auto">
 {/* Header simplificado - solo el check y título */}
 <div className="text-center mb-8">
 <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#004B87] mb-4">
 <CheckCircle2 className="h-12 w-12 text-white" />
 </div>
 <h1 className="text-3xl font-bold text-[#004B87] mb-1">Verificación de Credencial Digital</h1>
 </div>

 {/* Tarjeta de Verificación */}
 <Card className="border-2 border-slate-200 shadow-2xl overflow-hidden">
 {/* Header con estado */}
 <div className={`px-8 py-6 ${esActivo ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gradient-to-r from-amber-500 to-amber-600"}`}>
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold text-white mb-1">
 {esActivo ? "AFILIACIÓN VIGENTE" : "AFILIACIÓN NO VIGENTE"}
 </h2>
 <p className="text-white/90 text-sm">Credencial verificada correctamente</p>
 </div>
 <Badge className={`text-lg px-4 py-2 ${esActivo ? "bg-white text-emerald-600" : "bg-white text-amber-600"}`}>
 {data.membershipStatus}
 </Badge>
 </div>
 </div>

 <CardContent className="p-8">
 {/* Foto y Datos Principales */}
 <div className="flex flex-col md:flex-row gap-6 mb-8">
 <div className="flex-shrink-0">
 <div className="w-28 h-36 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-lg">
 {fotoUrl ? (
 <img src={fotoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <User className="h-12 w-12 text-slate-400" />
 </div>
 )}
 </div>
 </div>

 <div className="flex-1">
 <h3 className="text-2xl font-bold text-slate-900 mb-3">{data.nombreCompleto}</h3>
 <div className="space-y-2">
 <div className="flex items-center gap-2 text-slate-600">
 <FileText className="h-4 w-4" />
 <span className="text-sm">Folio: <span className="font-mono font-semibold text-[#004B87]">{data.folio}</span></span>
 </div>
 {data.instituto && (
 <div className="flex items-center gap-2 text-slate-600">
 <GraduationCap className="h-4 w-4" />
 <span className="text-sm">{data.instituto}</span>
 </div>
 )}
 {data.anioAprobacion && (
 <div className="flex items-center gap-2 text-slate-600">
 <GraduationCap className="h-4 w-4" />
 <span className="text-sm">Año de graduación: {data.anioAprobacion}</span>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Áreas de Conocimiento */}
 {data.areaConocimiento && data.areaConocimiento.length > 0 && (
 <div className="mb-6">
 <h4 className="text-sm font-semibold text-slate-700 mb-3">Áreas de Conocimiento</h4>
 <div className="flex flex-wrap gap-2">
 {data.areaConocimiento.map((area, idx) => (
 <Badge key={idx} variant="secondary" className="bg-blue-50 text-[#004B87] border-blue-200">
 {area}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {/* Botón de acción - solo Ir al inicio */}
 <div className="border-t border-slate-200 pt-6 mt-6">
 <div className="flex justify-center">
 <Link href="/">
 <Button variant="outline">
 <Home className="mr-2 h-4 w-4" />
 Ir al inicio
 </Button>
 </Link>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </main>

 {/* Footer */}
 <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center text-slate-600">
 <p className="text-sm">
 Red de Egresados de Posgrado del TecNM © {new Date().getFullYear()}
 </p>
 </div>
 </div>
 </footer>
 </div>
 );
}
