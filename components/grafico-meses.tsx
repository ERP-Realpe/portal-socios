import { pesos } from '@/lib/datos'

// Validado con el validador de paletas (claro): azul/ámbar, ΔE CVD 32.
const COLOR = { ingresos: '#2563eb', egresos: '#d97706' }

type Mes = { clave: string; nombre: string; ingresos: number; egresos: number }

/** Barras agrupadas de ingresos y egresos por mes, en una sola escala. */
export function GraficoMeses({ meses }: { meses: Mes[] }) {
  const maximo = Math.max(1, ...meses.flatMap((m) => [m.ingresos, m.egresos]))
  return (
    <figure>
      <div className="mb-3 flex gap-4 text-xs text-muted-foreground">
        {(['ingresos', 'egresos'] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5 capitalize">
            <span className="size-2.5 rounded-sm" style={{ background: COLOR[s] }} /> {s}
          </span>
        ))}
      </div>
      <div className="flex h-48 items-end gap-1 border-b border-border sm:gap-2">
        {meses.map((m) => (
          <div
            key={m.clave}
            className="group relative flex h-full flex-1 items-end justify-center gap-[2px] rounded-sm hover:bg-muted/60"
          >
            {(['ingresos', 'egresos'] as const).map((s) => (
              <div
                key={s}
                className="w-full max-w-4 rounded-t-[4px]"
                style={{ height: `${(m[s] / maximo) * 100}%`, background: COLOR[s], minHeight: m[s] > 0 ? 2 : 0 }}
              />
            ))}
            <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-md border bg-card px-2.5 py-1.5 text-xs shadow-md group-hover:block">
              <p className="mb-0.5 font-medium capitalize">{m.nombre}</p>
              <p className="tabular-nums">Ingresos {pesos(m.ingresos)}</p>
              <p className="tabular-nums">Egresos {pesos(m.egresos)}</p>
              <p className="tabular-nums text-muted-foreground">Resultado {pesos(m.ingresos - m.egresos)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1 sm:gap-2">
        {meses.map((m) => (
          <span key={m.clave} className="flex-1 text-center text-[11px] capitalize text-muted-foreground">{m.nombre}</span>
        ))}
      </div>
    </figure>
  )
}
