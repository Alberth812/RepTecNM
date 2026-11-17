import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
 allowedDevOrigins: ["http://172.16.30.7:3000", "http://localhost:3000"],
 devIndicators: {
 position: "bottom-right",
 },
 images: {
 localPatterns: [
 {
 pathname: "/contenido-api/media/**",
 },
 {
 // Permite cargar imágenes estáticas del directorio public (ej. /logo.png)
 pathname: "/**",
 },
 ],
 remotePatterns: [
 {
 protocol: "http",
 hostname: "localhost",
 port: "3000",
 pathname: "/contenido-api/media/**",
 },
 ],
 },
 // CABECERAS DE SEGURIDAD HTTP
 async headers() {
 return [
 {
 source: "/:path*",
 headers: [
 {
 key: "X-Content-Type-Options",
 value: "nosniff", // Evita que el navegador adivine tipos MIME maliciosos
 },
 {
 key: "X-Frame-Options",
 value: "DENY", // Previene ataques de clickjacking (no permitir iframes)
 },
 {
 key: "X-XSS-Protection",
 value: "1; mode=block", // Protección básica contra XSS en navegadores antiguos
 },
 {
 key: "Referrer-Policy",
 value: "strict-origin-when-cross-origin", // Controla cuánta información de la URL se envía en las solicitudes
 },
 {
 key: "Permissions-Policy",
 value: "camera=(), microphone=(), geolocation=()", // Deshabilita acceso a hardware sensible por defecto
 },
 ],
 },
 ];
 },
};

export default withPayload(nextConfig);
