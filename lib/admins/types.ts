// types/admin.ts

export type AdminSubtype = "GENERAL" | "CONTENIDO";

export interface AdminListItem {
  userId: string;
  nombreCompleto: string;
  subtype: AdminSubtype;
  isActive: boolean;
  email: string;
}

export interface AdminListPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AdminListResponse {
  admins: AdminListItem[];
  pagination: AdminListPagination;
}

export interface AdminListParams {
  search?: string;
  subtype?: AdminSubtype;
  isActive?: boolean;
  sortBy?: "nombreCompleto" | "email";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}
