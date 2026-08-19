import { Topbar } from "@/components/admin/topbar";
import { Sidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
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