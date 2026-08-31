"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, CheckCircle2, ExternalLink, HeartPulse, User } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { verificarFolio, type VerificacionResultado } from "@/lib/mock/verificacion";

export default function VerificarPage() {
  const params = useParams();
  const folio = params.folio as string;
  const [resultado, setResultado] = useState<VerificacionResultado | null>(null);

  useEffect(() => {
    if (folio) {
      setResultado(verificarFolio(folio));
    }
  }, [folio]);

  if (!resultado) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Verificando...</p>
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
                        : resultado.estado === "INACTIVO"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {resultado.estado}
                  </Badge>
                </div>
              </div>

              {resultado.emergencia && resultado.estado === "ACTIVO" && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-red-800">
                    <HeartPulse className="h-4 w-4" /> Información de emergencia
                  </p>
                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-red-900">
                    <div>
                      <dt className="font-medium">Tipo sanguíneo</dt>
                      <dd>{resultado.emergencia.tipoSanguineo}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Alergias</dt>
                      <dd>{resultado.emergencia.alergias}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="font-medium">Contacto de emergencia</dt>
                      <dd>
                        {resultado.emergencia.contacto.nombre} ({resultado.emergencia.contacto.parentesco}) · {resultado.emergencia.contacto.telefono}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              {resultado.estado === "ACTIVO" && resultado.contactoPublico && resultado.idAfiliado && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-900">¿Quieres conocer más sobre este profesional?</p>
                  <p className="mt-1 text-xs text-blue-800">
                    Este afiliado autorizó mostrar su perfil público en el catálogo.
                  </p>
                  <Link href={`/catalogo/${resultado.idAfiliado}`} className="mt-3 block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <ExternalLink className="mr-2 h-4 w-4" /> Ver perfil completo
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
          <Link href="/" className="block text-center">
            <Button variant="outline">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
