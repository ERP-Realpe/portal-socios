'use client'

import Image from 'next/image'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ingresar, type EstadoLogin } from './acciones'

export default function LoginPage() {
  const [estado, accion, enviando] = useActionState<EstadoLogin, FormData>(ingresar, {})

  return (
    <main className="flex min-h-screen items-center justify-center bg-[hsl(var(--brand-tint))] px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <Image src="/img/logo_morado_hd.png" alt="Ronavi" width={140} height={40} className="mb-6 h-auto w-32" priority />
        <h1 className="text-xl font-semibold">Portal de inversionistas</h1>

        <form action={accion} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="tu@correo.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clave">Contraseña</Label>
            <Input id="clave" name="clave" type="password" autoComplete="current-password" required />
          </div>
          {estado.error && <p className="text-sm text-destructive">{estado.error}</p>}
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </main>
  )
}
