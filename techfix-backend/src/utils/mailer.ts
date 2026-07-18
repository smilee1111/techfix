import nodemailer from "nodemailer";
import { env } from "../config/env";

/**
 * Sends an email via SMTP when credentials are configured.
 * Falls back to logging the message to the console in local development
 * so the reset-password flow is testable without real SMTP credentials.
 */
export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.log(`\n📧 [DEV EMAIL] To: ${options.to}\nSubject: ${options.subject}\n${options.html}\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
