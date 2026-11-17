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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header Limpio */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="REP-TecNM" className="h-8 w-auto" />
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-600">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          
          {/* Título de la página */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Verificación de Credencial Digital
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Sistema de validación de la Red de Egresados de Posgrado del TecNM
            </p>
          </div>

          {/* Tarjeta de Verificación (Estilo Suizo: Sin sombras pesadas, bordes sutiles) */}
          <Card className="border border-slate-200 bg-white overflow-hidden">
            
            {/* Banner de Estado (Plano, sin degradados) */}
            <div className={`px-6 py-4 border-b ${esActivo ? "bg-[#F0F4F8] border-[#E5EAF0]" : "bg-red-50 border-red-100"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {esActivo ? (
                    <CheckCircle2 className="h-6 w-6 text-[#004B87]" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <h2 className={`text-lg font-bold ${esActivo ? "text-[#004B87]" : "text-red-700"}`}>
                      {esActivo ? "AFILIACIÓN VIGENTE" : "AFILIACIÓN NO VIGENTE"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Folio verificado el {new Date().toLocaleDateString('es-MX')}
                    </p>
                  </div>
                </div>
                <Badge className={`text-xs px-3 py-1 font-mono ${esActivo ? "bg-[#004B87] text-white" : "bg-red-600 text-white"}`}>
                  {data.membershipStatus}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              {/* Foto y Datos Principales */}
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Foto */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="w-24 h-32 rounded overflow-hidden bg-slate-100 border border-slate-200">
                    {fotoUrl ? (
                      <img src={fotoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-10 w-10 text-slate-300" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Información */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 uppercase tracking-wide">
                    {data.nombreCompleto}
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="text-slate-500 font-medium w-24">Folio:</span>
                      <span className="font-mono font-semibold text-slate-900">{data.folio}</span>
                    </div>
                    {data.instituto && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-slate-500 font-medium w-24">Instituto:</span>
                        <span className="text-slate-900">{data.instituto}</span>
                      </div>
                    )}
                    {data.anioAprobacion && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-slate-500 font-medium w-24">Año:</span>
                        <span className="text-slate-900">{data.anioAprobacion}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Áreas de Conocimiento */}
              {data.areaConocimiento && data.areaConocimiento.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Áreas de Conocimiento
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.areaConocimiento.map((area, idx) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Aviso de Privacidad Simplificado */}
              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Esta verificación es de carácter informativo. La Red de Egresados de Posgrado del TecNM 
                  se reserva el derecho de actualizar o modificar el estado de las afiliaciones en cualquier momento.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botón de acción */}
          <div className="mt-8 text-center">
            <Link href="/">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                <Home className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-500">
            Red de Egresados de Posgrado del TecNM © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}