export type UsuarioDemo = {
 correo: string;
 contrasena: string;
 rol: "afiliado" | "admin";
 nombre: string;
};

export const USUARIOS_DEMO: UsuarioDemo[] = [
 {
 correo: "mf.lopez@ejemplo.com",
 contrasena: "Egresada2026!",
 rol: "afiliado",
 nombre: "María Fernanda López Herrera",
 },
 {
 correo: "admin@reptecnm.mx",
 contrasena: "Directiva2026!",
 rol: "admin",
 nombre: "Administración RepTecNM",
 },
];
