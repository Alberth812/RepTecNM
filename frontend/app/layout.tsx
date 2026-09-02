import Script from "next/script";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

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
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('rep-tema') || localStorage.getItem('vite-ui-theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  /* Ignorar errores de localStorage */
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme="system" disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
