"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, HeartPulse, Search, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { credencial } from "@/lib/mock/credencial";

export default function VerificarPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");

  const folio = pathname.split("/").filter(Boolean)[1] ?? "";
  const encontrada = folio.toUpperCase() === credencial.folio;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Verificación de credencial</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Consulta pública sin autenticación (RF-CRED-009 y RF-CRED-010).
          </p>
        </div>

        <form
          className="mb-8 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (busqueda.trim()) router.push(`/verificar/${busqueda.trim().toUpperCase()}`);
          }}
        >
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por folio, ej. A1B2C3D4E5F6"
            className="font-mono"
          />
          <Button type="submit" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {folio === "" ? null : encontrada ? (
          <div className="overflow-hidden rounded-3xl border shadow-xl">
            <div className="bg-gradient-to-r from-[#004B87] to-[#0070C0] p-5 text-white">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-5 w-5" /> Credencial válida
              </div>
            </div>
            <div className="space-y-4 bg-background p-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-16 rounded-lg border">
                  <AvatarFallback className="rounded-lg bg-[#004B87]/10 text-xl font-bold text-[#004B87]">
                    MF
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{credencial.nombre}</p>
                  <p className="text-sm text-primary">{credencial.numeroAfiliado}</p>
                  <Badge variant="outline" className="mt-1">ACTIVO</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Folio verificado: <span className="font-mono font-semibold">{credencial.folio}</span>
              </p>

              {credencial.emergenciaVisible && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-red-800">
                    <HeartPulse className="h-4 w-4" /> En caso de emergencia
                  </p>
                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-red-900">
                    <div><dt className="font-medium">Tipo sanguíneo</dt><dd>{credencial.emergencia.tipoSanguineo}</dd></div>
                    <div><dt className="font-medium">Alergias</dt><dd>{credencial.emergencia.alergencia ?? credencial.emergencia.alergias}</dd></div>
                    <div className="col-span-2">
                      <dt className="font-medium">Contacto</dt>
                      <dd>
                        {credencial.emergencia.contacto.nombre} ({credencial.emergencia.contacto.parentesco}) · {credencial.emergencia.contacto.telefono}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border bg-card p-8 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 font-semibold">No encontrado</p>
            <p className="mt-2 text-sm text-muted-foreground">
              El folio <span className="font-mono">{folio}</span> no corresponde a ninguna
              credencial vigente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}