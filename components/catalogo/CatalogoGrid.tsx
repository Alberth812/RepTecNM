"use client";

import { useState } from "react";
import { MapPin, Briefcase, MessageSquare, User, GraduationCap, Mail, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModalEnviarMensaje } from "@/components/mensajes/ModalEnviarMensaje";

interface AfiliadoCatalogo {
 userId: string;
 nombres: string;
 apellidoPaterno: string;
 apellidoMaterno: string;
 estadoResidencia: string;
 areaConocimiento: string[];
 tipoServicios: string[];
 fotografiaUrl?: string;
 autorizaPublicacion: boolean;
}

interface CatalogoGridProps {
 afiliados: AfiliadoCatalogo[];
 rolUsuario: "visitante" | "afiliado" | "admin";
}

export function CatalogoGrid({ afiliados, rolUsuario }: CatalogoGridProps) {
 const [modalAbierto, setModalAbierto] = useState(false);
 const [destinatarioActual, setDestinatarioActual] = useState<{ id: string; nombre: string } | null>(null);

 const nombre = (a: AfiliadoCatalogo) =>
 `${a.nombres} ${a.apellidoPaterno} ${a.apellidoMaterno}`.trim();

 const handleAbrirModal = (afiliado: AfiliadoCatalogo) => {
 setDestinatarioActual({ id: afiliado.userId, nombre: nombre(afiliado) });
 setModalAbierto(true);
 };

 if (afiliados.length === 0) {
 return (
 <div className="text-center py-20">
 <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 mb-5">
 <User className="h-10 w-10 text-slate-400" />
 </div>
 <h3 className="text-xl font-bold text-slate-900 mb-2">No se encontraron perfiles</h3>
 <p className="text-slate-500 text-sm max-w-md mx-auto">
 Intenta ajustar los filtros o los términos de búsqueda para encontrar más profesionales.
 </p>
 </div>
 );
 }

 return (
 <>
 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 {afiliados.map((a) => {
 const tieneFoto = a.fotografiaUrl && (rolUsuario === "afiliado" || rolUsuario === "admin");
 const tieneAreas = a.areaConocimiento?.length > 0;
 const tieneServicios = a.tipoServicios?.length > 0;
 const tieneInfo = tieneAreas || tieneServicios;

 return (
 <Card key={a.userId} className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200/60 group bg-white flex flex-col">
 {/* Header con avatar y nombre */}
 <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 pb-5">
 <div className="flex items-start gap-4">
 {tieneFoto ? (
 <div className="relative shrink-0">
 <img
 src={a.fotografiaUrl}
 alt={nombre(a)}
 className="h-16 w-16 rounded-2xl object-cover ring-4 ring-white shadow-lg"
 onError={(e) => {
 // Si la imagen falla, ocultarla y mostrar el avatar con iniciales
 (e.target as HTMLImageElement).style.display = 'none';
 (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
 }}
 />
 <div className="hidden h-16 w-16 rounded-2xl bg-gradient-to-br from-[#004B87] to-[#0066b3] flex items-center justify-center ring-4 ring-white shadow-lg">
 <span className="text-xl font-bold text-white">
 {a.nombres?.[0]}{a.apellidoPaterno?.[0]}
 </span>
 </div>
 <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full ring-2 ring-white"></div>
 </div>
 ) : (
 <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#004B87] to-[#0066b3] flex items-center justify-center ring-4 ring-white shadow-lg shrink-0">
 <span className="text-xl font-bold text-white">
 {a.nombres?.[0]}{a.apellidoPaterno?.[0]}
 </span>
 </div>
 )}
 <div className="flex-1 min-w-0">
 <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight mb-1">
 {nombre(a)}
 </h3>
 {a.estadoResidencia && (
 <div className="flex items-center gap-1.5 text-sm text-slate-600">
 <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[#004B87]" />
 <span className="truncate">{a.estadoResidencia}</span>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Contenido */}
 <CardContent className="p-6 pt-5 space-y-4 flex-1 flex flex-col">
 {tieneInfo ? (
 <>
 {/* Áreas de conocimiento */}
 {tieneAreas && (
 <div className="space-y-2">
 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
 <Award className="h-3.5 w-3.5 text-[#004B87]" />
 Áreas de conocimiento
 </p>
 <div className="flex flex-wrap gap-1.5 max-h-20 overflow-hidden">
 {a.areaConocimiento.slice(0, 3).map((area, i) => (
 <Badge key={i} variant="secondary" className="text-xs bg-blue-50 text-[#004B87] hover:bg-blue-100 border-0 font-medium px-2.5 py-1 whitespace-nowrap">
 {area}
 </Badge>
 ))}
 {a.areaConocimiento.length > 3 && (
 <Badge variant="outline" className="text-xs font-medium">+{a.areaConocimiento.length - 3}</Badge>
 )}
 </div>
 </div>
 )}

 {/* Servicios */}
 {tieneServicios && (
 <div className="space-y-2">
 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
 <Briefcase className="h-3.5 w-3.5 text-[#004B87]" />
 Servicios profesionales
 </p>
 <div className="flex flex-wrap gap-1.5 max-h-20 overflow-hidden">
 {a.tipoServicios.slice(0, 3).map((s, i) => (
 <Badge key={i} variant="outline" className="text-xs border-slate-300 text-slate-700 font-medium px-2.5 py-1 whitespace-nowrap">
 <Briefcase className="h-3 w-3 mr-1" />{s}
 </Badge>
 ))}
 {a.tipoServicios.length > 3 && (
 <Badge variant="outline" className="text-xs font-medium">+{a.tipoServicios.length - 3}</Badge>
 )}
 </div>
 </div>
 )}
 </>
 ) : (
 /* Estado vacío más compacto */
 <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
 <GraduationCap className="h-10 w-10 mx-auto mb-2 text-slate-400" />
 <p className="text-sm text-slate-500 font-medium">Perfil en construcción</p>
 <p className="text-xs text-slate-400 mt-1">Este afiliado aún no ha completado su información</p>
 </div>
 )}

 {/* Botones de acción - siempre al final */}
 <div className="pt-4 border-t border-slate-100 mt-auto">
 {(rolUsuario === "afiliado" || rolUsuario === "admin") && (
 <Button
 size="sm"
 className="w-full h-10 bg-gradient-to-r from-[#004B87] to-[#005a9e] hover:from-[#003a6b] hover:to-[#004B87] text-white font-semibold shadow-md hover:shadow-lg transition-all"
 onClick={() => handleAbrirModal(a)}
 >
 <MessageSquare className="h-4 w-4 mr-2" />
 Enviar Mensaje
 </Button>
 )}

 {rolUsuario === "visitante" && (
 <div className="text-center space-y-2">
 <p className="text-xs text-slate-500">
 <Mail className="h-3 w-3 inline mr-1" />
 Inicia sesión para contactar a este profesional
 </p>
 <Button
 size="sm"
 variant="outline"
 className="w-full h-10 border-[#004B87] text-[#004B87] hover:bg-[#004B87]/5 font-semibold"
 onClick={() => window.location.href = "/login"}
 >
 Iniciar sesión
 </Button>
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 );
 })}
 </div>

 {/* Modal de Mensaje */}
 {modalAbierto && destinatarioActual && (
 <ModalEnviarMensaje
 isOpen={modalAbierto}
 onClose={() => { setModalAbierto(false); setDestinatarioActual(null); }}
 destinatarioId={destinatarioActual.id}
 destinatarioNombre={destinatarioActual.nombre}
 />
 )}
 </>
 );
}
