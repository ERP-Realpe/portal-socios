import Link from 'next/link'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GraficoMeses } from '@/components/grafico-meses'
import { Encabezado, Indicador, Seccion, Vacio } from '@/components/piezas'
import { hoyBogota, pesos } from '@/lib/datos'
import {
  anioValido,
  mesesDelAnio,
  neto,
  ordenNaturalezas,
  sumar,
  TEXTO_TIPO,
  type Naturaleza,
  type Tipo,
  type TotalMensual,
} from '@/lib/movimientos'
import { crearClienteServidor } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

const ROJO = 'text-[hsl(var(--status-danger-fg))]'

export default async function ResumenPage({ searchParams }: { searchParams: Promise<{ anio?: string }> }) {
  const anio = anioValido((await searchParams).anio)
  const supabase = await crearClienteServidor()
  const [{ data: totalesData }, { data: natData }] = await Promise.all([
    supabase.from('totales_mensuales').select('naturaleza_id, tipo, mes, total, cantidad'),
    supabase.from('naturalezas').select('id, tipo, nombre, activa, orden'),
  ])
  const totales = (totalesData ?? []) as TotalMensual[]
  const naturalezas = ((natData ?? []) as Naturaleza[]).sort(ordenNaturalezas)

  const prefijo = `${anio}-`
  const delAnio = (t: TotalMensual) => t.mes.startsWith(prefijo)
  const ingresosAnio = sumar(totales, (t) => delAnio(t) && t.tipo === 'ingreso')
  const egresosAnio = sumar(totales, (t) => delAnio(t) && t.tipo === 'egreso')
  const saldoFinal = neto(totales, (t) => t.mes <= `${anio}-12`)

  // Los meses que aún no llegan se muestran atenuados y sin saldo.
  const mesHoy = hoyBogota().slice(0, 7)
  const meses = mesesDelAnio(anio).map((m) => {
    const ingresos = sumar(totales, (t) => t.mes === m.clave && t.tipo === 'ingreso')
    const egresos = sumar(totales, (t) => t.mes === m.clave && t.tipo === 'egreso')
    return { ...m, ingresos, egresos, saldo: neto(totales, (t) => t.mes <= m.clave), futuro: m.clave > mesHoy }
  })

  const anios = [...new Set([...totales.map((t) => Number(t.mes.slice(0, 4))), Number(mesHoy.slice(0, 4)), anio])].sort(
    (a, b) => b - a,
  )
  const porAnio = anios.map((a) => {
    const ingresos = sumar(totales, (t) => t.mes.startsWith(`${a}-`) && t.tipo === 'ingreso')
    const egresos = sumar(totales, (t) => t.mes.startsWith(`${a}-`) && t.tipo === 'egreso')
    return { anio: a, ingresos, egresos, saldo: neto(totales, (t) => t.mes <= `${a}-12`) }
  })

  return (
    <>
      <Encabezado titulo={`Resumen ${anio}`} detalle="Ingresos y egresos por mes, por año y por naturaleza.">
        <nav className="flex flex-wrap gap-1" aria-label="Año">
          {anios.map((a) => (
            <Link
              key={a}
              href={`/?anio=${a}`}
              className={cn(
                'rounded-md border px-3 py-1.5 text-sm tabular-nums',
                a === anio ? 'border-transparent bg-[hsl(var(--brand-purple))] text-white' : 'bg-card hover:bg-muted',
              )}
            >
              {a}
            </Link>
          ))}
        </nav>
      </Encabezado>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador titulo={`Ingresos ${anio}`} valor={pesos(ingresosAnio)} />
        <Indicador titulo={`Egresos ${anio}`} valor={pesos(egresosAnio)} />
        <Indicador
          titulo={`Resultado ${anio}`}
          valor={pesos(ingresosAnio - egresosAnio)}
          nota="ingresos − egresos del año"
          tono={ingresosAnio - egresosAnio < 0 ? 'mal' : 'bien'}
        />
        <Indicador
          titulo="Saldo acumulado"
          valor={pesos(saldoFinal)}
          nota={anio < Number(mesHoy.slice(0, 4)) ? `al cierre de ${anio}` : 'desde el inicio, a hoy'}
          tono={saldoFinal < 0 ? 'mal' : 'bien'}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Seccion titulo="Mes a mes">
          <GraficoMeses meses={meses} />
        </Seccion>

        <Seccion titulo="Detalle mensual" className="min-w-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-right">Egresos</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meses.map((m) => {
                const r = m.ingresos - m.egresos
                return (
                  <TableRow key={m.clave} className={cn(m.futuro && 'text-muted-foreground/60')}>
                    <TableCell className="py-2 capitalize">{m.nombre}</TableCell>
                    <TableCell className="py-2 text-right tabular-nums">{pesos(m.ingresos)}</TableCell>
                    <TableCell className="py-2 text-right tabular-nums">{pesos(m.egresos)}</TableCell>
                    <TableCell className={cn('py-2 text-right tabular-nums', r < 0 && ROJO)}>{pesos(r)}</TableCell>
                    <TableCell className={cn('py-2 text-right tabular-nums', !m.futuro && m.saldo < 0 && ROJO)}>
                      {m.futuro ? '—' : pesos(m.saldo)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Seccion>
      </div>

      {(['ingreso', 'egreso'] as const).map((tipo) => (
        <MatrizNaturalezas
          key={tipo}
          tipo={tipo}
          anio={anio}
          naturalezas={naturalezas.filter((n) => n.tipo === tipo)}
          totales={totales.filter((t) => t.tipo === tipo)}
        />
      ))}

      <Seccion titulo="Año a año" className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Año</TableHead>
              <TableHead className="text-right">Ingresos</TableHead>
              <TableHead className="text-right">Egresos</TableHead>
              <TableHead className="text-right">Resultado</TableHead>
              <TableHead className="text-right">Saldo al cierre</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {porAnio.map((a) => (
              <TableRow key={a.anio}>
                <TableCell>
                  <Link href={`/?anio=${a.anio}`} className="font-medium hover:underline">{a.anio}</Link>
                </TableCell>
                <TableCell className="text-right tabular-nums">{pesos(a.ingresos)}</TableCell>
                <TableCell className="text-right tabular-nums">{pesos(a.egresos)}</TableCell>
                <TableCell className={cn('text-right tabular-nums', a.ingresos - a.egresos < 0 && ROJO)}>
                  {pesos(a.ingresos - a.egresos)}
                </TableCell>
                <TableCell className={cn('text-right tabular-nums', a.saldo < 0 && ROJO)}>{pesos(a.saldo)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Seccion>
    </>
  )
}

/** Naturalezas × meses del año, con total del año, participación y total histórico. */
function MatrizNaturalezas({
  tipo,
  anio,
  naturalezas,
  totales,
}: {
  tipo: Tipo
  anio: number
  naturalezas: Naturaleza[]
  totales: TotalMensual[]
}) {
  const textos = TEXTO_TIPO[tipo]
  const meses = mesesDelAnio(anio)
  const totalAnio = sumar(totales, (t) => t.mes.startsWith(`${anio}-`))
  // Las inactivas solo salen si tienen movimientos.
  const filas = naturalezas.filter((n) => n.activa || totales.some((t) => t.naturaleza_id === n.id))
  const celda = (natId: string | null, mes: string) =>
    sumar(totales, (t) => t.mes === mes && (natId === null || t.naturaleza_id === natId))

  return (
    <Seccion titulo={`${textos.plural} por naturaleza · ${anio}`} className="mt-6 min-w-0">
      {filas.length === 0 ? (
        <Vacio>No hay naturalezas de {textos.singular.toLowerCase()}.</Vacio>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-card">Naturaleza</TableHead>
              {meses.map((m) => (
                <TableHead key={m.clave} className="text-right capitalize">{m.nombre}</TableHead>
              ))}
              <TableHead className="text-right">Total {anio}</TableHead>
              <TableHead className="text-right">%</TableHead>
              <TableHead className="text-right">Histórico</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.map((n) => {
              const total = sumar(totales, (t) => t.naturaleza_id === n.id && t.mes.startsWith(`${anio}-`))
              const historico = sumar(totales, (t) => t.naturaleza_id === n.id)
              return (
                <TableRow key={n.id}>
                  <TableCell className={cn('sticky left-0 whitespace-nowrap bg-card py-2 font-medium', !n.activa && 'text-muted-foreground')}>
                    {n.nombre}
                  </TableCell>
                  {meses.map((m) => {
                    const v = celda(n.id, m.clave)
                    return (
                      <TableCell key={m.clave} className="whitespace-nowrap py-2 text-right tabular-nums">
                        {v > 0 ? (
                          <Link href={`${textos.ruta}?mes=${m.clave}&naturaleza=${n.id}`} className="hover:underline">
                            {pesos(v)}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                    )
                  })}
                  <TableCell className="whitespace-nowrap py-2 text-right font-medium tabular-nums">{pesos(total)}</TableCell>
                  <TableCell className="py-2 text-right tabular-nums text-muted-foreground">
                    {totalAnio > 0 ? `${Math.round((total / totalAnio) * 100)} %` : '—'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2 text-right tabular-nums text-muted-foreground">{pesos(historico)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="sticky left-0 bg-muted py-2">Total</TableCell>
              {meses.map((m) => (
                <TableCell key={m.clave} className="whitespace-nowrap py-2 text-right tabular-nums">{pesos(celda(null, m.clave))}</TableCell>
              ))}
              <TableCell className="whitespace-nowrap py-2 text-right tabular-nums">{pesos(totalAnio)}</TableCell>
              <TableCell className="py-2" />
              <TableCell className="whitespace-nowrap py-2 text-right tabular-nums">{pesos(sumar(totales, () => true))}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </Seccion>
  )
}
