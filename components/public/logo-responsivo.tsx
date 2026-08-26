"use client";

import Link from "next/link";

import { useRol } from "@/lib/use-rol";

export function LogoResponsivo() {
  const { rol } = useRol();
  const destino = rol === "admin" ? "/dashboard" : rol === "afiliado" ? "/credencial" : "/";

  return (
    <Link href={destino} className="flex items-center gap-2 text-primary">
      <img src="/logo.png" alt="REP-TecNM" className="h-9 w-9 rounded-lg object-cover object-[center_15%] ring-1 ring-border" />
      <span className="text-xl font-bold tracking-tight">
        REP-<span className="font-light">TecNM</span>
        <span className="ml-3 hidden border-l border-border pl-3 text-sm font-normal text-muted-foreground xl:block">
          Red de Egresados de Posgrado del TecNM
        </span>
      </span>
    </Link>
  );
}
