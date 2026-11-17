'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowDownCircle, ArrowUpCircle, LayoutDashboard, Tags, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const ENLACES = [
  { href: '/', texto: 'Resumen', icono: LayoutDashboard, soloSocio: false },
  { href: '/ingresos', texto: 'Ingresos', icono: ArrowDownCircle, soloSocio: false },
  { href: '/egresos', texto: 'Egresos', icono: ArrowUpCircle, soloSocio: false },
  { href: '/naturalezas', texto: 'Naturalezas', icono: Tags, soloSocio: true },
  { href: '/usuarios', texto: 'Usuarios', icono: Users, soloSocio: true },
]

export function Navegacion({ esSocio }: { esSocio: boolean }) {
  const ruta = usePathname()
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {ENLACES.filter((e) => esSocio || !e.soloSocio).map(({ href, texto, icono: Icono }) => {
        const activo = href === '/' ? ruta === '/' : ruta.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
              activo
                ? 'bg-[hsl(var(--sidebar-primary))] text-white'
                : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]',
            )}
          >
            <Icono className="size-4" />
            {texto}
          </Link>
        )
      })}
    </nav>
  )
}
