import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";
import LayoutFooter from "@/components/LayoutFooter";
import CountdownBanner from "@/components/CountdownBanner";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hipermaxi Juan de la Rosa | Supermercado en Cochabamba",
  description:
    "Comprá en Hipermaxi sucursal Juan de la Rosa, Cochabamba. Supermercado, farmacia, panadería y más — precios competitivos, productos frescos y locales.",
  keywords: [
    "hipermaxi",
    "supermercado cochabamba",
    "juan de la rosa",
    "compras online bolivia",
    "supermercado bolivia",
  ],
  openGraph: {
    title: "Hipermaxi Juan de la Rosa",
    description: "Frescura y calidad local, cada día — Cochabamba, Bolivia.",
    locale: "es_BO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-100">
        {/*
         * CartProvider  — estado global del carrito (contexto + localStorage)
         * ToastProvider — sistema de notificaciones flotantes
         * CountdownBanner — banner de ofertas (debajo del header, antes del body)
         * CartDrawer está montado dentro de LayoutHeader para no perder contexto
         */}
        <CartProvider>
          <ToastProvider>
            <HeaderWrapper />
            <CountdownBanner />
            {children}
            <LayoutFooter />
            {/* Botón flotante de WhatsApp — visible en todas las páginas */}
            <WhatsAppButton />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
