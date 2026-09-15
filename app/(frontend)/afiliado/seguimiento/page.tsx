"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const formularios = [
  {
    title: "Formación Académica",
    description:
      "Actualiza y complementa la información relacionada con tus estudios, grados académicos y formación profesional.",
    href: "/afiliado/formacion-academica",
    icon: GraduationCap,
    status: "Disponible",
    color: "text-blue-600",
    iconBackground: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    title: "Información laboral",
    description:
      "Cuéntanos sobre tu experiencia profesional, situación laboral actual, empresa y trayectoria.",
    href: "/afiliado/informacion-laboral",
    icon: BriefcaseBusiness,
    status: "Disponible",
    color: "text-emerald-600",
    iconBackground: "bg-emerald-50 dark:bg-emerald-950/40",
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="mb-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ClipboardList className="h-6 w-6" />
          </div>

          <div className="max-w-3xl space-y-3">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Red de egresados
            </Badge>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Actualiza tu información
            </h1>

            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              Ayúdanos a mantener actualizada tu información como egresado.
              Completa los siguientes formularios para que podamos conocer mejor
              tu trayectoria académica y profesional.
            </p>
          </div>
        </section>

        {/* Progress / information */}
        <section className="mb-8 rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-medium">Tu información es importante</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Completa los formularios disponibles. Esta sección irá
                  creciendo conforme agreguemos nuevos aspectos de tu
                  trayectoria como egresado.
                </p>
              </div>
            </div>

            <Badge variant="outline" className="w-fit shrink-0">
              2 formularios disponibles
            </Badge>
          </div>
        </section>

        {/* Forms */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold tracking-tight">
              Formularios de seguimiento
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecciona una sección para consultar o actualizar tu información.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {formularios.map((formulario) => {
              const Icon = formulario.icon;

              return (
                <Card
                  key={formulario.href}
                  className="group flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <CardHeader>
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${formulario.iconBackground}`}
                      >
                        <Icon className={`h-6 w-6 ${formulario.color}`} />
                      </div>

                      <Badge variant="secondary" className="rounded-full">
                        {formulario.status}
                      </Badge>
                    </div>

                    <CardTitle className="text-xl">
                      {formulario.title}
                    </CardTitle>

                    <CardDescription className="text-sm leading-6">
                      {formulario.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        ¿Qué encontrarás aquí?
                      </span>
                      <p className="mt-1">
                        Información relevante para mantener actualizado tu
                        perfil dentro de la red de egresados.
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Link
                      href={formulario.href}
                      className={cn(
                        buttonVariants(),
                        "w-full group-hover:shadow-sm",
                      )}
                    >
                      Completar formulario
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
