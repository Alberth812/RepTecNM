"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, TriangleAlert, User } from "lucide-react";

import { useMeQuery } from "@/lib/hooks/use-auth";
import { ApiRequestError } from "@/lib/api/http-error";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MEMBERSHIP_LABELS: Record<string, string> = {
  NO_INICIADA: "No iniciada",
  RECHAZADO: "Rechazado",
  SUSPENDIDO: "Suspendido",
};

const BLOCKED_MEMBERSHIP_STATUSES = new Set(["RECHAZADO", "SUSPENDIDO"]);

export function SessionDashboard() {
  const router = useRouter();
  const { data: me, isLoading, isError, error } = useMeQuery();

  const isUnauthorized = isError && error instanceof ApiRequestError && error.status === 401;

  useEffect(() => {
    if (isUnauthorized) router.replace("/login");
  }, [isUnauthorized, router]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-lg p-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="mx-auto w-full max-w-lg p-4 text-center text-sm text-muted-foreground">
        Redirigiendo al inicio de sesión…
      </div>
    );
  }

  if (isError || !me) {
    return (
      <div className="mx-auto w-full max-w-lg p-4">
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>No se pudo cargar tu sesión</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Intenta de nuevo en unos segundos."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isAdmin = me.role === "ADMINISTRADOR";

  return (
    <div className="mx-auto w-full max-w-lg p-4">
      <Card className="border-t-4 border-t-[#004B87] shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              {isAdmin ? (
                <ShieldCheck className="h-5 w-5 text-[#004B87]" />
              ) : (
                <User className="h-5 w-5 text-[#004B87]" />
              )}
              Bienvenido
            </CardTitle>
            <CardDescription>{me.email}</CardDescription>
          </div>
          <Badge className="bg-[#004B87] hover:bg-[#004B87]">{me.role}</Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator />

          {isAdmin ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtipo</span>
                <span className="font-medium">{me.subtype ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Administrador raíz</span>
                <Badge variant={me.isRoot ? "default" : "secondary"}>
                  {me.isRoot ? "Sí" : "No"}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estado de membresía</span>
                <Badge
                  variant={
                    me.membershipStatus && BLOCKED_MEMBERSHIP_STATUSES.has(me.membershipStatus)
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {me.membershipStatus
                    ? MEMBERSHIP_LABELS[me.membershipStatus] ?? me.membershipStatus
                    : "—"}
                </Badge>
              </div>
            </div>
          )}

          <Separator />

          <LogoutButton className="w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
