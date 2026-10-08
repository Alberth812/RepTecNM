// @/components/auth/no-autorizado.tsx
"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface NoAutorizadoProps {
  /** Ruta a la que redirige el botón (ej: "/" o "/dashboard") */
  redirectHref: string;
  /** Texto opcional del botón */
  redirectLabel?: string;
  /** Título opcional */
  title?: string;
  /** Descripción opcional */
  description?: string;
}

export function NoAutorizado({
  redirectHref,
  redirectLabel = "Volver al inicio",
  title = "No autorizado",
  description = "No tienes permisos para acceder a esta página. ",
}: NoAutorizadoProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent />

        <CardFooter className="flex justify-center">
          <Button render={<Link href={redirectHref} />} nativeButton={false}>
            {redirectLabel}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
