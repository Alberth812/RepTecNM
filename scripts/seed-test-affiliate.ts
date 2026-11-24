import "dotenv/config";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema/auth-schema";
import { afiliados } from "@/lib/db/schema/afiliados";
//
async function main() {
  const email = "afiliado@reptecnm.test";
  const password = "Afiliado123!";
  const name = "Afiliado de Prueba";

  console.log("Creando usuario base...");
  await auth.api.signUpEmail({ body: { name, email, password } });

  const [createdUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!createdUser) throw new Error("No se creó el usuario");

  console.log("Verificando correo y creando perfil de afiliado...");
  await db.transaction(async (tx) => {
    await tx.update(users).set({ emailVerified: true, role: "AFILIADO" }).where(eq(users.id, createdUser.id));
    
    await tx.insert(afiliados).values({
      userId: createdUser.id,
      membershipStatus: "NO_INICIADA",
      nombres: "Afiliado",
      apellidoPaterno: "Prueba",
      apellidoMaterno: "Test",
    }).onConflictDoNothing();
  });

  console.log(`Afiliado de prueba creado exitosamente: ${email}`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
