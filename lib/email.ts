import nodemailer from "nodemailer";

/**
 * Transporte de correo. Usa Mailtrap (SMTP) por variables de entorno.
 * Se aísla en este módulo para que auth.ts (y cualquier otra parte de la
 * app) no dependa de un proveedor de correo concreto: para pasar a otro
 * proveedor (Resend, SES, etc.) solo hay que reescribir este archivo.
 */
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT ?? 2525),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? "No Responder <no-responder@example.test>",
    to,
    subject,
    html,
    text,
  });
}

function otpEmailShell(title: string, message: string, otp: string) {
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:32px;background:#f4f3f0;font-family:Georgia,'Times New Roman',serif;color:#1f2a24;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e1d8;">
      <tr>
        <td style="padding:32px 32px 8px 32px;">
          <p style="margin:0 0 4px 0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#7a6a4f;font-family:Arial,sans-serif;">Asociación de Afiliados</p>
          <h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.3;">${title}</h1>
          <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#3a4640;">${message}</p>
          <div style="margin:0 0 24px 0;padding:18px 24px;background:#f4f3f0;border-radius:8px;text-align:center;">
            <span style="font-family:'Courier New',monospace;font-size:32px;letter-spacing:0.35em;font-weight:700;color:#1f2a24;">${otp}</span>
          </div>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#7a8880;font-family:Arial,sans-serif;">
            Este código vence en 15 minutos. Si tú no solicitaste esto, puedes ignorar este correo.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendOtpEmail(params: {
  to: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
}) {
  const { to, otp, type } = params;

  const copy: Record<"sign-in" | "email-verification" | "forget-password", { subject: string; title: string; message: string }> = {
    "sign-in": {
      subject: "Tu código de acceso",
      title: "Código de acceso",
      message: "Usa este código para iniciar sesión.",
    },
    "email-verification": {
      subject: "Verifica tu correo electrónico",
      title: "Verifica tu correo",
      message: "Ingresa este código para confirmar tu correo electrónico y activar tu cuenta.",
    },
    "forget-password": {
      subject: "Recupera tu contraseña",
      title: "Recuperación de contraseña",
      message: "Ingresa este código para elegir una nueva contraseña.",
    },
  };

  const { subject, title, message } = copy[type];

  await sendEmail({
    to,
    subject,
    html: otpEmailShell(title, message, otp),
    text: `${title}\n\n${message}\n\nCódigo: ${otp}\n\nEste código vence en 15 minutos.`,
  });
}

export async function sendChangeEmailOtp(params: { to: string; otp: string }) {
  await sendEmail({
    to: params.to,
    subject: "Confirma tu nuevo correo electrónico",
    html: otpEmailShell(
      "Confirma tu nuevo correo",
      "Ingresa este código en la aplicación para confirmar que este es tu nuevo correo de inicio de sesión.",
      params.otp,
    ),
    text: `Confirma tu nuevo correo\n\nCódigo: ${params.otp}\n\nEste código vence en 15 minutos.`,
  });
}
