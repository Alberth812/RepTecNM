"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useMeQuery } from "@/lib/hooks/use-auth";

export function BarraSesionInicio() {
 const { data: me, isLoading, isError, error } = useMeQuery();

 const role = me?.role;

 return (
 <div className="flex items-center gap-3">
 {role === "ADMINISTRADOR" || role === "AFILIADO" ? (
 <Link href="/dashboard">
 <Button variant="outline">
 <LayoutDashboard className="mr-2 h-4 w-4" /> Volver al panel
 </Button>
 </Link>
 ) : (
 <>
 {/* <Link href="/register">
 <Button className="bg-amber-400 text-amber-950 hover:bg-amber-300">
 ¿Eres nuevo? Afíliate
 </Button>
 </Link> */}
 <Link href="/login">
 <Button>Iniciar sesión</Button>
 </Link>
 </>
 )}
 </div>
 );
}
