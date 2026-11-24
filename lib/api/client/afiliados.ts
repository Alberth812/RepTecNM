// @/lib/api/client/afiliados.ts
import type {
  MembershipStatusFiltrable,
  SortByAfiliados,
  SortOrderAfiliados,
} from "@/lib/validations/afiliados";

export interface AfiliadoListItem {
  userId: string;
  nombres: string | null;
  apellidos: string | null;
  membershipStatus: MembershipStatusFiltrable;
  folio: string | null;
  estadoResidencia: string | null;
  ciudadResidencia: string | null;
  correoElectronico: string | null;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListadoAfiliadosResponse {
  items: AfiliadoListItem[];
  pagination: Pagination;
}

export interface ListadoAfiliadosParams {
  page: number;
  pageSize: number;
  search?: string;
  estadoResidencia?: string;
  ciudadResidencia?: string;
  membershipStatus?: MembershipStatusFiltrable;
  sortBy: SortByAfiliados;
  sortOrder: SortOrderAfiliados;
}

export interface ProyectoRelevante {
  id: string;
  nombre: string;
  descripcion: string;
  rol: string;
  anio: number;
}

export interface DatosEmergenciaDetalle {
  id: string;
  nombreContacto: string;
  parentesco: string;
  parentescoOtro: string | null;
  telefono: string;
  tipoSanguineo: string;
  alergiasCondicionesMedicas: string | null;
  mostrarEnQr: boolean;
}

export interface AfiliadoDetalle {
  userId: string;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  nombres: string | null;
  genero: string | null;
  membershipStatus: string;
  motivoSuspension: string | null;
  folio: string | null;
  telefonoCelular: string | null;
  telefonoCasa: string | null;
  correoElectronico: string | null;
  linkedin: string | null;
  orcid: string | null;
  sitioWeb: string | null;
  estadoResidencia: string | null;
  ciudadResidencia: string | null;
  disponibilidadGeografica: string[] | null;
  areaConocimiento: string[] | null;
  areaConocimientoOtro: string | null;
  perfilProfesional: string | null;
  palabrasClave: string[] | null;
  habilidadesTecnologicas: string | null;
  tipoServicios: string[] | null;
  tipoServiciosOtro: string | null;
  descripcionServicios: string | null;
  sectores: string[] | null;
  sectoresOtro: string | null;
  modalidadServicios: string[] | null;
  interesadoEn: string[] | null;
  interesadoEnOtro: string | null;
  autorizaPublicacion: boolean | null;
  datosPublicos: string[] | null;
  fotografiaUrl: string | null;
  proyectosRelevantes: ProyectoRelevante[];
  datosEmergencia: DatosEmergenciaDetalle | null;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export class ApiClientError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  let json: ApiEnvelope<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiClientError(
      "INTERNAL_ERROR",
      "La respuesta del servidor no es válida.",
    );
  }

  if (!res.ok || !json.success || json.data === undefined) {
    throw new ApiClientError(
      json.error?.code ?? "UNKNOWN_ERROR",
      json.error?.message ?? "Ocurrió un error inesperado.",
    );
  }

  return json.data;
}

export async function fetchAfiliados(
  params: ListadoAfiliadosParams,
): Promise<ListadoAfiliadosResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("pageSize", String(params.pageSize));
  searchParams.set("sortBy", params.sortBy);
  searchParams.set("sortOrder", params.sortOrder);
  if (params.search) searchParams.set("search", params.search);
  if (params.estadoResidencia)
    searchParams.set("estadoResidencia", params.estadoResidencia);
  if (params.ciudadResidencia)
    searchParams.set("ciudadResidencia", params.ciudadResidencia);
  if (params.membershipStatus)
    searchParams.set("membershipStatus", params.membershipStatus);

  const res = await fetch(`/api/admin/afiliados?${searchParams.toString()}`);
  return handleResponse<ListadoAfiliadosResponse>(res);
}

export async function fetchAfiliadoDetalle(
  userId: string,
): Promise<AfiliadoDetalle> {
  const res = await fetch(`/api/admin/afiliados/${encodeURIComponent(userId)}`);
  return handleResponse<AfiliadoDetalle>(res);
}

export async function suspenderAfiliado(
  userId: string,
  motivo: string,
): Promise<{ userId: string; membershipStatus: "SUSPENDIDO" }> {
  const res = await fetch(
    `/api/admin/afiliados/${encodeURIComponent(userId)}/suspension`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
    },
  );
  return handleResponse(res);
}

export async function quitarSuspensionAfiliado(
  userId: string,
): Promise<{ userId: string; membershipStatus: "ACTIVO" }> {
  const res = await fetch(
    `/api/admin/afiliados/${encodeURIComponent(userId)}/suspension`,
    {
      method: "DELETE",
    },
  );
  return handleResponse(res);
}
