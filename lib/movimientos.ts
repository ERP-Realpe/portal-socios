import { hoyBogota } from '@/lib/datos'

export type Tipo = 'ingreso' | 'egreso'

export type Naturaleza = { id: string; tipo: Tipo; nombre: string; activa: boolean; orden: number }

/** Fila de la vista totales_mensuales: suma de una naturaleza en un mes ("AAAA-MM"). */
export type TotalMensual = { naturaleza_id: string; tipo: Tipo; mes: string; total: number; cantidad: number }

export const TEXTO_TIPO = {
  ingreso: { singular: 'Ingreso', plural: 'Ingresos', tercero: 'De quién entró', ruta: '/ingresos' },
  egreso: { singular: 'Egreso', plural: 'Egresos', tercero: 'A quién se le pagó', ruta: '/egresos' },
} as const

const NOMBRE_MES = new Intl.DateTimeFormat('es-CO', { month: 'short', timeZone: 'UTC' })
const NOMBRE_MES_LARGO = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/** Los 12 meses del año como "AAAA-MM" con su nombre corto ("ene."). */
export function mesesDelAnio(anio: number) {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(anio, i, 1))
    return { clave: d.toISOString().slice(0, 7), nombre: NOMBRE_MES.format(d).replace('.', '') }
  })
}

export function nombreMes(clave: string) {
  const [a, m] = clave.split('-').map(Number)
  return NOMBRE_MES_LARGO.format(new Date(Date.UTC(a, m - 1, 1)))
}

/** Año pedido por ?anio=, o el actual. */
export function anioValido(valor?: string) {
  const n = Number(valor)
  return Number.isInteger(n) && n >= 2000 && n <= 2100 ? n : Number(hoyBogota().slice(0, 4))
}

/** Rango [desde, hasta) del mes "AAAA-MM"; por defecto el mes actual. */
export function rangoMes(mes?: string) {
  const clave = mes && /^\d{4}-\d{2}$/.test(mes) ? mes : hoyBogota().slice(0, 7)
  const [a, m] = clave.split('-').map(Number)
  const siguiente = new Date(Date.UTC(a, m, 1)).toISOString().slice(0, 10)
  return { clave, desde: `${clave}-01`, hasta: siguiente }
}

/** Suma los totales que cumplan el filtro. */
export function sumar(totales: TotalMensual[], filtro: (t: TotalMensual) => boolean) {
  return totales.reduce((s, t) => (filtro(t) ? s + Number(t.total) : s), 0)
}

/** Ingresos − egresos de los totales que cumplan el filtro. */
export function neto(totales: TotalMensual[], filtro: (t: TotalMensual) => boolean = () => true) {
  return totales.reduce((s, t) => (filtro(t) ? s + (t.tipo === 'ingreso' ? 1 : -1) * Number(t.total) : s), 0)
}

/** Ordena las naturalezas como las definieron los socios; las inactivas al final. */
export const ordenNaturalezas = (a: Naturaleza, b: Naturaleza) =>
  Number(b.activa) - Number(a.activa) || a.orden - b.orden || a.nombre.localeCompare(b.nombre)
