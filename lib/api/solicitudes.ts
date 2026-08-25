"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../errors";
import type { SolicitudDatosSnapshot } from "@/lib/registro/solicitud-snapshot";

export type SolicitudEstado =
  | "REQUIERE_ATENCION"
  | "EN_CORRECCION"
  | "RECHAZADA"
  | "APROBADA";

export type RevisionDecision =
  | "APROBADO"
  | "REQUIERE_CORRECCION"
  | "RECHAZADO";

export type SolicitudListItem = {
  solicitudId: string;
  afiliadoId: string;
  version: number;
  createdAt: string;
  revisionDecision: RevisionDecision | null;
  revisionObservaciones: string | null;
  revisadoEn: string | null;
  membershipStatus: string;
  nombres: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  correoElectronico: string | null;
  estado: SolicitudEstado;
};

export type SolicitudesListResponse = {
  items: SolicitudListItem[];
  total: number;
  limit: number;
  offset: number;
};

export type ArchivoConUrl = {
  id: string;
  originalName: string;
  contentType: string;
  size: number;
  url: string;
};

export type SolicitudVersion = {
  id: string;
  afiliadoId: string;
  version: number;
  createdAt: string;
  datos: SolicitudDatosSnapshot;
  revisionDecision: RevisionDecision | null;
  revisionObservaciones: string | null;
  revisadoEn: string | null;
  revisadoPor: { userId: string; nombreCompleto: string } | null;
  fotografia: ArchivoConUrl;
  comprobanteMembresia: ArchivoConUrl;
};

export type SolicitudDetalleResponse = {
  afiliado: { membershipStatus: string };
  versiones: SolicitudVersion[];
};

const BASE_QUERY_KEY = ["admin", "solicitudes"] as const;

export function useSolicitudesList(params: {
  estado?: SolicitudEstado;
  limit: number;
  offset: number;
}) {
  return useQuery({
    queryKey: [...BASE_QUERY_KEY, "list", params],
    queryFn: () => {
      const search = new URLSearchParams();
      if (params.estado) search.set("estado", params.estado);
      search.set("limit", String(params.limit));
      search.set("offset", String(params.offset));
      return apiFetch<SolicitudesListResponse>(
        `/api/admin/solicitudes?${search.toString()}`,
      );
    },
    placeholderData: (prev) => prev,
  });
}

export function useSolicitudDetalle(afiliadoId: string | null) {
  return useQuery({
    queryKey: [...BASE_QUERY_KEY, "detalle", afiliadoId],
    queryFn: () =>
      apiFetch<SolicitudDetalleResponse>(
        `/api/admin/afiliados/${afiliadoId}/solicitudes`,
      ),
    enabled: afiliadoId !== null,
  });
}

export function useResolverSolicitud() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      solicitudId: string;
      decision: RevisionDecision;
      observaciones: string | null;
    }) =>
      apiFetch(`/api/admin/solicitudes/${input.solicitudId}/decision`, {
        method: "POST",
        body: JSON.stringify({
          decision: input.decision,
          observaciones: input.observaciones ?? undefined,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_QUERY_KEY });
    },
  });
}