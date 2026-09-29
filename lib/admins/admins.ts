// lib/api/admins.ts
//
// NOTA: se asume que `ok()` serializa el payload tal cual como cuerpo JSON
// (sin envoltorio adicional, p. ej. `NextResponse.json(payload, init)`) y
// que `toErrorResponse()` devuelve un cuerpo con al menos un campo
// `message` (y opcionalmente `code`), igual que ApiError. Si la forma real
// de esas respuestas es distinta en tu proyecto, ajusta solo la función
// `parseResponse` de este archivo.

import type { z } from "zod";
import type { createAdminSchema } from "@/lib/validation/schemas";
import type { AdminListParams, AdminListResponse } from "./types";

export class AdminApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = code;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message?: unknown }).message)
        : "Ocurrió un error inesperado.";
    const code =
      body && typeof body === "object" && "code" in body
        ? String((body as { code?: unknown }).code)
        : undefined;
    throw new AdminApiError(response.status, message, code);
  }

  return body as T;
}

export async function fetchAdmins(
  params: AdminListParams,
): Promise<AdminListResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.subtype) searchParams.set("subtype", params.subtype);
  if (params.isActive !== undefined) {
    searchParams.set("isActive", String(params.isActive));
  }
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));

  const response = await fetch(`/api/admin/list?${searchParams.toString()}`, {
    method: "GET",
  });

  return parseResponse<AdminListResponse>(response);
}

export async function createAdmin(
  input: z.infer<typeof createAdminSchema>,
): Promise<void> {
  const response = await fetch("/api/admin/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  await parseResponse<unknown>(response);
}

export async function deactivateAdmin(userId: string): Promise<void> {
  const response = await fetch("/api/admin/deactivate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  await parseResponse<unknown>(response);
}

export async function activateAdmin(userId: string): Promise<void> {
  const response = await fetch("/api/admin/activate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  await parseResponse<unknown>(response);
}
