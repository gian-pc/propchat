import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import 'mapbox-gl/dist/mapbox-gl.css' 

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PropChat - Encuentra tu hogar ideal con IA",
  description: "Plataforma inmobiliaria inteligente con búsqueda conversacional y mapa interactivo",
  keywords: ["inmobiliaria", "propiedades", "departamentos", "casas", "alquiler", "venta", "Lima", "Perú"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}