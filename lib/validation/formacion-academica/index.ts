// @/lib/validations/formacion-academica.ts
//
// recommended_zod_strategy: "Conviene crear esquemas independientes para
// licenciatura, posgrado y estancia posdoctoral. Después debe construirse
// un esquema de formación académica que combine las entidades."
//
// Uso en FRONTEND: valida una entidad a la vez, p. ej. en el formulario de
// "agregar licenciatura":
//
//   const form = useForm({ resolver: zodResolver(licenciaturaSchema) });
//
// Uso en BACKEND: valida el payload completo del perfil académico antes de
// persistir (server action / route handler):
//
//   const parsed = formacionAcademicaSchema.safeParse(body);
//   if (!parsed.success) return Response.json(parsed.error.format(), { status: 422 });

import { z } from "zod";
import { licenciaturaSchema } from "./licenciatura";
import { posgradoSchema } from "./posgrado";
import { estanciaPosdoctoralSchema } from "./estancia-posdoctoral";

export * from "./common";
export * from "./licenciatura";
export * from "./posgrado";
export * from "./estancia-posdoctoral";

export const formacionAcademicaSchema = z.object({
  licenciaturas: z.array(licenciaturaSchema).default([]),
  posgrados: z.array(posgradoSchema).default([]),
  estanciasPosdoctorales: z.array(estanciaPosdoctoralSchema).default([]),
});

export type FormacionAcademicaInput = z.input<typeof formacionAcademicaSchema>;
export type FormacionAcademicaOutput = z.output<
  typeof formacionAcademicaSchema
>;

export type FormacionAcademica = z.infer<typeof formacionAcademicaSchema>;
