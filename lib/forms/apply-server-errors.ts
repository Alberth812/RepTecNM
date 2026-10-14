import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

interface ZodIssueLike {
 path?: Array<string | number>;
 message?: string;
}

/**
 * `toErrorResponse` devuelve, para un ZodError, `error.issues` con la forma
 * nativa de zod (`{ path, message }[]`). Si el backend rechaza algo que nuestra
 * validación de cliente no capturó (esquemas desincronizados, reglas que solo
 * existen en el servidor, etc.), esto lo muestra en el campo correcto en vez
 * de un mensaje genérico.
 *
 * Devuelve `true` si logró aplicar al menos un error de campo.
 */
export function applyServerValidationErrors<TValues extends FieldValues>(
 form: UseFormReturn<TValues>,
 issues: unknown,
): boolean {
 if (!Array.isArray(issues)) return false;

 let applied = false;
 for (const rawIssue of issues as ZodIssueLike[]) {
 const path = rawIssue?.path?.join(".");
 if (!path || !rawIssue?.message) continue;
 form.setError(path as Path<TValues>, {
 type: "server",
 message: rawIssue.message,
 });
 applied = true;
 }
 return applied;
}
