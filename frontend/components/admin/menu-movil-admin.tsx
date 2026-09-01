"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { SidebarAdmin as Sidebar } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function MenuMovilAdmin() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg md:hidden"
        onClick={() => setAbierto(true)}
        aria-label="Abrir menú de administración"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Sheet open={abierto} onOpenChange={setAbierto}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de administración</SheetTitle>
          </SheetHeader>
          <Sidebar isMobile />
        </SheetContent>
      </Sheet>
    </>
  );
}
