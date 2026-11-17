import { afiliadosIniciales } from "./afiliados";

export interface VerificacionResultado {
 encontrado: boolean;
 folio: string;
 estado?: string;
 nombre?: string;
 numero?: string;
 posgrado?: string;
 instituto?: string;
 emergencia?: {
 tipoSanguineo: string;
 alergias: string;
 contacto: {
 nombre: string;
 parentesco: string;
 telefono: string;
 };
 };
 idAfiliado?: string;
 contactoPublico?: boolean;
}

export function verificarFolio(folio: string): VerificacionResultado {
 // En producción esto vendría de la API con el folio real
 // Por ahora simulamos que el folio A1B2C3D4E5F6 corresponde al primer afiliado
 if (folio === "A1B2C3D4E5F6") {
 const afiliado = afiliadosIniciales[0]; // María Fernanda López
 return {
 encontrado: true,
 folio,
 estado: afiliado.estado,
 nombre: afiliado.nombre,
 numero: afiliado.id,
 posgrado: afiliado.posgrado,
 instituto: afiliado.instituto,
 emergencia: {
 tipoSanguineo: "O+",
 alergias: "Penicilina",
 contacto: {
 nombre: "Carlos López Herrera",
 parentesco: "Hermano",
 telefono: "55 9876 5432",
 },
 },
 idAfiliado: afiliado.id,
 contactoPublico: afiliado.contactoPublico,
 };
 }

 return {
 encontrado: false,
 folio,
 };
}
