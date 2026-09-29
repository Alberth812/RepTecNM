import type {
  PublicacionDetalleResponse,
  PublicacionDocumentoResponse,
} from "@/lib/validation/publicaciones";
import type {
  BuscarPublicacionesQuery,
  BusquedaPublicacionesResponse,
} from "@/lib/validation/publicaciones-busqueda";
import { toApiRequestError } from "@/lib/api/errors-otro";

/** Construye el query string de `GET /api/publicaciones` a partir de la consulta aplicada. */
function buildPublicacionesQueryString(
  query: BuscarPublicacionesQuery,
): string {
  const params = new URLSearchParams();

  const entradas: [string, string | number | undefined][] = [
    ["q", query.q],
    ["tipo", query.tipo],
    ["anio", query.anio],
    ["anioDesde", query.anioDesde],
    ["anioHasta", query.anioHasta],
    ["autor", query.autor],
    ["keyword", query.keyword],
    ["isbn", query.isbn],
    ["issn", query.issn],
    ["doi", query.doi],
    ["page", query.page],
    ["pageSize", query.pageSize],
  ];

  for (const [key, value] of entradas) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** GET /api/publicaciones — búsqueda y filtrado paginado. */
export async function fetchPublicaciones(
  query: BuscarPublicacionesQuery,
  signal?: AbortSignal,
): Promise<BusquedaPublicacionesResponse> {
  const response = await fetch(
    `/api/publicaciones${buildPublicacionesQueryString(query)}`,
    {
      method: "GET",
      signal,
    },
  );

  if (!response.ok) {
    throw await toApiRequestError(response);
  }

  return (await response.json()) as BusquedaPublicacionesResponse;
}

/** GET /api/publicaciones/:id — detalle completo de una publicación activa. */
export async function fetchPublicacionDetalle(
  id: string,
  signal?: AbortSignal,
): Promise<PublicacionDetalleResponse> {
  const response = await fetch(`/api/publicaciones/${encodeURIComponent(id)}`, {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    throw await toApiRequestError(response);
  }

  return (await response.json()) as PublicacionDetalleResponse;
}

/**
 * GET /api/publicaciones/:id/documento — URL firmada del PDF, generada bajo
 * demanda. Nunca se debe llamar automáticamente al montar la vista de
 * detalle; solo ante una acción explícita del usuario.
 */
export async function fetchPublicacionDocumento(
  id: string,
): Promise<PublicacionDocumentoResponse> {
  const response = await fetch(
    `/api/publicaciones/${encodeURIComponent(id)}/documento`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw await toApiRequestError(response);
  }

  return (await response.json()) as PublicacionDocumentoResponse;
}
