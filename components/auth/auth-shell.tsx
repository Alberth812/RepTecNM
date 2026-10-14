import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthShellProps {
 title: string;
 description?: string;
 children: ReactNode;
 footer?: ReactNode;
 variant?: "default" | "split";
 backLink?: string;
 loginImage?: string; // Nueva prop
}

export function AuthShell({ title, description, children, footer, variant = "default", backLink, loginImage }: AuthShellProps) {
 if (variant === "split") {
 return (
 <div className="min-h-screen w-full flex">
 {/* Panel Izquierdo */}
 <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#004B87] via-[#003a6b] to-[#002244] relative overflow-hidden items-center justify-center p-12">
 {/* Si hay imagen de Payload, la usamos con un overlay. Si no, usamos el patrón por defecto */}
 {loginImage ? (
 <img src={loginImage} alt="Fondo login" className="absolute inset-0 w-full h-full object-cover opacity-40" />
 ) : (
 <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMCAwTDYwIDYwTTYwIDBMMCA2MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==')] opacity-50"></div>
 )}

 <div className="relative z-10 text-white max-w-md space-y-6 text-center">
 <div className="space-y-4">
 <h1 className="text-4xl font-bold leading-tight drop-shadow-md">Conecta con egresados de posgrado del TecNM</h1>
 <p className="text-lg text-white/90 leading-relaxed drop-shadow-sm">Una red profesional para compartir conocimiento, servicios y oportunidades académicas.</p>
 </div>
 </div>
 </div>

 {/* Panel Derecho */}
 <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white">
 {backLink && (
 <Link href={backLink} className="absolute top-6 right-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#004B87] transition-colors group">
 <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Volver al inicio
 </Link>
 )}
 <div className="w-full max-w-md space-y-8">
 <div className="flex justify-center">
 <img src="/logo.png" alt="REP-TecNM" className="h-14 w-auto object-contain" />
 </div>
 <div className="space-y-2 text-center">
 <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
 {description && <p className="text-slate-500">{description}</p>}
 </div>
 <div className="space-y-4">{children}</div>
 {footer && <div className="text-center text-sm text-muted-foreground pt-2">{footer}</div>}
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="flex min-h-svh w-full items-center justify-center bg-slate-50 p-4">
 <div className="w-full max-w-md">
 <div className="mb-6 flex justify-center">
 <img src="/logo.png" alt="REP-TecNM" className="h-10 w-auto object-contain" />
 </div>
 <Card className="border-t-4 border-t-[#004B87] shadow-sm">
 <CardHeader className="space-y-1 text-center">
 <CardTitle className="text-xl">{title}</CardTitle>
 {description ? <CardDescription>{description}</CardDescription> : null}
 </CardHeader>
 <CardContent>{children}</CardContent>
 </Card>
 {footer && <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>}
 </div>
 </div>
 );
}
