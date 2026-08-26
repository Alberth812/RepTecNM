import { getJson } from "./fetch-json";

export interface MeResponse {
  id: string;
  email: string;
  role: "ADMINISTRADOR" | "AFILIADO";
  // Solo presentes cuando role === "ADMINISTRADOR"
  subtype?: string | null;
  folio: string | null;
  isRoot?: boolean;
  // Solo presente cuando role === "AFILIADO"
  membershipStatus?: string | null;
}

/** GET /api/me — requiere sesión; better-auth ya adjunta la cookie. */
export function fetchMe() {
  return getJson<MeResponse>("/api/me");
}
