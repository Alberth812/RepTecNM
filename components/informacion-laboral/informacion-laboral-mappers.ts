// @/components/informacion-laboral/informacion-laboral-mappers.ts
//
// Traduce el resultado "crudo" de `getInformacionLaboralSeccion` (columnas de
// Drizzle, con arrays que pueden venir `null` cuando nunca se guardaron) a la
// forma que espera el prop `defaultValues` de <InformacionLaboralForm />.
// Es un mapeo explícito (campo por campo) a propósito, en vez de un spread
// directo: así, si la tabla cambia, TypeScript marca el mismatch aquí en vez
// de fallar en silencio dentro del formulario.

import type { InformacionLaboralSeccionRow } from "@/lib/seguimiento/informacion-laboral";
import type {
 DeepPartial,
 InformacionLaboralFormValues,
} from "./informacion-laboral-form";

export function mapRowToFormDefaults(
 row: InformacionLaboralSeccionRow,
): DeepPartial<InformacionLaboralFormValues> {
 const info = row.informacionLaboral;

 return {
 informacionLaboral: info
 ? {
 tiempoPrimerEmpleo: info.tiempoPrimerEmpleo,
 factoresEmpleo: info.factoresEmpleo ?? [],
 factoresEmpleoOtro: info.factoresEmpleoOtro,
 laboraActualmente: info.laboraActualmente,
 causasDesempleo: info.causasDesempleo ?? [],
 causasDesempleoOtro: info.causasDesempleoOtro,
 estrategiaPostgrado: info.estrategiaPostgrado ?? [],
 estrategiaPostgradoOtro: info.estrategiaPostgradoOtro,
 }
 : undefined,
 historialEmpleos: row.historialEmpleos.map((empleo) => ({
 puesto: empleo.puesto,
 institucion: empleo.institucion,
 fechaInicioAnio: empleo.fechaInicioAnio,
 fechaInicioMes: empleo.fechaInicioMes,
 esActual: empleo.esActual,
 fechaFinAnio: empleo.fechaFinAnio,
 fechaFinMes: empleo.fechaFinMes,
 tipoContratacion: empleo.tipoContratacion,
 tipoContratacionOtro: empleo.tipoContratacionOtro,
 // Columna `numeric`: Drizzle la entrega como string; el input numérico
 // del formulario la acepta tal cual (se re-coacciona a number al
 // validar con Zod).
 salarioMensualBruto: empleo.salarioMensualBruto,
 horasSemanales: empleo.horasSemanales,
 tipoInstitucion: empleo.tipoInstitucion ?? [],
 tipoInstitucionOtro: empleo.tipoInstitucionOtro,
 telefonoOrganismo: empleo.telefonoOrganismo,
 sectorPrimario: empleo.sectorPrimario ?? [],
 sectorSecundario: empleo.sectorSecundario ?? [],
 sectorTerciario: empleo.sectorTerciario ?? [],
 tipoActividad: empleo.tipoActividad ?? [],
 tipoActividadOtro: empleo.tipoActividadOtro,
 actividadesPrincipales: empleo.actividadesPrincipales,
 estrategiaEmpleoActual: empleo.estrategiaEmpleoActual ?? [],
 estrategiaEmpleoActualOtro: empleo.estrategiaEmpleoActualOtro,
 valoracionCoincidenciaConocimientos:
 empleo.valoracionCoincidenciaConocimientos,
 valoracionCapacidadResolverProblemas:
 empleo.valoracionCapacidadResolverProblemas,
 valoracionImpactoSocial: empleo.valoracionImpactoSocial,
 valoracionPertinenciaPrograma: empleo.valoracionPertinenciaPrograma,
 })),
 };
}
