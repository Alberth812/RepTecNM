// Ubicación sugerida: @/lib/instituciones/types.ts

import type { InferSelectModel } from "drizzle-orm";

import type { instituciones } from "@/lib/db/schema/instituciones";

export type Institucion = InferSelectModel<typeof instituciones>;

export interface PaginationMeta {
 page: number;
 pageSize: number;
 total: number;
 totalPages: number;
}

export interface InstitucionesListResponse {
 data: Institucion[];
 pagination: PaginationMeta;
}

export interface ApiErrorResponse {
 error: {
 code: string;
 message: string;
 issues?: unknown;
 };
}
