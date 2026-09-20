import type { Metadata, Viewport } from "next";
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Regalá Flores | Día de la Primavera",
  description:
    "Armá tu regalo virtual de flores amarillas y compartilo con esa persona especial para el Día de la Primavera.",
};

export const viewport: Viewport = {
  themeColor: "#FFF3B0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <div className="flex min-h-[100svh] flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}