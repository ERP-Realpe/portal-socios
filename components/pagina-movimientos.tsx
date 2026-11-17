import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BotonConfirmar } from '@/components/boton-confirmar'
import { Campo, CampoMonto, CampoSelect, Formulario } from '@/components/formulario'
import { Barra, EnlaceSoporte, Encabezado, Seccion, Vacio } from '@/components/piezas'
import { fecha, hoyBogota, obtenerPerfil, pesos, suma } from '@/lib/datos'
import { nombreMes, ordenNaturalezas, rangoMes, TEXTO_TIPO, type Naturaleza, type Tipo } from '@/lib/movimientos'
import { crearClienteServidor } from '@/lib/supabase/server'
import { eliminarMovimiento, registrarMovimiento } from '@/app/(portal)/acciones'

type Movimiento = {
  id: string
  fecha: string
  naturaleza_id: string
  tercero: string
  concepto: string
  monto: number
  medio: string | null
  referencia: string | null
  soporte_path: string | null
}

const DETALLE = {
  ingreso: 'Toda la plata que entra, clasificada por su naturaleza.',
  egreso: 'Todo lo que se paga o se invierte, clasificado por su naturaleza y con su soporte.',
}

/** Lista del mes, reparto por naturaleza y formulario de registro: igual para ingresos y egresos. */
export async function PaginaMovimientos({ tipo, filtros }: { tipo: Tipo; filtros: { mes?: string; naturaleza?: string } }) {
  const perfil = await obtenerPerfil()
  const esSocio = perfil.rol === 'socio'
  const textos = TEXTO_TIPO[tipo]
  const { clave, desde, hasta } = rangoMes(filtros.mes)
  const supabase = await crearClienteServidor()

  let consulta = supabase
    .from('movimientos')
    .select('id, fecha, naturaleza_id, tercero, concepto, monto, medio, referencia, soporte_path')
    .eq('tipo', tipo)
    .gte('fecha', desde)
    .lt('fecha', hasta)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
  if (filtros.naturaleza) consulta = consulta.eq('naturaleza_id', filtros.naturaleza)

  const [{ data: movimientos }, { data: naturalezas }] = await Promise.all([
    consulta,
    supabase.from('naturalezas').select('id, tipo, nombre, activa, orden').eq('tipo', tipo),
  ])
  const lista = (movimientos ?? []) as Movimiento[]
  const listaNat = ((naturalezas ?? []) as Naturaleza[]).sort(ordenNaturalezas)
  const nombreNat = new Map(listaNat.map((n) => [n.id, n.nombre]))
  const total = suma(lista)

  const reparto = listaNat
    .map((n) => ({ ...n, total: suma(lista.filter((m) => m.naturaleza_id === n.id)) }))
    .filter((n) => n.total > 0)
    .sort((a, b) => b.total - a.total)

  return (
    <>
      <Encabezado titulo={textos.plural} detalle={DETALLE[tipo]}>
        <form className="flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="mb-1 block text-xs text-muted-foreground">Mes</span>
            <input type="month" name="mes" defaultValue={clave} className="h-9 rounded-md border border-input bg-background px-2 text-sm" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs text-muted-foreground">Naturaleza</span>
            <select name="naturaleza" defaultValue={filtros.naturaleza ?? ''} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
              <option value="">Todas</option>
              {listaNat.map((n) => (
                <option key={n.id} value={n.id}>{n.nombre}</option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="outline" size="sm">Filtrar</Button>
        </form>
      </Encabezado>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Seccion titulo={`${textos.plural} de ${nombreMes(clave)} · ${pesos(total)}`} className="min-w-0">
          {lista.length === 0 ? (
            <Vacio>No hay {textos.plural.toLowerCase()} con este filtro.</Vacio>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Naturaleza</TableHead>
                  <TableHead>{tipo === 'ingreso' ? 'De' : 'A'}</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Medio</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Soporte</TableHead>
                  {esSocio && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="whitespace-nowrap">{fecha(m.fecha)}</TableCell>
                    <TableCell>{nombreNat.get(m.naturaleza_id)}</TableCell>
                    <TableCell className="font-medium">{m.tercero}</TableCell>
                    <TableCell>{m.concepto}</TableCell>
                    <TableCell>{[m.medio, m.referencia].filter(Boolean).join(' · ') || '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">{pesos(m.monto)}</TableCell>
                    <TableCell><EnlaceSoporte ruta={m.soporte_path} /></TableCell>
                    {esSocio && (
                      <TableCell>
                        <BotonConfirmar
                          accion={eliminarMovimiento}
                          campos={{ id: m.id }}
                          pregunta={`¿Eliminar el ${textos.singular.toLowerCase()} de ${pesos(m.monto)} (${m.concepto})? No se puede deshacer.`}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" aria-label="Eliminar" />
                        </BotonConfirmar>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5}>Total</TableCell>
                  <TableCell className="text-right tabular-nums">{pesos(total)}</TableCell>
                  <TableCell colSpan={esSocio ? 2 : 1} />
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </Seccion>

        <Seccion titulo="Por naturaleza">
          {reparto.length === 0 ? (
            <Vacio>Sin movimientos.</Vacio>
          ) : (
            <ul className="space-y-3">
              {reparto.map((n) => (
                <li key={n.id}>
                  <div className="mb-1 flex justify-between gap-2 text-sm">
                    <span>{n.nombre}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {pesos(n.total)} · {Math.round((n.total / total) * 100)} %
                    </span>
                  </div>
                  <Barra valor={n.total} total={total} />
                </li>
              ))}
            </ul>
          )}
        </Seccion>
      </div>

      {esSocio && (
        <Seccion titulo={`Registrar ${textos.singular.toLowerCase()}`} className="mt-6">
          <Formulario accion={registrarMovimiento} boton={`Registrar ${textos.singular.toLowerCase()}`}>
            <input type="hidden" name="tipo" value={tipo} />
            <Campo label="Fecha" name="fecha" type="date" defaultValue={hoyBogota()} required />
            <CampoMonto label="Monto" name="monto" />
            <CampoSelect
              label="Naturaleza"
              name="naturaleza_id"
              opciones={listaNat.filter((n) => n.activa).map((n) => ({ valor: n.id, texto: n.nombre }))}
            />
            <Campo label={textos.tercero} name="tercero" placeholder="Persona o empresa" required />
            <Campo label="Concepto" name="concepto" placeholder={tipo === 'ingreso' ? 'Aporte de capital, venta licencia…' : 'Honorarios octubre, servidor GCP…'} required />
            <Campo label="Medio de pago" name="medio" placeholder="Transferencia, efectivo…" />
            <Campo label="Referencia" name="referencia" />
            <Campo label="Soporte (PDF o imagen)" name="soporte" type="file" accept="application/pdf,image/*" />
          </Formulario>
        </Seccion>
      )}
    </>
  )
}
