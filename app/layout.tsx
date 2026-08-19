import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  icons: [{ url: "/logo.png" }],
  title: "REP TecNM - Red de Egresados de Posgrado",
  description: "Plataforma de la Red de Egresados de Posgrado del Tecnológico Nacional de México",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
