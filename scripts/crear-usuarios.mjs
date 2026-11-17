// Crea (o actualiza) los usuarios socios del portal.
// Uso: node --env-file=.env scripts/crear-usuarios.mjs
// Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY, y las migraciones 0001 y 0002 aplicadas.
// Nacen con la contraseña inicial (igual a lib/clave.ts) y deben cambiarla al primer ingreso.
// A los usuarios que ya existen no se les toca la contraseña.
import { createClient } from '@supabase/supabase-js'

const CLAVE_INICIAL = 'Ronavi2026'

const SOCIOS = [
  { email: 'juan.rodriguez@ronaviapp.com', nombre: 'Juan Rodríguez' },
  { email: 'santiago.jimenez@ronaviapp.com', nombre: 'Santiago Jiménez' },
  { email: 'daniela.navia@ronaviapp.com', nombre: 'Daniela Navia' },
  { email: 'daniel.ceron@ronaviapp.com', nombre: 'Daniel Cerón' },
]

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const llave = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !llave) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env')
  process.exit(1)
}

const supabase = createClient(url, llave, { auth: { persistSession: false } })

const { data: lista, error: errorLista } = await supabase.auth.admin.listUsers({ perPage: 1000 })
if (errorLista) throw errorLista

for (const socio of SOCIOS) {
  let usuario = lista.users.find((u) => u.email?.toLowerCase() === socio.email)
  if (!usuario) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: socio.email,
      password: CLAVE_INICIAL,
      email_confirm: true,
      user_metadata: { nombre: socio.nombre },
    })
    if (error) {
      console.error(`✗ ${socio.email}: ${error.message}`)
      continue
    }
    usuario = data.user
  }

  // El trigger crea el perfil como lector; aquí se promueve a socio.
  const { error } = await supabase
    .from('perfiles')
    .upsert({ id: usuario.id, email: socio.email, nombre: socio.nombre, rol: 'socio' })
  console.log(error ? `✗ ${socio.email}: ${error.message}` : `✓ ${socio.email} (socio)`)
}
