import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Campo, CampoSelect, Formulario } from '@/components/formulario'
import { Encabezado, Seccion, Vacio } from '@/components/piezas'
import { exigirSocio, pesos } from '@/lib/datos'
import { ordenNaturalezas, sumar, TEXTO_TIPO, type Naturaleza, type TotalMensual } from '@/lib/movimientos'
import { crearClienteServidor } from '@/lib/supabase/server'
import { cambiarEstadoNaturaleza, crearNaturaleza, renombrarNaturaleza } from '../acciones'

export default async function NaturalezasPage() {
  await exigirSocio()
  const supabase = await crearClienteServidor()
  const [{ data: natData }, { data: totData }] = await Promise.all([
    supabase.from('naturalezas').select('id, tipo, nombre, activa, orden'),
    supabase.from('totales_mensuales').select('naturaleza_id, tipo, mes, total, cantidad'),
  ])
  const naturalezas = ((natData ?? []) as Naturaleza[]).sort(ordenNaturalezas)
  const totales = (totData ?? []) as TotalMensual[]

  return (
    <>
      <Encabezado titulo="Naturalezas" detalle="Cómo se clasifica cada ingreso y egreso. Las que tienen movimientos no se borran: se desactivan." />

      <div className="grid gap-6 xl:grid-cols-2">
        {(['ingreso', 'egreso'] as const).map((tipo) => {
          const lista = naturalezas.filter((n) => n.tipo === tipo)
          return (
            <Seccion key={tipo} titulo={`De ${TEXTO_TIPO[tipo].singular.toLowerCase()}`}>
              {lista.length === 0 ? (
                <Vacio>Sin naturalezas.</Vacio>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="text-right">Movimientos</TableHead>
                      <TableHead className="text-right">Total histórico</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lista.map((n) => {
                      const propios = totales.filter((t) => t.naturaleza_id === n.id)
                      return (
                        <TableRow key={n.id}>
                          <TableCell className="py-2">
                            <Formulario accion={renombrarNaturaleza} boton="Guardar" compacto>
                              <input type="hidden" name="id" value={n.id} />
                              <input
                                name="nombre"
                                defaultValue={n.nombre}
                                required
                                aria-label="Nombre"
                                className="h-8 w-full min-w-40 rounded-md border border-transparent bg-transparent px-2 text-sm hover:border-input focus:border-input focus:outline-none"
                              />
                            </Formulario>
                          </TableCell>
                          <TableCell className="py-2 text-right tabular-nums">{propios.reduce((s, t) => s + t.cantidad, 0)}</TableCell>
                          <TableCell className="py-2 text-right tabular-nums">{pesos(sumar(propios, () => true))}</TableCell>
                          <TableCell className="py-2">
                            <form action={cambiarEstadoNaturaleza} className="flex items-center gap-2">
                              <input type="hidden" name="id" value={n.id} />
                              <input type="hidden" name="activa" value={String(!n.activa)} />
                              <Badge variant={n.activa ? 'success' : 'secondary'}>{n.activa ? 'Activa' : 'Inactiva'}</Badge>
                              <button className="text-xs text-muted-foreground underline hover:text-foreground">
                                {n.activa ? 'Desactivar' : 'Activar'}
                              </button>
                            </form>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </Seccion>
          )
        })}
      </div>

      <Seccion titulo="Nueva naturaleza" className="mt-6">
        <Formulario accion={crearNaturaleza} boton="Crear naturaleza">
          <CampoSelect
            label="Tipo"
            name="tipo"
            opciones={[
              { valor: 'ingreso', texto: 'Ingreso' },
              { valor: 'egreso', texto: 'Egreso' },
            ]}
          />
          <Campo label="Nombre" name="nombre" placeholder="Arriendo, Intereses…" required />
        </Formulario>
      </Seccion>
    </>
  )
}
