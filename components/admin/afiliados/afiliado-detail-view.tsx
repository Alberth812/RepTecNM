// @/components/admin/afiliados/afiliado-detail-view.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AfiliadoFoto } from "@/components/admin/afiliados/afiliado-foto";
import { SuspenderAfiliadoDialog } from "@/components/admin/afiliados/suspender-afiliado-dialog";
import { QuitarSuspensionDialog } from "@/components/admin/afiliados/quitar-suspension-dialog";
import { useAfiliadoDetalleQuery } from "@/lib/hooks/use-afiliados";
import type { ApiClientError } from "@/lib/api/client/afiliados";

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ACTIVO: "default",
  INACTIVO: "secondary",
  SUSPENDIDO: "destructive",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  SUSPENDIDO: "Suspendido",
  NO_INICIADA: "No iniciada",
};

interface AfiliadoDetailViewProps {
  userId: string;
}

export function AfiliadoDetailView({ userId }: AfiliadoDetailViewProps) {
  const { data, isLoading, isError, error } = useAfiliadoDetalleQuery(userId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando afiliado…</p>;
  }

  if (isError || !data) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">
          {(error as ApiClientError)?.message ??
            "No se pudo cargar la información del afiliado."}
        </p>
        <Button /*asChild*/ variant="outline" size="sm">
          <Link href="/admin/afiliados">
            <ArrowLeft className="size-4" />
            Volver al listado
          </Link>
        </Button>
      </div>
    );
  }

  const nombreCompleto = [
    data.apellidoPaterno,
    data.apellidoMaterno,
    data.nombres,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <Button /*asChild*/ variant="ghost" size="sm">
          <Link href="/admin/afiliados">
            <ArrowLeft className="size-4" />
            Volver al listado
          </Link>
        </Button>

        {data.membershipStatus === "ACTIVO" && (
          <SuspenderAfiliadoDialog
            userId={userId}
            nombreCompleto={nombreCompleto}
          />
        )}
        {data.membershipStatus === "SUSPENDIDO" && (
          <QuitarSuspensionDialog
            userId={userId}
            nombreCompleto={nombreCompleto}
            motivoSuspension={data.motivoSuspension}
          />
        )}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 pt-6 sm:flex-row">
          <AfiliadoFoto
            url={data.fotografiaUrl}
            nombreCompleto={nombreCompleto}
          />
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">
                {nombreCompleto || "Sin nombre registrado"}
              </h1>
              <Badge
                variant={STATUS_VARIANT[data.membershipStatus] ?? "outline"}
              >
                {STATUS_LABEL[data.membershipStatus] ?? data.membershipStatus}
              </Badge>
            </div>
            <DetailField label="Folio" value={data.folio} />
            <DetailField label="Género" value={data.genero} />
            {data.membershipStatus === "SUSPENDIDO" && (
              <DetailField
                label="Motivo de suspensión"
                value={data.motivoSuspension}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <DetailSection title="Contacto">
        <DetailField label="Teléfono celular" value={data.telefonoCelular} />
        <DetailField label="Teléfono de casa" value={data.telefonoCasa} />
        <DetailField
          label="Correo electrónico"
          value={data.correoElectronico}
        />
        <DetailField label="LinkedIn" value={data.linkedin} />
        <DetailField label="ORCID" value={data.orcid} />
        <DetailField label="Sitio web" value={data.sitioWeb} />
      </DetailSection>

      <DetailSection title="Ubicación">
        <DetailField
          label="Estado de residencia"
          value={data.estadoResidencia}
        />
        <DetailField
          label="Ciudad de residencia"
          value={data.ciudadResidencia}
        />
        <DetailArrayField
          label="Disponibilidad geográfica"
          values={data.disponibilidadGeografica}
        />
      </DetailSection>

      <DetailSection title="Perfil profesional">
        <DetailArrayField
          label="Área de conocimiento"
          values={data.areaConocimiento}
        />
        <DetailField
          label="Área de conocimiento (otro)"
          value={data.areaConocimientoOtro}
        />
        <DetailField
          label="Perfil profesional"
          value={data.perfilProfesional}
          wide
        />
        <DetailArrayField label="Palabras clave" values={data.palabrasClave} />
        <DetailField
          label="Habilidades tecnológicas"
          value={data.habilidadesTecnologicas}
          wide
        />
      </DetailSection>

      <DetailSection title="Servicios profesionales">
        <DetailArrayField
          label="Tipo de servicios"
          values={data.tipoServicios}
        />
        <DetailField
          label="Tipo de servicios (otro)"
          value={data.tipoServiciosOtro}
        />
        <DetailField
          label="Descripción de servicios"
          value={data.descripcionServicios}
          wide
        />
        <DetailArrayField label="Sectores" values={data.sectores} />
        <DetailField label="Sectores (otro)" value={data.sectoresOtro} />
        <DetailArrayField
          label="Modalidad de servicios"
          values={data.modalidadServicios}
        />
        <DetailArrayField label="Interesado en" values={data.interesadoEn} />
        <DetailField
          label="Interesado en (otro)"
          value={data.interesadoEnOtro}
        />
      </DetailSection>

      <DetailSection title="Visibilidad">
        <DetailField
          label="Autoriza publicación"
          value={data.autorizaPublicacion ? "Sí" : "No"}
        />
        <DetailArrayField label="Datos públicos" values={data.datosPublicos} />
      </DetailSection>

      <Card>
        <CardHeader>
          <CardTitle>Proyectos relevantes</CardTitle>
        </CardHeader>
        <CardContent>
          {data.proyectosRelevantes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Este afiliado no tiene proyectos relevantes registrados.
            </p>
          ) : (
            <ul className="space-y-4">
              {data.proyectosRelevantes.map((proyecto) => (
                <li key={proyecto.id}>
                  <p className="font-medium">
                    {proyecto.nombre}{" "}
                    <span className="text-muted-foreground">
                      ({proyecto.anio})
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rol: {proyecto.rol}
                  </p>
                  <p className="text-sm">{proyecto.descripcion}</p>
                  <Separator className="mt-4" />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos de emergencia</CardTitle>
        </CardHeader>
        <CardContent>
          {!data.datosEmergencia ? (
            <p className="text-sm text-muted-foreground">
              Este afiliado no tiene datos de emergencia registrados.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField
                label="Nombre de contacto"
                value={data.datosEmergencia.nombreContacto}
              />
              <DetailField
                label="Parentesco"
                value={data.datosEmergencia.parentesco}
              />
              <DetailField
                label="Parentesco (otro)"
                value={data.datosEmergencia.parentescoOtro}
              />
              <DetailField
                label="Teléfono"
                value={data.datosEmergencia.telefono}
              />
              <DetailField
                label="Tipo sanguíneo"
                value={data.datosEmergencia.tipoSanguineo}
              />
              <DetailField
                label="Alergias / condiciones médicas"
                value={data.datosEmergencia.alergiasCondicionesMedicas}
                wide
              />
              <DetailField
                label="Mostrar en credencial QR"
                value={data.datosEmergencia.mostrarEnQr ? "Sí" : "No"}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {children}
      </CardContent>
    </Card>
  );
}

function DetailField({
  label,
  value,
  wide,
}: {
  label: string;
  value: string | null | undefined;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value && value.trim() !== "" ? value : "—"}</p>
    </div>
  );
}

function DetailArrayField({
  label,
  values,
}: {
  label: string;
  values: string[] | null;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      {values && values.length > 0 ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {values.map((value) => (
            <Badge key={value} variant="secondary">
              {value}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm">—</p>
      )}
    </div>
  );
}
