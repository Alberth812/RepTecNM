/**
 * REP TecNM - Reglas de negocio reutilizables.
 * Fuente unica de verdad para validaciones del front.
 * El backend (Incremento 1) debe espejar estas mismas reglas.
 */

export const ANIO_ACTUAL = new Date().getFullYear();

export const LIMITES = {
 contrasenaMin: 8,
 tituloDoc: 300,
 resumenDoc: 1800,
 autoresDoc: { min: 1, max: 50, porAutor: 150 },
 clavesDoc: { min: 1, max: 15, porClave: 50 },
 tagsPerfil: { min: 1, max: 10 },
 testimonio: { min: 15, max: 250 },
 textoCms: { min: 150, max: 1500 },
 reporte: { min: 10, max: 300 },
 anio: { min: 1950, max: ANIO_ACTUAL },
 edad: { min: 18, max: 100 },
} as const;

export const PESOS_BUSQUEDA = {
 catalogo: { nombre: 5, palabrasClave: 4, descripcion: 2, proyectos: 1 },
 repositorio: { titulo: 5, palabrasClave: 4, autores: 3, resumen: 2 },
} as const;

export const TIPOS_ARCHIVO = {
 pdf: ["application/pdf"],
 imagen: ["image/jpeg", "image/png"],
 pdfEImagen: ["application/pdf", "image/jpeg", "image/png"],
} as const;

export const TAMANOS = {
 pdfDoc: 5 * 1024 * 1024,
 comprobante: 10 * 1024 * 1024,
 foto: 5 * 1024 * 1024,
 adjuntoMensaje: 5 * 1024 * 1024,
} as const;

export function soloDigitos(valor: string, maxLongitud: number): string {
 return valor.replace(/\D/g, "").slice(0, maxLongitud);
}

export function normalizarTexto(valor: string): string {
 return valor
 .toLowerCase()
 .normalize("NFD")
 .replace(/[\u0300-\u036f]/g, "")
 .replace(/\s+/g, " ")
 .trim();
}

export function esCorreo(valor: string): boolean {
 return /^\S+@\S+\.\S+$/.test(valor.trim());
}

export function reglasContrasena(valor: string) {
 return [
 { ok: valor.length >= LIMITES.contrasenaMin, texto: `${LIMITES.contrasenaMin} caracteres o más` },
 { ok: /[A-ZÁÉÍÓÚÑ]/.test(valor), texto: "Al menos una mayúscula" },
 { ok: /\d/.test(valor), texto: "Al menos un número" },
 { ok: /[^A-Za-z0-9]/.test(valor), texto: "Al menos un símbolo" },
 ];
}

export function cumpleContrasena(valor: string): boolean {
 return reglasContrasena(valor).every((r) => r.ok);
}

export function enRango(valor: string, min: number, max: number): boolean {
 if (valor === "") return false;
 const n = Number(valor);
 return !Number.isNaN(n) && n >= min && n <= max;
}

export function anioValido(valor: string): boolean {
 return enRango(valor, LIMITES.anio.min, LIMITES.anio.max);
}

export function edadValida(valor: string): boolean {
 return enRango(valor, LIMITES.edad.min, LIMITES.edad.max);
}

export function longitudValida(valor: string, min: number, max: number): boolean {
 const len = valor.trim().length;
 return len >= min && len <= max;
}

export function esUrlValida(valor: string): boolean {
 return /^https?:\/\/\S+$/.test(valor.trim());
}

export function errorArchivo(f: File, tiposPermitidos: readonly string[], maxBytes: number): string | null {
 if (!tiposPermitidos.includes(f.type)) return "Formato no permitido.";
 if (f.size > maxBytes) return `El archivo excede ${(maxBytes / 1024 / 1024).toFixed(0)} MB.`;
 return null;
}
