import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

/**
 * Envoltorio mínimo sobre Nodemailer para desacoplar el resto de la app del
 * proveedor de correo concreto. Por defecto apunta a un SMTP local, pero
 * basta con cambiar las variables de entorno SMTP para apuntar a cualquier
 * otro proveedor SMTP real en producción; el resto del código nunca importa `nodemailer` directamente.
 */

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 1025);
  const secure = process.env.SMTP_SECURE === "true";

  if (!host) {
    throw new Error(
      "Configuración SMTP incompleta. Define SMTP_HOST y SMTP_PORT.",
    );
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const transportOptions: SMTPTransport.Options = {
    host,
    port,
    secure,
  };

  // Only configure authentication when the SMTP provider requires it.
  if (user && pass) {
    transportOptions.auth = {
      user,
      pass,
    };
  }

  transporter = nodemailer.createTransport(transportOptions);

  return transporter;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendEmailInput): Promise<void> {
  const from = process.env.SMTP_FROM ?? "no-reply@localhost";

  // Nota de seguridad (RF-AUTH plugin docs): se recomienda no hacer await
  // del envío de correo dentro del propio callback de better-auth para
  // evitar ataques de temporización. Aquí sí hacemos await porque estamos
  // en un entorno Node de vida larga (no serverless de corta duración) y
  // preferimos poder capturar/loggear errores de envío explícitamente; si
  // se despliega en un runtime serverless, envolver esta llamada con
  // `ctx.context.runInBackground` (better-auth) o el `waitUntil` de la
  // plataforma.

  await getTransporter().sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}
