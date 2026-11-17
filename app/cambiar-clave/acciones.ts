'use server'

import { redirect } from 'next/navigation'
import { CLAVE_INICIAL } from '@/lib/clave'
import { crearClienteServidor } from '@/lib/supabase/server'

export type EstadoClave = { error?: string }

export async function cambiarClave(_: EstadoClave, form: FormData): Promise<EstadoClave> {
  const clave = String(form.get('clave') ?? '')
  const confirmacion = String(form.get('confirmacion') ?? '')
  if (clave.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  if (clave === CLAVE_INICIAL) return { error: 'Usa una contraseña distinta a la inicial.' }
  if (clave !== confirmacion) return { error: 'Las contraseñas no coinciden.' }

  const supabase = await crearClienteServidor()
  const { error } = await supabase.auth.updateUser({ password: clave })
  if (error) {
    return { error: error.code === 'weak_password' ? 'La contraseña es muy débil, prueba otra.' : error.message }
  }

  const { error: errorMarca } = await supabase.rpc('marcar_clave_cambiada')
  if (errorMarca) return { error: errorMarca.message }

  redirect('/')
}
