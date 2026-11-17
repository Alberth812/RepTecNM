// Ubicación sugerida: @/lib/instituciones/api/instituciones-client.ts

import type {
 ApiErrorResponse,
 Institucion,
 InstitucionesListResponse,
} from "@/lib/instituciones/types";
import type {
 CreateInstitucionInput,
 UpdateInstitucionInput,
} from "@/lib/validation/instituciones";

/**
 * Error tipado que conserva el status HTTP y el código de negocio,
 * para que la UI pueda distinguir por ejemplo un 409 de un 500.
 */
export class ApiRequestError extends Error {
 readonly status: number;
 readonly code: string;

 constructor(status: number, code: string, message: string) {
 super(message);
 this.name = "ApiRequestError";
 this.status = status;
 this.code = code;
 }
}

async function parseResponse<T>(response: Response): Promise<T> {
 const body = await response.json().catch(() => null);

 if (!response.ok) {
 const errorBody = body as ApiErrorResponse | null;
 throw new ApiRequestError(
 response.status,
 errorBody?.error?.code ?? "UNKNOWN_ERROR",
 errorBody?.error?.message ?? "Ocurrió un error inesperado.",
 );
 }

 return body as T;
}

export interface ListInstitucionesParams {
 page: number;
 pageSize: number;
 nombre?: string;
 estado?: "ACTIVO" | "INACTIVO";
}

export async function fetchInstituciones(
 params: ListInstitucionesParams,
): Promise<InstitucionesListResponse> {
 const searchParams = new URLSearchParams();
 searchParams.set("page", String(params.page));
 searchParams.set("pageSize", String(params.pageSize));
 if (params.nombre) searchParams.set("nombre", params.nombre);
 if (params.estado) searchParams.set("estado", params.estado);

 const response = await fetch(
 `/api/instituciones?${searchParams.toString()}`,
 {
 method: "GET",
 },
 );

 return parseResponse<InstitucionesListResponse>(response);
}

export async function createInstitucionRequest(
 input: CreateInstitucionInput,
): Promise<{ data: Institucion }> {
 const response = await fetch("/api/instituciones", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(input),
 });

 return parseResponse<{ data: Institucion }>(response);
}

export async function updateInstitucionRequest(
 id: string,
 input: UpdateInstitucionInput,
): Promise<{ data: Institucion }> {
 const response = await fetch(`/api/instituciones/${id}`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(input),
 });

 return parseResponse<{ data: Institucion }>(response);
}

export async function deleteInstitucionRequest(
 id: string,
): Promise<{ data: { id: string } }> {
 const response = await fetch(`/api/instituciones/${id}`, {
 method: "DELETE",
 });

 return parseResponse<{ data: { id: string } }>(response);
}
