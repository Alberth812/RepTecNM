// @/components/informacion-laboral/informacion-laboral-types.ts

import type { z } from "zod";
import { informacionLaboralSeccionSchema } from "@/lib/validation/informacion-laboral";

export type InformacionLaboralFormValues = z.input<
  typeof informacionLaboralSeccionSchema
>;

export type InformacionLaboralSeccionOutput = z.output<
  typeof informacionLaboralSeccionSchema
>;

export type EmpleoFormValues =
  InformacionLaboralFormValues["historialEmpleos"][number];
