import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { administradores } from "@/lib/db/schema/administradores";
import { afiliados } from "@/lib/db/schema/afiliados";
import { ok, toErrorResponse } from "@/lib/http/responses";
import { ROLES } from "@/lib/constants";

export async function GET() {
 try {
 const session = await requireSession();

 if (session.user.role === ROLES.ADMINISTRADOR) {
 const [profile] = await db
 .select({
 subtype: administradores.subtype,
 isRoot: administradores.isRoot,
 })
 .from(administradores)
 .where(eq(administradores.userId, session.user.id))
 .limit(1);

 return ok({
 id: session.user.id,
 email: session.user.email,
 role: session.user.role,
 subtype: profile?.subtype ?? null,
 isRoot: profile?.isRoot ?? false,
 });
 }

 const [profile] = await db
 .select({
 membershipStatus: afiliados.membershipStatus,
 folio: afiliados.folio,
 fotografiaArchivoId: afiliados.fotografiaArchivoId,
 nombres: afiliados.nombres,
 apellidoPaterno: afiliados.apellidoPaterno,
 apellidoMaterno: afiliados.apellidoMaterno,
 correoElectronico: afiliados.correoElectronico,
 telefonoCelular: afiliados.telefonoCelular,
 })
 .from(afiliados)
 .where(eq(afiliados.userId, session.user.id))
 .limit(1);

 return ok({
 id: session.user.id,
 email: session.user.email,
 role: session.user.role,
 folio: profile?.folio ?? null,
 membershipStatus: profile?.membershipStatus ?? null,
 fotografiaArchivoId: profile?.fotografiaArchivoId ?? null,
 nombres: profile?.nombres ?? null,
 apellidoPaterno: profile?.apellidoPaterno ?? null,
 apellidoMaterno: profile?.apellidoMaterno ?? null,
 correoElectronico: profile?.correoElectronico ?? null,
 telefonoCelular: profile?.telefonoCelular ?? null,
 });
 } catch (error) {
 return toErrorResponse(error);
 }
}
