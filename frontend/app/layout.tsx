import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "REP TecNM - Red de Egresados de Posgrado",
  description: "Red de Egresados de Posgrado del Tecnológico Nacional de México",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('vite-ui-theme');
                // Forzar tema claro por defecto
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider defaultTheme="system" disableTransitionOnChange>
          {children}
        </ThemeProvider>
            <Toaster richColors position="top-center" />
    </body>
    </html>
  );
}
