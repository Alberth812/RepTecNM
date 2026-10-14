"use client";

import { Construction, Home, RotateCw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
 return (
 <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
 <div className="rounded-2xl bg-amber-100 p-4">
 <Construction className="h-10 w-10 text-amber-700" />
 </div>
 <h1 className="mt-4 text-2xl font-semibold tracking-tight">Estamos trabajando en ello</h1>
 <p className="mt-3 max-w-md text-sm text-muted-foreground">
 Algo salió mal de forma inesperada. La señal ya quedó registrada;
 mientras tanto, puedes intentar de nuevo o volver al inicio.
 </p>
 <div className="mt-8 flex flex-wrap justify-center gap-3">
 <Button onClick={reset}>
 <RotateCw className="mr-2 h-4 w-4" /> Reintentar
 </Button>
 <Link href="/">
 <Button variant="outline">
 <Home className="mr-2 h-4 w-4" /> Volver al inicio
 </Button>
 </Link>
 </div>
 <p className="mt-6 text-xs text-muted-foreground">
 Tu sesión y tus datos guardados no corren peligro.
 </p>
 </div>
 );
}
