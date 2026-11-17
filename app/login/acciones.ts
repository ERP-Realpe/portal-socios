'use server'

import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/server'

export type EstadoLogin = { error?: string }

export async function ingresar(_: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  const email = String(form.get('email') ?? '').trim().toLowerCase()
  const clave = String(form.get('clave') ?? '')
  if (!email || !clave) return { error: 'Escribe tu correo y tu contraseña.' }

  const supabase = await crearClienteServidor()
  const { error } = await supabase.auth.signInWithPassword({ email, password: clave })
  if (error) return { error: 'Correo o contraseña incorrectos.' }

  // Si aún tiene la clave inicial, el layout del portal lo manda a cambiarla.
  redirect('/')
}
