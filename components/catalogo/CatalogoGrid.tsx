"use client";

import Link from "next/link";
import { MapPin, Briefcase, MessageSquare, Eye, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AfiliadoCatalogo {
  id: string;
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
  const getNombreCompleto = (a: AfiliadoCatalogo) =>
    `${a.nombres} ${a.apellidoPaterno} ${a.apellidoMaterno}`.trim();

  if (afiliados.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No se encontraron perfiles.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {afiliados.map((afiliado) => (
        <Card key={afiliado.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            {/* Foto: solo afiliados y admins */}
            {(rolUsuario === "afiliado" || rolUsuario === "admin") && afiliado.fotografiaUrl && (
              <div className="mb-4 flex justify-center">
                <img
                  src={afiliado.fotografiaUrl}
                  alt={getNombreCompleto(afiliado)}
                  className="h-24 w-24 rounded-full object-cover ring-2 ring-[#004B87]/20"
                />
              </div>
            )}

            {/* Nombre */}
            <h3 className="text-lg font-semibold text-center mb-2">
              {getNombreCompleto(afiliado)}
            </h3>

            {/* Estado */}
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-3">
              <MapPin className="h-4 w-4" />
              <span>{afiliado.estadoResidencia}</span>
            </div>

            {/* Áreas */}
            {afiliado.areaConocimiento?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Áreas:</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {afiliado.areaConocimiento.slice(0, 3).map((area, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{area}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Servicios */}
            {afiliado.tipoServicios?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Servicios:</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {afiliado.tipoServicios.slice(0, 3).map((s, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      <Briefcase className="h-3 w-3 mr-1" />{s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Botones según rol */}
            <div className="flex gap-2 justify-center">
              <Link href={`/catalogo/${afiliado.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />Ver perfil
                </Button>
              </Link>

              {rolUsuario === "afiliado" && (
                <Link href={`/afiliado/mensajeria?destinatario=${afiliado.id}`}>
                  <Button size="sm" className="bg-[#004B87] hover:bg-[#003a6b]">
                    <MessageSquare className="h-4 w-4 mr-2" />Contactar
                  </Button>
                </Link>
              )}

              {rolUsuario === "admin" && (
                <Link href={`/admin/afiliados/${afiliado.id}`}>
                  <Button size="sm" variant="secondary">
                    <User className="h-4 w-4 mr-2" />Gestionar
                  </Button>
                </Link>
              )}
            </div>

            {rolUsuario === "visitante" && (
              <p className="text-xs text-center text-muted-foreground mt-3">
                Inicia sesión para ver el perfil completo y contactar.
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
