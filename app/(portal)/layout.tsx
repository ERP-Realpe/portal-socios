import Image from 'next/image'
import Link from 'next/link'
import { KeyRound, LogOut } from 'lucide-react'
import { Navegacion } from '@/components/navegacion'
import { exigirClaveCambiada } from '@/lib/datos'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const perfil = await exigirClaveCambiada()
  const esSocio = perfil.rol === 'socio'

  return (
    <div className="min-h-screen md:flex">
      <aside className="flex flex-col gap-4 bg-[hsl(var(--sidebar-background))] p-4 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
        <div className="flex items-center justify-between md:block">
          <Image src="/img/logo_blanco.png" alt="Ronavi" width={120} height={34} className="h-auto w-28" priority />
          <p className="text-xs text-[hsl(var(--sidebar-foreground))] md:mt-2">Portal de inversionistas</p>
        </div>
        <Navegacion esSocio={esSocio} />
        <div className="mt-auto hidden border-t border-[hsl(var(--sidebar-border))] pt-4 md:block">
          <p className="truncate text-sm text-white">{perfil.nombre ?? perfil.email}</p>
          <p className="text-xs capitalize text-[hsl(var(--sidebar-foreground))]">{perfil.rol}</p>
          <div className="mt-3 flex gap-4">
            <Link href="/cambiar-clave" className="flex items-center gap-2 text-xs text-[hsl(var(--sidebar-foreground))] hover:text-white">
              <KeyRound className="size-3.5" /> Contraseña
            </Link>
            <form action="/auth/salir" method="post">
              <button className="flex items-center gap-2 text-xs text-[hsl(var(--sidebar-foreground))] hover:text-white">
                <LogOut className="size-3.5" /> Salir
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
        {children}
        <div className="mt-10 flex gap-4 text-sm text-muted-foreground md:hidden">
          <Link href="/cambiar-clave" className="underline">Cambiar contraseña</Link>
          <form action="/auth/salir" method="post">
            <button className="underline">Salir ({perfil.email})</button>
          </form>
        </div>
      </main>
    </div>
  )
}
