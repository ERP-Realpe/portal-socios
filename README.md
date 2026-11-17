# Portal de inversionistas · Ronavi

Next.js 16 + Supabase. Registra los **ingresos** y **egresos** de Ronavi clasificados por **naturaleza** (Aportes de socios, Ventas, Nómina, Infraestructura…) y muestra las métricas por mes, por año y por naturaleza.

- **Socios**: registran y eliminan movimientos, administran naturalezas y crean usuarios.
- **Lectores**: consultan todo, sin registrar.
- Se ingresa con correo y contraseña. Todo usuario nace con la contraseña `Ronavi2026` y el portal le exige cambiarla en el primer ingreso. Solo entran usuarios creados por los socios.

## Puesta en marcha

1. Crear un proyecto en [Supabase](https://supabase.com) (región `us-east-1`, la más cercana a Colombia).
2. **SQL Editor** → correr en orden `supabase/migrations/0001_esquema_inicial.sql` y `0002_naturalezas_movimientos.sql`. Dejan perfiles, naturalezas, movimientos, la vista `totales_mensuales`, las reglas RLS y el bucket privado `soportes`.
3. **Authentication → Sign In / Providers**: desactivar *Allow new users to sign up*.
4. Copiar `.env.example` a `.env` y llenar las llaves (Project Settings → API).
5. Crear los socios:
   ```bash
   npm install
   node --env-file=.env scripts/crear-usuarios.mjs
   ```
   Crea a Juan Rodríguez, Santiago Jiménez, Daniela Navia y Daniel Cerón como **socios**, con la contraseña `Ronavi2026`.
6. `npm run dev` → http://localhost:8090

## Uso

1. **Ingresos / Egresos**: registrar fecha, monto, naturaleza, tercero y concepto; el soporte (PDF o imagen, máx. 10 MB) es opcional. Filtro por mes y naturaleza.
2. **Resumen**: por año — ingresos, egresos, resultado y saldo acumulado; gráfico y detalle mes a mes; matriz naturaleza × mes con total del año, % e histórico (cada celda abre sus movimientos); comparativo año a año.
3. **Naturalezas**: crear, renombrar, activar/desactivar (no se borran).
4. **Usuarios**: crear socios o lectores.

## Estructura

```
app/(portal)/          páginas con sesión (resumen, ingresos, egresos, naturalezas, usuarios) y acciones.ts (server actions)
app/login, app/cambiar-clave, app/auth/salir   ingreso con contraseña, cambio obligatorio de la inicial, salida
app/soporte/           abre un soporte con URL firmada de 5 min
proxy.ts               refresca la sesión y protege las rutas
supabase/migrations/   esquema + RLS + storage
scripts/               creación de usuarios socios
```

Toda la seguridad de datos vive en RLS (`es_socio()`, `tiene_perfil()`): aunque alguien llame a Supabase directamente con la llave anon, no ve nada que no le corresponda. La `SUPABASE_SERVICE_ROLE_KEY` solo se usa en el servidor para crear usuarios.
