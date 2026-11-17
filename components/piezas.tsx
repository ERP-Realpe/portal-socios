import Link from 'next/link'
import { Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Encabezado({ titulo, detalle, children }: { titulo: string; detalle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        {detalle && <p className="mt-1 text-sm text-muted-foreground">{detalle}</p>}
      </div>
      {children}
    </div>
  )
}

export function Indicador({ titulo, valor, nota, tono }: { titulo: string; valor: string; nota?: string; tono?: 'bien' | 'mal' }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{titulo}</p>
      <p
        className={cn(
          'mt-1.5 text-2xl font-semibold tabular-nums',
          tono === 'bien' && 'text-[hsl(var(--status-success-fg))]',
          tono === 'mal' && 'text-[hsl(var(--status-danger-fg))]',
        )}
      >
        {valor}
      </p>
      {nota && <p className="mt-1 text-xs text-muted-foreground">{nota}</p>}
    </div>
  )
}

export function Seccion({ titulo, children, className }: { titulo: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border bg-card p-5', className)}>
      <h2 className="mb-4 font-semibold">{titulo}</h2>
      {children}
    </section>
  )
}

/** Barra de avance (aportado vs. pactado, peso de una categoría). */
export function Barra({ valor, total }: { valor: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (valor / total) * 100) : 0
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-[hsl(var(--brand-purple))]" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function EnlaceSoporte({ ruta }: { ruta: string | null }) {
  if (!ruta) return <span className="text-muted-foreground">—</span>
  return (
    <Link
      href={`/soporte?ruta=${encodeURIComponent(ruta)}`}
      target="_blank"
      className="inline-flex items-center gap-1 text-[hsl(var(--brand-label))] hover:underline"
    >
      <Paperclip className="size-3.5" /> Ver
    </Link>
  )
}

export function Vacio({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>
}
