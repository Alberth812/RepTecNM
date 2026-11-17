import type { GlobalConfig } from "payload";

export const LoginConfig: GlobalConfig = {
 slug: "login-config",
 label: "Configuración de Login",
 admin: {
 description: "Gestión simple de la imagen de fondo para la página de inicio de sesión.",
 },
 access: {
 read: () => true, // Cualquiera puede leerla (el frontend la necesita)
 update: ({ req }) => Boolean(req.user), // Solo admins pueden editarla
 },
 fields: [
 {
 name: "imagenFondo",
 type: "upload",
 relationTo: "media",
 label: "Imagen de fondo",
 required: false,
 admin: {
 description: "Sube la imagen que aparecerá en el panel lateral del login. Deja este campo vacío para usar el fondo azul institucional por defecto.",
 },
 },
 ],
};

export default LoginConfig;
