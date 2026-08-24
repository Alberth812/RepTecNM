"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Search, Mail, Phone, MessageSquareText, SlidersHorizontal } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { catalogo, type PerfilCatalogo } from "@/lib/mock/catalogo";

const TANDA = 18;
const AREAS_FILTRO = ["Ingeniería", "Salud", "Educación", "Económico-Administrativas", "Agropecuarias", "Arquitectura"];
const ESTADOS_FILTRO = ["Guanajuato", "Yucatán", "Baja California", "Nuevo León", "Oaxaca", "Ciudad de México"];

function normalizar(t: string) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function iniciales(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function puntuacion(p: PerfilCatalogo, terminos: string[]) {
  const campos = [
    { texto: normalizar(p.nombre), peso: 5 },
    { texto: normalizar(p.palabrasClave.join(" ")), peso: 4 },
    { texto: normalizar(p.descripcion), peso: 2 },
    { texto: normalizar(p.proyectos.join(" ")), peso: 1 },
  ];
  let total = 0;
  for (const t of terminos) {
    for (const c of campos) {
      if (c.texto.includes(t)) total += c.peso;
    }
  }
  return total;
}

export function CatalogoCliente() {
  const [busqueda, setBusqueda] = useState("");
  const [areasSel, setAreasSel] = useState<string[]>([]);
  const [estadoSel, setEstadoSel] = useState("");
  const [limite, setLimite] = useState(TANDA);

  const resultados = useMemo(() => {
    const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean);
    let lista = catalogo.filter(
      (p) =>
        (areasSel.length === 0 || p.areas.some((a) => areasSel.includes(a))) &&
        (!estadoSel || p.estadoResidencia === estadoSel)
    );
    if (terminos.length > 0) {
      lista = lista
        .map((p) => ({ p, s: puntuacion(p, terminos) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.p);
    } else {
      lista = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    return lista;
  }, [busqueda, areasSel, estadoSel]);

  useEffect(() => setLimite(TANDA), [busqueda, areasSel, estadoSel]);

  const visibles = resultados.slice(0, limite);
  const quedan = resultados.length - visibles.length;

  const toggleArea = (a: string) =>
    setAreasSel((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const hayFiltros = areasSel.length > 0 || estadoSel !== "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="static -mx-4 bg-background px-4 pb-4 pt-2 lg:sticky lg:top-16 lg:z-20">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Profesionales</h1>
          <p className="mt-2 text-muted-foreground">
            Conoce a los egresados de posgrado afiliados a la red.
          </p>
          <div className="relative mx-auto mt-6 max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Busca por nombre, palabra clave, descripción o proyecto..."
              className="h-11 rounded-full pl-9"
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" /> Área:
            </span>
            {AREAS_FILTRO.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleArea(a)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  areasSel.includes(a)
                    ? "border-[#004B87] bg-[#004B87] text-white shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {a}
              </button>
            ))}
            <span className="ml-auto flex items-center gap-2">
              <select
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
                value={estadoSel}
                onChange={(e) => setEstadoSel(e.target.value)}
              >
                <option value="">Todos los estados</option>
                {ESTADOS_FILTRO.map((e2) => (
                  <option key={e2} value={e2}>{e2}</option>
                ))}
              </select>
              {hayFiltros && (
                <Button variant="ghost" size="sm" onClick={() => { setAreasSel([]); setEstadoSel(""); }}>
                  Limpiar
                </Button>
              )}
            </span>
          </div>
        </div>
      </div>

      <section className="pt-6">
        <p className="mb-4 text-sm text-muted-foreground">
          {resultados.length} resultado(s) · orden{" "}
          {busqueda.trim() ? "por relevancia" : "alfabético"}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibles.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <CardContent className="flex-1 p-4">
                <Link
                  href={`/catalogo/${p.id}`}
                  aria-label={`Ver perfil de ${p.nombre}`}
                  className="flex items-start gap-3 transition-opacity hover:opacity-75"
                >
                  <Avatar className="h-12 w-12 border">
                    <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                      {iniciales(p.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{p.nombre}</h3>
                    <p className="truncate text-xs text-muted-foreground">{p.posgrado}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {p.estadoResidencia}
                    </p>
                  </div>
                </Link>
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.areas.map((a) => (
                    <Badge key={a} variant="secondary" className="text-[11px]">{a}</Badge>
                  ))}
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.descripcion}</p>
              </CardContent>
              <CardFooter className="border-t p-3">
                {p.contactoPublico ? (
                  <div className="flex w-full items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="flex min-w-0 items-center gap-1">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{p.correo}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {p.telefono}
                    </span>
                  </div>
                ) : (
                  <Link href={`/catalogo/${p.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      <MessageSquareText className="mr-2 h-4 w-4" />
                      Ver perfil y enviar mensaje
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {quedan > 0 && (
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => setLimite(limite + TANDA)}>
              Mostrar más ({quedan} restantes)
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
