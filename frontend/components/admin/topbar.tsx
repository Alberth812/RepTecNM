"use client";

import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

export function Topbar() {

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="mx-auto flex h-full w-full max-w-[1920px] items-center gap-4">
      <Sheet>
        <SheetTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-9 w-9 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar isMobile />
        </SheetContent>
      </Sheet>

      <div className="ml-auto flex items-center gap-2">
      </div>
    </div>
    </header>
  );
}
