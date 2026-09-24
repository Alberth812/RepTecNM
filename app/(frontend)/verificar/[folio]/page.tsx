"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, ExternalLink, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VerificacionResultado {
  encontrado: boolean;
  folio: string;
  nombre?: string;
  numero?: string;
  posgrado?: string;
  instituto?: string;
  estado?: string;
  idAfiliado?: string;
  contactoPublico?: boolean;
}

export default function VerificarPage() {
  const params = useParams();
  const router = useRouter();
  const folio = params.folio as string;
  const [resultado, setResultado] = useState<VerificacionResultado | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function verificar() {
      if (!folio) return;
      setCargando(true);
      try {
        const res = await fetch(`/api/verificar/${encodeURIComponent(folio)}`);
        const data = await res.json();
        setResultado(data);
      } catch (error) {
        console.error("Error al verificar folio:", error);
        setResultado({ encontrado: false, folio });
      } finally {
        setCargando(false);
      }
    }
    verificar();
  }, [folio]);

  if (cargando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#004B87] border-t-transparent"></div>
      </div>
    );
  }

  if (!resultado) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Error al cargar la verificación.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-3xl border bg-card p-8 shadow-lg">
        {resultado.encontrado ? (
          <>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Credencial verificada</h1>
                <p className="text-sm text-muted-foreground">Folio: {resultado.folio}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#004B87]/10">
                    <User className="h-6 w-6 text-[#004B87]" />
                  </div>
                  <div>
                    <p className="font-semibold">{resultado.nombre}</p>
                    <p className="text-sm text-muted-foreground">{resultado.numero}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p>{resultado.posgrado}</p>
                  <p className="text-muted-foreground">{resultado.instituto}</p>
                </div>
                <div className="mt-3">
                  <Badge
                    variant="secondary"
                    className={
                      resultado.estado === "ACTIVO"
                        ? "bg-green-100 text-green-800"
                        : resultado.estado === "INACTIVO" || resultado.estado === "SUSPENDIDO"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {resultado.estado === "ACTIVO" ? "ACTIVO" : "AFILIACIÓN NO VIGENTE"}
                  </Badge>
                </div>
              </div>

              {resultado.estado === "ACTIVO" && resultado.contactoPublico && resultado.idAfiliado && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-900">¿Quieres conocer más sobre este profesional?</p>
                  <p className="mt-1 text-xs text-blue-800">
                    Este afiliado autorizó mostrar su perfil público en el catálogo.
                  </p>
                  <Link href="/catalogo" className="mt-3 block">
                    <Button className="w-full bg-[#004B87] hover:bg-[#003a68]">
                      <ExternalLink className="mr-2 h-4 w-4" /> Ir al Catálogo Profesional
                    </Button>
                  </Link>
                </div>
              )}

              {resultado.estado !== "ACTIVO" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                    <AlertCircle className="h-4 w-4" /> Afiliación no activa
                  </p>
                  <p className="mt-1 text-xs text-amber-800">
                    Esta credencial corresponde a un afiliado que no se encuentra en estado ACTIVO.
                    {resultado.estado === "INACTIVO" && " Puede tratarse de una membresía desactualizada."}
                    {resultado.estado === "BAJA" && " Este afiliado ha causado baja de la red."}
                    {resultado.estado === "SUSPENDIDO" && " La afiliación se encuentra suspendida temporalmente."}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Credencial no encontrada</h1>
                <p className="text-sm text-muted-foreground">Folio: {resultado.folio}</p>
              </div>
            </div>
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-900">
                No se encontró ninguna credencial asociada a este folio. Verifica que el código QR
                sea válido y pertenezca a un afiliado de la Red de Egresados de Posgrado del TecNM.
              </p>
            </div>
          </>
        )}

        <div className="mt-8 border-t pt-4">
          <Button 
            variant="outline" 
            onClick={() => router.push("/")}
            className="w-full"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
