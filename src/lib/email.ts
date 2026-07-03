import nodemailer from "nodemailer";

type SendEmailParams = {
  to: string[];
  subject: string;
  text: string;
  pdf: Buffer;
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variavel de ambiente ausente: ${name}`);
  }
  return value;
}

export async function sendFormEmail({ to, subject, text, pdf }: SendEmailParams) {
  const host = requiredEnv("SMTP_HOST");

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: {
      servername: host
    },
    auth: {
      user: requiredEnv("SMTP_USER"),
      pass: requiredEnv("SMTP_PASS")
    }
  });

  await transporter.sendMail({
    from: requiredEnv("EMAIL_FROM"),
    to,
    subject,
    text,
    attachments: [
      {
        filename: `formulario-${Date.now()}.pdf`,
        content: pdf,
        contentType: "application/pdf"
      }
    ]
  });
}
