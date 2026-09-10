"use client";

import {
  ArrowRight,
  ClipboardList,
  ShieldCheck,
  TriangleAlert,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { ApiRequestError } from "@/lib/api/http-error";
import { useMeQuery } from "@/lib/hooks/use-auth";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const MEMBERSHIP_LABELS: Record<string, string> = {
  NO_INICIADA: "NO_INICIADA",
  RECHAZADO: "RECHAZADO",
  SUSPENDIDO: "SUSPENDIDO",
  PENDIENTE_APROBACION: "PENDIENTE_APROBACION",
  REQUIERE_CORRECCION: "REQUIERE_CORRECCION",
  ACTIVO: "ACTIVO",
  BAJA: "BAJA",
};

const BLOCKED_MEMBERSHIP_STATUSES = new Set([
  "RECHAZADO",
  "SUSPENDIDO",
  "BAJA",
]);

export function SessionDashboard() {
  const router = useRouter();
  const { data: me, isLoading, isError, error } = useMeQuery();

  const isUnauthorized =
    isError && error instanceof ApiRequestError && error.status === 401;

  useEffect(() => {
    if (isUnauthorized) {
      router.replace("/login");
    }
  }, [isUnauthorized, router]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />

              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-lg items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          Redirigiendo al inicio de sesión…
        </p>
      </div>
    );
  }

  if (isError || !me) {
    return (
      <div className="mx-auto w-full max-w-lg p-4 sm:p-6">
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />

          <AlertTitle>No se pudo cargar tu sesión</AlertTitle>

          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Intenta de nuevo en unos segundos."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isAdmin = me.role === "ADMINISTRADOR";

  const membershipStatus = me.membershipStatus ?? "NO_INICIADA";

  const isBlocked = BLOCKED_MEMBERSHIP_STATUSES.has(membershipStatus);

  const membershipLabel =
    MEMBERSHIP_LABELS[membershipStatus] ?? membershipStatus;

  const folio = me.folio;

  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      <Card className="overflow-hidden shadow-sm">
        {/* Header */}
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#004B87]/10">
                {isAdmin ? (
                  <ShieldCheck className="h-5 w-5 text-[#004B87]" />
                ) : (
                  <User className="h-5 w-5 text-[#004B87]" />
                )}
              </div>

              <div className="min-w-0">
                <CardTitle className="text-xl">
                  {isAdmin ? "Panel de administración" : "Bienvenido"}
                </CardTitle>

                <CardDescription className="truncate">
                  {me.email}
                </CardDescription>
              </div>
            </div>

            <Badge className="shrink-0 bg-[#004B87] hover:bg-[#004B87]">
              {me.role}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {isAdmin ? (
            <>
              {/* Admin */}
              <section className="space-y-4">
                <div>
                  <h2 className="font-semibold">Administración</h2>

                  <p className="text-sm text-muted-foreground">
                    Gestiona las solicitudes de afiliación y consulta tu
                    información administrativa.
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Subtipo</span>

                      <span className="font-medium">{me.subtype ?? "—"}</span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        Administrador raíz
                      </span>

                      <Badge variant={me.isRoot ? "default" : "secondary"}>
                        {me.isRoot ? "Sí" : "No"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Link
                  href="/admin/solicitudes"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <ClipboardList className="h-4 w-4 shrink-0" />

                  <span>Revisar solicitudes de afiliados</span>

                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>

                <Link
                  href="/contenido"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <ClipboardList className="h-4 w-4 shrink-0" />

                  <span>Gestionar contenido</span>

                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              </section>
            </>
          ) : (
            <>
              {/* Afiliado */}
              <section className="space-y-4">
                <div
                  className={`rounded-xl border p-5 ${
                    isBlocked
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-[#004B87]/20 bg-[#004B87]/5"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-semibold">
                          {membershipStatus === "NO_INICIADA" &&
                            "Completa tu registro"}

                          {membershipStatus === "REQUIERE_CORRECCION" &&
                            "Tu registro requiere correcciones"}

                          {membershipStatus === "PENDIENTE_APROBACION" &&
                            "Solicitud en revisión"}

                          {membershipStatus === "ACTIVO" &&
                            "¡Bienvenido al sistema REP TECNM!"}

                          {isBlocked &&
                            ![
                              "REQUIERE_CORRECCION",
                              "PENDIENTE_APROBACION",
                              "ACTIVO",
                              "NO_INICIADA",
                            ].includes(membershipStatus) &&
                            "Tu membresía no está activa"}
                        </h2>

                        {membershipStatus === "ACTIVO" && (
                          <div className="rounded-lg border bg-background/60 p-3">
                            <p className="text-xs font-medium text-muted-foreground">
                              Folio de afiliación
                            </p>

                            <p className="mt-1 font-mono text-sm font-semibold">
                              {folio || "Folio no disponible"}
                            </p>
                          </div>
                        )}

                        <p className="mt-1 text-sm text-muted-foreground">
                          {membershipStatus === "NO_INICIADA" &&
                            "Por favor completa tu formulario de registro para comenzar."}

                          {membershipStatus === "REQUIERE_CORRECCION" &&
                            "Hemos detectado algunos puntos que necesitan atención. Abre tu formulario para revisarlos y continuar."}

                          {membershipStatus === "PENDIENTE_APROBACION" &&
                            "Tu formulario ha sido enviado y está pendiente de revisión por un administrador."}

                          {membershipStatus === "ACTIVO" &&
                            "Tu membresía está activa. Ya puedes continuar utilizando el sistema."}

                          {isBlocked &&
                            ![
                              "REQUIERE_CORRECCION",
                              "PENDIENTE_APROBACION",
                              "ACTIVO",
                              "NO_INICIADA",
                            ].includes(membershipStatus) &&
                            "Si consideras que esto es un error, comunícate con un administrador."}
                        </p>
                      </div>

                      <Badge
                        variant={
                          isBlocked
                            ? "destructive"
                            : membershipStatus === "ACTIVO"
                              ? "default"
                              : "secondary"
                        }
                        className="shrink-0"
                      >
                        {membershipLabel}
                      </Badge>
                    </div>

                    {(membershipStatus === "NO_INICIADA" ||
                      membershipStatus === "REQUIERE_CORRECCION") && (
                      <Link
                        href="/registro"
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <span>
                          {membershipStatus === "NO_INICIADA"
                            ? "Completar formulario"
                            : "Abrir formulario"}
                        </span>

                        <ArrowRight className="h-4 w-4 shrink-0" />
                      </Link>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}

          <Separator />

          <LogoutButton className="w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
