import { redirect } from 'next/navigation'
import { cache } from 'react'
import { crearClienteServidor } from '@/lib/supabase/server'

export type Perfil = {
  id: string
  email: string
  nombre: string | null
  rol: 'socio' | 'lector'
  debe_cambiar_clave: boolean
}

/** Perfil del usuario en sesión (una consulta por request). Sin sesión → login. */
export const obtenerPerfil = cache(async (): Promise<Perfil> => {
  const supabase = await crearClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('perfiles')
    .select('id, email, nombre, rol, debe_cambiar_clave')
    .eq('id', user.id)
    .single()
  if (!data) redirect('/login')
  return data as Perfil
})

/** Para las páginas del portal: con la clave inicial no se pasa de la pantalla de cambio. */
export async function exigirClaveCambiada() {
  const perfil = await obtenerPerfil()
  if (perfil.debe_cambiar_clave) redirect('/cambiar-clave')
  return perfil
}

/** Para páginas y acciones solo de socios. */
export async function exigirSocio() {
  const perfil = await exigirClaveCambiada()
  if (perfil.rol !== 'socio') redirect('/')
  return perfil
}

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export const pesos = (valor: number | string | null | undefined) => formatoCOP.format(Number(valor ?? 0))

/** Las columnas `date` llegan como "2026-10-27"; se muestran sin conversión de zona horaria. */
export function fecha(valor: string | null | undefined) {
  if (!valor) return '-'
  const [a, m, d] = valor.slice(0, 10).split('-')
  return `${d}/${m}/${a}`
}

export const suma = (filas: { monto: number | string }[]) =>
  filas.reduce((total, f) => total + Number(f.monto), 0)

export function hoyBogota() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())
}
