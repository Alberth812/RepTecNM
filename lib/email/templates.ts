/**
 * Plantillas de texto para los correos transaccionales de autenticación.
 * Se mantienen como texto plano + un HTML muy simple: este proyecto es solo
 * backend, así que no hay marca/diseño que respetar; cualquier equipo de
 * frontend puede reemplazar esto o renderizar su propio HTML más adelante.
 */

const wrapHtml = (title: string, bodyLines: string[]) => `
 <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
 <h2>${title}</h2>
 ${bodyLines.map((l) => `<p>${l}</p>`).join("\n")}
 </div>
`;

export function verificationOtpEmail(otp: string, expiresInMinutes: number) {
 return {
 subject: "Tu código de verificación",
 text: `Tu código de verificación es: ${otp}\n\nEste código vence en ${expiresInMinutes} minutos. Si no solicitaste este código, ignora este mensaje.`,
 html: wrapHtml("Tu código de verificación", [
 `Tu código es: <strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong>`,
 `Vence en ${expiresInMinutes} minutos.`,
 "Si no solicitaste este código, ignora este mensaje.",
 ]),
 };
}

export function passwordResetLinkEmail(resetUrl: string, expiresInMinutes: number) {
 return {
 subject: "Recupera tu contraseña",
 text: `Recibimos una solicitud para restablecer tu contraseña. Abre el siguiente enlace para continuar (vence en ${expiresInMinutes} minutos):\n\n${resetUrl}\n\nSi no solicitaste este cambio, ignora este mensaje; tu contraseña actual seguirá siendo válida.`,
 html: wrapHtml("Recupera tu contraseña", [
 `Recibimos una solicitud para restablecer tu contraseña. Este enlace vence en ${expiresInMinutes} minutos:`,
 `<a href="${resetUrl}">${resetUrl}</a>`,
 "Si no solicitaste este cambio, ignora este mensaje; tu contraseña actual seguirá siendo válida.",
 ]),
 };
}

export function changeEmailOtpEmail(otp: string, expiresInMinutes: number) {
 return {
 subject: "Confirma tu nuevo correo",
 text: `Solicitaste cambiar el correo de tu cuenta. Tu código de confirmación es: ${otp}\n\nEste código vence en ${expiresInMinutes} minutos. Si no solicitaste este cambio, ignora este mensaje.`,
 html: wrapHtml("Confirma tu nuevo correo", [
 `Tu código de confirmación es: <strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong>`,
 `Vence en ${expiresInMinutes} minutos.`,
 "Si no solicitaste este cambio, ignora este mensaje.",
 ]),
 };
}

export function adminWelcomeEmail(email: string, subtype: string) {
 return {
 subject: "Se creó tu cuenta de administrador",
 text: `Se creó una cuenta de administrador para ti (${email}), con tipo ${subtype}. Usa la contraseña que te proporcionó quien te dio de alta para iniciar sesión.`,
 html: wrapHtml("Se creó tu cuenta de administrador", [
 `Se creó una cuenta de administrador para ${email}, con tipo <strong>${subtype}</strong>.`,
 "Usa la contraseña que te proporcionó quien te dio de alta para iniciar sesión.",
 ]),
 };
}
