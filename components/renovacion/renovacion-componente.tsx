// @/components/renovacion/renovacion-componente.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const TIPOS_PERMITIDOS = ["application/pdf", "image/png", "image/jpeg"];
const TAMANO_MAXIMO_BYTES = 7 * 1024 * 1024;

const comprobanteSchema = z.object({
  comprobante: z
    .instanceof(File, { message: "Selecciona un archivo." })
    .refine((f) => f.size > 0, "El archivo está vacío.")
    .refine(
      (f) => f.size <= TAMANO_MAXIMO_BYTES,
      "El archivo supera el máximo de 7MB.",
    )
    .refine(
      (f) => TIPOS_PERMITIDOS.includes(f.type),
      "Formato no permitido. Usa PDF, PNG o JPG.",
    ),
});

type ComprobanteForm = z.infer<typeof comprobanteSchema>;

interface EstadoRenovacion {
  membershipStatus: "ACTIVO" | "INACTIVO" | "NO_INICIADA";
  estadoComponente:
    | "PENDIENTE"
    | "APROBADA"
    | "RECHAZADA_REENVIO"
    | "PUEDE_INICIAR"
    | "SIN_ACCION";
  ultimaRenovacion: { observaciones: string | null } | null;
}

async function obtenerEstado(): Promise<EstadoRenovacion> {
  const res = await fetch("/api/afiliado/renovacion");
  if (!res.ok) throw new Error("No se pudo obtener el estado de tu membresía.");
  return res.json();
}

interface RenovacionComponenteProps {
  variant?: "resumen" | "formulario";
  hrefRenovacion?: string;
}

export function RenovacionComponente({
  variant = "resumen",
  hrefRenovacion = "/renovar-membresia",
}: RenovacionComponenteProps) {
  const queryClient = useQueryClient();
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const {
    data: estado,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["renovacion-estado"],
    queryFn: obtenerEstado,
  });

  const form = useForm<ComprobanteForm>({
    resolver: zodResolver(comprobanteSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: ComprobanteForm) => {
      const formData = new FormData();
      formData.append("comprobante", data.comprobante);
      const res = await fetch("/api/afiliado/renovacion", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo enviar el comprobante.");
      }
      return res.json();
    },
    onSuccess: () => {
      setErrorEnvio(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["renovacion-estado"] });
    },
    onError: (error: Error) => setErrorEnvio(error.message),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !estado) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No pudimos cargar tu información</AlertTitle>
        <AlertDescription>
          Intenta recargar la página en unos momentos.
        </AlertDescription>
      </Alert>
    );
  }

  const puedeAccionar =
    estado.estadoComponente === "PUEDE_INICIAR" ||
    estado.estadoComponente === "RECHAZADA_REENVIO";

  // --- Variante "resumen": solo un link hacia la página de renovación ---
  if (puedeAccionar && variant === "resumen") {
    const esInactiva = estado.membershipStatus === "INACTIVO";
    return (
      <Alert>
        <AlertTitle>
          {esInactiva
            ? "Tu membresía está inactiva"
            : "Tu membresía está por vencer"}
        </AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <span>
            {estado.estadoComponente === "RECHAZADA_REENVIO"
              ? "Tu último comprobante fue rechazado. Sube uno nuevo para renovar tu membresía."
              : "Ya puedes subir tu comprobante de pago para renovarla."}
          </span>
          <Button size="sm" className="w-fit" /*asChild*/>
            <Link href={hrefRenovacion}>Renovar membresía</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // --- Variante "formulario": el formulario de envío en sí ---
  if (puedeAccionar && variant === "formulario") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Renueva tu membresía</CardTitle>
          {estado.estadoComponente === "RECHAZADA_REENVIO" &&
            estado.ultimaRenovacion?.observaciones && (
              <CardDescription>
                Tu comprobante anterior fue rechazado. Observaciones:{" "}
                {estado.ultimaRenovacion.observaciones}
              </CardDescription>
            )}
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          >
            <div className="space-y-1.5">
              <Label htmlFor="comprobante">
                Comprobante de pago (PDF, PNG o JPG, máx. 7MB)
              </Label>
              <Controller
                control={form.control}
                name="comprobante"
                render={({ field: { onChange, onBlur, name, ref } }) => (
                  <Input
                    id="comprobante"
                    type="file"
                    name={name}
                    ref={ref}
                    onBlur={onBlur}
                    accept="application/pdf,image/png,image/jpeg"
                    onChange={(e) => onChange(e.target.files?.[0])}
                  />
                )}
              />
              {form.formState.errors.comprobante && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.comprobante.message as string}
                </p>
              )}
            </div>
            {errorEnvio && (
              <Alert variant="destructive">
                <AlertDescription>{errorEnvio}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Enviando..." : "Enviar comprobante"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // --- Estados de "solo lectura" (iguales en ambas variantes) ---
  switch (estado.estadoComponente) {
    case "PENDIENTE":
      return (
        <Alert>
          <AlertTitle>Comprobante en revisión</AlertTitle>
          <AlertDescription>
            Ya recibimos tu comprobante y está siendo revisado por un
            administrador. Te avisaremos cuando se procese.
          </AlertDescription>
        </Alert>
      );

    case "APROBADA":
      return (
        <Alert>
          <AlertTitle>Membresía renovada</AlertTitle>
          <AlertDescription>
            Tu renovación fue aprobada y tu membresía ya está actualizada. No
            necesitas hacer ninguna acción por ahora.
          </AlertDescription>
        </Alert>
      );

    case "SIN_ACCION":
    default:
      return (
        <Alert>
          <AlertTitle>Todo en orden</AlertTitle>
          <AlertDescription>
            Tu membresía está activa y no necesitas hacer ninguna acción por
            ahora.
          </AlertDescription>
        </Alert>
      );
  }
}
