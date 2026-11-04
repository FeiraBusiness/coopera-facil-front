import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import ToastContainerClient from "./components/ToastContainerClient";
import { LicenseProvider } from "./contexts/LicenseContext";

// Archivo com eixo de largura (wdth): a mesma família serve para o texto e para os números expandidos.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "Coopera Fácil - Licenças ambientais da piscicultura",
  description: "Gestão das licenças ambientais dos produtores da cooperativa, com envio pelo WhatsApp e leitura automática.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${archivo.variable} antialiased`}>
        <LicenseProvider>{children}</LicenseProvider>
        <ToastContainerClient />
      </body>
    </html>
  );
}