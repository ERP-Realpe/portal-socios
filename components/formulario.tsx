'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoneyInput } from '@/components/ui/money-input'
import { cn } from '@/lib/utils'

export type EstadoAccion = { error?: string; ok?: string }
type Accion = (estado: EstadoAccion, form: FormData) => Promise<EstadoAccion>

/** Formulario de server action: muestra el error o la confirmación y se limpia al guardar. */
export function Formulario({
  accion,
  boton,
  children,
  className,
  compacto = false,
}: {
  accion: Accion
  boton: string
  children: React.ReactNode
  className?: string
  /** En una sola línea (edición dentro de una tabla); no se limpia al guardar. */
  compacto?: boolean
}) {
  const [estado, despachar, enviando] = useActionState(accion, {})
  const ref = useRef<HTMLFormElement>(null)
  // Cambia en cada guardado exitoso para remontar los campos controlados (montos).
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (estado.ok && !compacto) {
      ref.current?.reset()
      setVersion((v) => v + 1)
    }
  }, [estado, compacto])

  if (compacto) {
    return (
      <form action={despachar} className={cn('flex items-center gap-2', className)} title={estado.error}>
        {children}
        <Button type="submit" variant="ghost" size="sm" disabled={enviando}>{enviando ? '…' : boton}</Button>
        {estado.error && <span className="text-xs text-destructive">{estado.error}</span>}
      </form>
    )
  }

  return (
    <form ref={ref} action={despachar} className={cn('space-y-4', className)}>
      <div key={version} className="grid gap-4 sm:grid-cols-2">{children}</div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={enviando}>{enviando ? 'Guardando…' : boton}</Button>
        {estado.error && <p className="text-sm text-destructive">{estado.error}</p>}
        {estado.ok && <p className="text-sm text-[hsl(var(--status-success-fg))]">{estado.ok}</p>}
      </div>
    </form>
  )
}

export function Campo({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={props.name}>{label}</Label>
      <Input id={props.name} {...props} />
    </div>
  )
}

/** Monto en pesos con separador de miles; envía el valor numérico en un input oculto. */
export function CampoMonto({ label, name, className }: { label: string; name: string; className?: string }) {
  const [valor, setValor] = useState('')
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={name}>{label}</Label>
      <MoneyInput
        id={name}
        value={valor}
        onChange={setValor}
        required
        placeholder="0"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <input type="hidden" name={name} value={valor} />
    </div>
  )
}

export function CampoSelect({
  label,
  name,
  opciones,
  requerido = true,
  vacio = 'Selecciona…',
  className,
}: {
  label: string
  name: string
  opciones: { valor: string; texto: string }[]
  requerido?: boolean
  vacio?: string
  className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        required={requerido}
        defaultValue=""
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">{vacio}</option>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>{o.texto}</option>
        ))}
      </select>
    </div>
  )
}
