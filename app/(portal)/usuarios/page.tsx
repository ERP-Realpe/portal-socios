import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Campo, CampoSelect, Formulario } from '@/components/formulario'
import { Encabezado, Seccion } from '@/components/piezas'
import { CLAVE_INICIAL } from '@/lib/clave'
import { exigirSocio } from '@/lib/datos'
import { crearClienteServidor } from '@/lib/supabase/server'
import { crearUsuario } from '../acciones'

export default async function UsuariosPage() {
  await exigirSocio()
  const supabase = await crearClienteServidor()
  const { data: usuarios } = await supabase
    .from('perfiles')
    .select('id, email, nombre, rol, debe_cambiar_clave')
    .order('rol')
    .order('nombre')

  return (
    <>
      <Encabezado titulo="Usuarios" detalle="Los socios registran movimientos y naturalezas; los lectores solo consultan." />

      <Seccion titulo="Con acceso al portal">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Contraseña</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(usuarios ?? []).map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nombre ?? '—'}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Badge variant={u.rol === 'socio' ? 'default' : 'secondary'} className="capitalize">{u.rol}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{u.debe_cambiar_clave ? 'Aún con la inicial' : 'Cambiada'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Seccion>

      <Seccion titulo="Nuevo usuario" className="mt-6">
        <p className="mb-4 text-sm text-muted-foreground">
          Entra con la contraseña <span className="font-mono">{CLAVE_INICIAL}</span> y el portal le pide cambiarla.
        </p>
        <Formulario accion={crearUsuario} boton="Crear usuario">
          <Campo label="Nombre" name="nombre" required />
          <Campo label="Correo" name="email" type="email" required />
          <CampoSelect
            label="Rol"
            name="rol"
            opciones={[
              { valor: 'lector', texto: 'Lector (solo consulta)' },
              { valor: 'socio', texto: 'Socio (registra)' },
            ]}
          />
        </Formulario>
      </Seccion>
    </>
  )
}
