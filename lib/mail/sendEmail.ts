import { MailtrapClient } from "mailtrap";

// Automatically check if running in Next.js development mode
const isDev = process.env.NODE_ENV === "development";

const mailtrap = new MailtrapClient({
  token: process.env.MAILTRAP_API_KEY!,
  sandbox: isDev,
  // Required only for sandbox mode so it knows which test inbox to use
  testInboxId: isDev ? Number(process.env.MAILTRAP_INBOX_ID) : undefined,
});

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  category?: string;
}) {
  try {
    await mailtrap.send({
      // Sandbox mode works best with a generic test sender address
      from: {
        name: "Your App",
        email: isDev ? "sandbox@example.com" : "no-reply@yourdomain.com",
      },
      to: [{ email: options.to }],
      // Optional: Prefix subject line in dev for quick visual identification
      subject: isDev ? `[SANDBOX] ${options.subject}` : options.subject,
      text: options.text,
      html: options.html,
      category: options.category,
    });

    if (isDev) {
      console.log(`[Dev Mode] Email intercepted & sent to Mailtrap Sandbox.`);
    }
  } catch (error) {
    console.error(
      `Failed to send "${options.subject}" to ${options.to}`,
      error,
    );
  }
}
