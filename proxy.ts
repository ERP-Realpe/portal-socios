import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const RUTAS_PUBLICAS = ['/login', '/auth']

/** Refresca la sesión de Supabase en cada request y manda al login a quien no tenga sesión. */
export async function proxy(request: NextRequest) {
  let respuesta = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (lista) => {
          lista.forEach(({ name, value }) => request.cookies.set(name, value))
          respuesta = NextResponse.next({ request })
          lista.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options))
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  const publica = RUTAS_PUBLICAS.some((r) => request.nextUrl.pathname.startsWith(r))

  if (!user && !publica) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return respuesta
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|img/|favicon.ico).*)'],
}
