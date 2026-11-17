'use server'

import { revalidatePath } from 'next/cache'
import type { EstadoAccion } from '@/components/formulario'
import { CLAVE_INICIAL } from '@/lib/clave'
import { exigirSocio } from '@/lib/datos'
import { crearClienteAdmin, crearClienteServidor } from '@/lib/supabase/server'
import { TEXTO_TIPO, type Tipo } from '@/lib/movimientos'

const texto = (form: FormData, campo: string) => {
  const v = String(form.get(campo) ?? '').trim()
  return v === '' ? null : v
}

const monto = (form: FormData, campo = 'monto') => {
  const n = Number(form.get(campo))
  return Number.isFinite(n) && n > 0 ? n : null
}

const tipo = (form: FormData): Tipo | null => {
  const v = form.get('tipo')
  return v === 'ingreso' || v === 'egreso' ? v : null
}

const TIPOS_SOPORTE = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic']

/** Sube el soporte a Storage y devuelve su ruta. `null` si no adjuntaron archivo. */
async function subirSoporte(form: FormData, carpeta: string): Promise<string | null | { error: string }> {
  const archivo = form.get('soporte')
  if (!(archivo instanceof File) || archivo.size === 0) return null
  if (!TIPOS_SOPORTE.includes(archivo.type)) return { error: 'El soporte debe ser PDF o imagen.' }
  if (archivo.size > 10 * 1024 * 1024) return { error: 'El soporte pesa más de 10 MB.' }

  const extension = archivo.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const ruta = `${carpeta}/${crypto.randomUUID()}.${extension}`
  const supabase = await crearClienteServidor()
  const { error } = await supabase.storage.from('soportes').upload(ruta, archivo, { contentType: archivo.type })
  return error ? { error: `No se pudo subir el soporte: ${error.message}` } : ruta
}

function refrescar(t: Tipo) {
  revalidatePath(TEXTO_TIPO[t].ruta)
  revalidatePath('/')
  revalidatePath('/naturalezas')
}

// ───────────── Movimientos ─────────────

export async function registrarMovimiento(_: EstadoAccion, form: FormData): Promise<EstadoAccion> {
  await exigirSocio()
  const t = tipo(form)
  const valor = monto(form)
  const fecha = texto(form, 'fecha')
  const naturalezaId = texto(form, 'naturaleza_id')
  const tercero = texto(form, 'tercero')
  const concepto = texto(form, 'concepto')
  if (!t) return { error: 'Tipo de movimiento inválido.' }
  if (!valor || !fecha || !naturalezaId || !tercero || !concepto) {
    return { error: 'Fecha, naturaleza, tercero, concepto y monto son obligatorios.' }
  }

  const soporte = await subirSoporte(form, `${t}s`)
  if (soporte && typeof soporte === 'object') return soporte

  const supabase = await crearClienteServidor()
  const { error } = await supabase.from('movimientos').insert({
    tipo: t,
    naturaleza_id: naturalezaId,
    fecha,
    tercero,
    concepto,
    monto: valor,
    medio: texto(form, 'medio'),
    referencia: texto(form, 'referencia'),
    soporte_path: soporte,
  })
  if (error) {
    if (soporte) await supabase.storage.from('soportes').remove([soporte])
    return { error: error.code === '23503' ? 'La naturaleza no corresponde a este tipo de movimiento.' : error.message }
  }
  refrescar(t)
  return { ok: `${TEXTO_TIPO[t].singular} registrado.` }
}

export async function eliminarMovimiento(form: FormData) {
  await exigirSocio()
  const id = texto(form, 'id')
  if (!id) return
  const supabase = await crearClienteServidor()
  const { data } = await supabase.from('movimientos').delete().eq('id', id).select('tipo, soporte_path').single()
  if (!data) return
  if (data.soporte_path) await supabase.storage.from('soportes').remove([data.soporte_path])
  refrescar(data.tipo as Tipo)
}

// ───────────── Naturalezas ─────────────

export async function crearNaturaleza(_: EstadoAccion, form: FormData): Promise<EstadoAccion> {
  await exigirSocio()
  const t = tipo(form)
  const nombre = texto(form, 'nombre')
  if (!t || !nombre) return { error: 'Elige el tipo y escribe el nombre.' }

  const supabase = await crearClienteServidor()
  const { data: ultima } = await supabase
    .from('naturalezas')
    .select('orden')
    .eq('tipo', t)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()
  const { error } = await supabase.from('naturalezas').insert({ tipo: t, nombre, orden: (ultima?.orden ?? 0) + 1 })
  if (error) return { error: error.code === '23505' ? `Ya existe la naturaleza "${nombre}".` : error.message }
  refrescar(t)
  return { ok: `Naturaleza "${nombre}" creada.` }
}

export async function renombrarNaturaleza(_: EstadoAccion, form: FormData): Promise<EstadoAccion> {
  await exigirSocio()
  const id = texto(form, 'id')
  const nombre = texto(form, 'nombre')
  if (!id || !nombre) return { error: 'Escribe el nombre.' }
  const supabase = await crearClienteServidor()
  const { data, error } = await supabase.from('naturalezas').update({ nombre }).eq('id', id).select('tipo').single()
  if (error) return { error: error.code === '23505' ? `Ya existe "${nombre}".` : error.message }
  refrescar(data.tipo as Tipo)
  return { ok: 'Guardado.' }
}

/** Las naturalezas no se borran (tienen movimientos); se desactivan para que no salgan al registrar. */
export async function cambiarEstadoNaturaleza(form: FormData) {
  await exigirSocio()
  const id = texto(form, 'id')
  if (!id) return
  const supabase = await crearClienteServidor()
  const { data } = await supabase
    .from('naturalezas')
    .update({ activa: form.get('activa') === 'true' })
    .eq('id', id)
    .select('tipo')
    .single()
  if (data) refrescar(data.tipo as Tipo)
}

// ───────────── Usuarios ─────────────

/** Crea un usuario con la clave inicial; debe cambiarla al primer ingreso. */
export async function crearUsuario(_: EstadoAccion, form: FormData): Promise<EstadoAccion> {
  await exigirSocio()
  const email = texto(form, 'email')?.toLowerCase()
  const nombre = texto(form, 'nombre')
  const rol = form.get('rol') === 'socio' ? 'socio' : 'lector'
  if (!email || !nombre) return { error: 'Nombre y correo son obligatorios.' }

  const admin = crearClienteAdmin()
  const { data, error } = await admin.auth.admin.createUser({ email, password: CLAVE_INICIAL, email_confirm: true })
  if (error) {
    return { error: error.code === 'email_exists' ? 'Ese correo ya tiene usuario en el portal.' : error.message }
  }

  // El trigger ya creó el perfil como lector; aquí se completa.
  const supabase = await crearClienteServidor()
  const { error: errorPerfil } = await supabase.from('perfiles').update({ nombre, rol }).eq('id', data.user.id)
  if (errorPerfil) return { error: errorPerfil.message }

  revalidatePath('/usuarios')
  return { ok: `Usuario creado: ${email} con la contraseña ${CLAVE_INICIAL}.` }
}
