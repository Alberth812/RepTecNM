// app/afiliado/actualizacion-profesional/page.tsx

import type { Metadata } from "next";
import { ActualizacionProfesionalForm } from "@/components/actualizacion-profesional/actualizacion-profesional-form";

// Metadata de nextjs
export const metadata: Metadata = { title: "Actualización profesional" };

export default function ActualizacionProfesionalPage() {
 return (
 <main className="mx-auto w-full max-w-3xl px-4 py-8">
 <header className="mb-8 space-y-1">
 <h1 className="text-2xl font-semibold tracking-tight">
 Actualización profesional
 </h1>
 <p className="text-muted-foreground text-sm">
 Sección 6. Los campos marcados con * son obligatorios.
 </p>
 </header>
 <ActualizacionProfesionalForm />
 </main>
 );
}
