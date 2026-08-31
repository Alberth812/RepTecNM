import type { ReactNode } from "react";
import { GuardiaAdmin } from "@/components/admin/guardia-admin";
import { Topbar } from "@/components/admin/topbar";
import { Sidebar } from "@/components/admin/sidebar";
import { MenuMovilAdmin } from "@/components/admin/menu-movil-admin";

function AdminLayoutInterno({
  children}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <MenuMovilAdmin />
      {/* Sidebar para escritorio (oculto en móviles) */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col sticky top-0">
          <Sidebar />
        </div>
      </div>
      
      {/* Área de contenido principal */}
      <div className="flex flex-col">
        <Topbar />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="mx-auto w-full max-w-[1920px]">
          {children}
        </div>
      </main>
      </div>
    </div>
  );
}
export default function AdminLayout(props: { children: ReactNode }) {
  return (
    <GuardiaAdmin>
      <AdminLayoutInterno {...props} />
    </GuardiaAdmin>
  );
}
