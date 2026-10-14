import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth/session";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
 try {
 // 1. Verificar que haya sesión activa
 const session = await getCurrentSession();
 if (!session || !session.user) {
 return NextResponse.json({ error: "No autorizado" }, { status: 401 });
 }

 const { password } = await request.json();
 if (!password || typeof password !== "string") {
 return NextResponse.json({ error: "Contraseña requerida" }, { status: 400 });
 }

 // 2. Obtener el email del usuario actual desde la sesión
 const userEmail = session.user.email;
 if (!userEmail) {
 return NextResponse.json({ error: "Email no disponible en la sesión" }, { status: 400 });
 }

 // 3. Usar Better Auth para verificar las credenciales
 // signInEmail devuelve un token si las credenciales son correctas,
 // o lanza un error si son incorrectas.
 try {
 const result = await auth.api.signInEmail({
 body: {
 email: userEmail,
 password: password,
 },
 headers: await headers(),
 });

 // Si llegamos aquí sin error, la contraseña es correcta
 if (result && (result as any).token) {
 return NextResponse.json({ success: true });
 }

 return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
 } catch (authError: unknown) {
 // Better Auth lanza error con código "INVALID_CREDENTIALS" cuando la contraseña es incorrecta
 console.log(" Error de autenticación (esperado si contraseña incorrecta):", authError?.code || authError?.message);
 return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
 }
 } catch (error) {
 console.error(" Error en verificar-password:", error);
 return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
 }
}
