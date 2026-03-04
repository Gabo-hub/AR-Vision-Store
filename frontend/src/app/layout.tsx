import type { Metadata } from "next";
import { Outfit, Nunito } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import Script from "next/script";
import { LoginModalProvider } from "@/components/LoginModalProvider";
import { AuthProvider } from "@/components/AuthProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

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
      <body className={cn(outfit.variable, nunito.variable, "min-h-screen bg-[#faf8f5] antialiased font-body")}>
        <AuthProvider>
          <LoginModalProvider>
            <Header />
            <main>{children}</main>
            <footer className="bg-[#f0ebe5] py-12 mt-20">
              <div className="container mx-auto px-4 text-center">
                <p className="text-sm text-[#8a8582]">
                  © 2024 OpticAR. Hecho con ♥ para vos.
                </p>
              </div>
            </footer>
          </LoginModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
