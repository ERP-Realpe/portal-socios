import { NextResponse, type NextRequest } from 'next/server'
import { crearClienteServidor } from '@/lib/supabase/server'

/** Abre un soporte con un enlace firmado de 5 minutos. Storage valida el acceso con RLS. */
export async function GET(request: NextRequest) {
  const ruta = request.nextUrl.searchParams.get('ruta')
  if (!ruta) return new NextResponse('Falta la ruta', { status: 400 })

  const supabase = await crearClienteServidor()
  const { data, error } = await supabase.storage.from('soportes').createSignedUrl(ruta, 300)
  if (error || !data) return new NextResponse('Soporte no disponible', { status: 404 })
  return NextResponse.redirect(data.signedUrl)
}
