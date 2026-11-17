import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Ronavi · Inversionistas',
  description: 'Aportes, ingresos y egresos de Ronavi',
  icons: { icon: '/img/favicon.png' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>{children}</body>
    </html>
  )
}
