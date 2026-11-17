'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cambiarClave, type EstadoClave } from './acciones'

export function FormularioClave() {
  const [estado, accion, enviando] = useActionState<EstadoClave, FormData>(cambiarClave, {})

  return (
    <form action={accion} className="mt-6 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="clave">Nueva contraseña</Label>
        <Input id="clave" name="clave" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmacion">Repítela</Label>
        <Input id="confirmacion" name="confirmacion" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      {estado.error && <p className="text-sm text-destructive">{estado.error}</p>}
      <Button type="submit" className="w-full" disabled={enviando}>
        {enviando ? 'Guardando…' : 'Guardar y entrar'}
      </Button>
    </form>
  )
}
