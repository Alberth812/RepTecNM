"use client";

import { type ReactNode } from "react";
import { Search } from "lucide-react";

import { SidebarAdmin as Sidebar } from "@/components/admin/sidebar";
import { AvatarSesion } from "@/components/admin/avatar-sesion";

export function CascoAdmin({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <div className="hidden w-[240px] shrink-0 md:block lg:w-[280px]">
        <div className="sticky top-0 flex h-dvh flex-col">
          <Sidebar />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="rounded-lg bg-muted p-2">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <AvatarSesion />
          </div>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
