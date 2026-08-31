"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function BotonSalir() {

  const salir = () => {
    localStorage.removeItem("rep-rol");
    localStorage.removeItem("rep-usuario");
    localStorage.removeItem("rep-tema");
    window.location.href = "/";
  };

  return (
    <Button variant="ghost" size="sm" onClick={salir}>
      <LogOut className="mr-2 h-4 w-4" /> Salir
    </Button>
  );
}
