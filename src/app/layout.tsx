import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Formulário",
  description: "Formulário com envio de PDF por e-mail",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
