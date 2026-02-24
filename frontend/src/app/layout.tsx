import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpticAR | Probador de Lentes Virtual",
  description: "Encuentra tus lentes ideales con nuestra tecnología de Realidad Aumentada.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <Script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={cn(inter.className, "min-h-screen bg-slate-50/50 antialiased")}>
        <Header />
        <main>{children}</main>
        <footer className="border-t bg-white py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-500">
              © 2024 OpticAR. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
