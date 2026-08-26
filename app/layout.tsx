import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  icons: [{ url: "/logo.png" }],
  title: "REP TecNM - Red de Egresados de Posgrado",
  description:
    "Plataforma de la Red de Egresados de Posgrado del Tecnológico Nacional de México",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
