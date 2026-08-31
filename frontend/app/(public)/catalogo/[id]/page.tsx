"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft, Briefcase, FolderKanban, HandHeart, Mail, MapPin, Phone,
  Tags, UserRound, type LucideIcon} from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { catalogo } from "@/lib/mock/catalogo";

function iniciales(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function Seccion({ icon: Icon, titulo, children, className }: {
  icon: LucideIcon;
  titulo: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border bg-card p-6 ${className ?? ""}`}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">{titulo}</h2>
      </div>
      {children}
    </section>
  );
}

export default function FichaProfesionalPage() {
  const pathname = usePathname();
  const id = pathname.split("/").filter(Boolean)[1] ?? "";
  const perfil = catalogo.find((p) => p.id === id);

  if (!perfil) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="font-semibold">Perfil no encontrado</p>
        <p className="mt-2 text-sm text-muted-foreground">
          El profesional que buscas no existe o ya no forma parte del catálogo.
        </p>
        <Link href="/catalogo" className="mt-6 inline-block">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al catálogo
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/catalogo"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al catálogo
      </Link>

      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <Avatar className="h-28 w-24 rounded-2xl border">
            <AvatarFallback className="rounded-2xl bg-[#004B87]/10 text-3xl font-bold text-[#004B87]">
              {iniciales(perfil.nombre)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{perfil.nombre}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {perfil.posgrado} · {perfil.instituto}
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {perfil.estadoResidencia}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {perfil.areas.map((a) => (
                <Badge key={a} variant="secondary">{a}</Badge>
              ))}
            </div>
          </div>

          <div className="md:w-64">
            {perfil.contactoPublico ? (
              <div className="space-y-2 rounded-2xl border bg-background p-4 text-sm">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-primary" /> {perfil.correo}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-primary" /> {perfil.telefono}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border bg-background p-4 text-sm text-muted-foreground">
                <p>
                  El contacto directo no está autorizado. Los afiliados activos pueden
                  contactar vía plataforma (RF-CAT-012).
                </p>
                <Link href="/login" className="mt-3 block">
                  <Button size="sm" className="w-full">Iniciar sesión</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Seccion icon={UserRound} titulo="Perfil profesional">
          <p className="text-sm leading-relaxed text-muted-foreground">{perfil.descripcion}</p>
        </Seccion>

        <Seccion icon={Briefcase} titulo="Servicios ofrecidos">
          <p className="text-sm leading-relaxed text-muted-foreground">{perfil.servicios}</p>
        </Seccion>

        <Seccion icon={FolderKanban} titulo="Experiencia y proyectos">
          <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
            {perfil.proyectos.map((pr) => (
              <li key={pr}>{pr}</li>
            ))}
          </ul>
        </Seccion>

        <Seccion icon={HandHeart} titulo="Intereses de colaboración">
          <p className="text-sm leading-relaxed text-muted-foreground">{perfil.intereses}</p>
        </Seccion>

        <Seccion icon={Tags} titulo="Palabras clave" className="md:col-span-2">
          <div className="flex flex-wrap gap-1">
            {perfil.palabrasClave.map((c) => (
              <Badge key={c} variant="outline">{c}</Badge>
            ))}
          </div>
        </Seccion>
      </div>
    </div>
  );
}