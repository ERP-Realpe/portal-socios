import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/** Cliente con la sesión del usuario: todas las consultas pasan por RLS. */
export async function crearClienteServidor() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (lista) => {
          try {
            lista.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Desde un Server Component no se pueden escribir cookies; el proxy refresca la sesión.
          }
        },
      },
    },
  )
}

/** Cliente con service role: salta RLS. Solo para crear usuarios, después de validar que quien llama es socio. */
export function crearClienteAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}
