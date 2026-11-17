import Image from 'next/image'
import { obtenerPerfil } from '@/lib/datos'
import { FormularioClave } from './formulario'

export default async function CambiarClavePage() {
  const perfil = await obtenerPerfil()

  return (
    <main className="flex min-h-screen items-center justify-center bg-[hsl(var(--brand-tint))] px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <Image src="/img/logo_morado_hd.png" alt="Ronavi" width={140} height={40} className="mb-6 h-auto w-32" priority />
        <h1 className="text-xl font-semibold">Cambia tu contraseña</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {perfil.debe_cambiar_clave
            ? 'Es tu primer ingreso: reemplaza la contraseña inicial por una tuya.'
            : 'Escribe tu nueva contraseña.'}
        </p>
        <FormularioClave />
      </div>
    </main>
  )
}
