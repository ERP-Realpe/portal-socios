-- El portal pasa a ser de ingresos y egresos clasificados por naturaleza.
-- Se quitan inversionistas, tramos y aportes (los aportes de los socios son una naturaleza de ingreso).
-- Correr completo en Supabase → SQL Editor, después de la 0001. Las tablas que se borran estaban vacías.

-- ───────────────────────── Se retira el esquema anterior ─────────────────────────

drop policy if exists soportes_inversionistas on storage.objects;

drop table if exists public.aportes;
drop table if exists public.tramos;
drop table if exists public.egresos;
drop table if exists public.categorias_egreso;
drop table if exists public.ingresos_ventas;

alter table public.perfiles drop column if exists inversionista_id;
drop table if exists public.inversionistas;
drop function if exists public.mi_inversionista();

-- Roles: socio registra todo; lector solo consulta.
alter table public.perfiles drop constraint if exists perfiles_rol_check;
update public.perfiles set rol = 'lector' where rol <> 'socio';
alter table public.perfiles alter column rol set default 'lector';
alter table public.perfiles add constraint perfiles_rol_check check (rol in ('socio', 'lector'));

-- ───────────────────────── Naturalezas y movimientos ─────────────────────────

create table public.naturalezas (
  id      uuid primary key default gen_random_uuid(),
  tipo    text not null check (tipo in ('ingreso', 'egreso')),
  nombre  text not null,
  activa  boolean not null default true,
  orden   int not null default 0,
  unique (tipo, nombre),
  unique (id, tipo)  -- para que el movimiento no quede con una naturaleza del otro tipo
);

create table public.movimientos (
  id              uuid primary key default gen_random_uuid(),
  tipo            text not null check (tipo in ('ingreso', 'egreso')),
  naturaleza_id   uuid not null,
  fecha           date not null,
  tercero         text not null,  -- de quién entró o a quién se le pagó
  concepto        text not null,
  monto           numeric(16,2) not null check (monto > 0),
  medio           text,
  referencia      text,
  soporte_path    text,
  registrado_por  uuid references auth.users(id) default auth.uid(),
  created_at      timestamptz not null default now(),
  foreign key (naturaleza_id, tipo) references public.naturalezas (id, tipo)
);

create index on public.movimientos (fecha);
create index on public.movimientos (naturaleza_id, fecha);

insert into public.naturalezas (tipo, nombre, orden) values
  ('ingreso', 'Aportes de socios', 1),
  ('ingreso', 'Ventas', 2),
  ('ingreso', 'Préstamos recibidos', 3),
  ('ingreso', 'Otros ingresos', 4),
  ('egreso', 'Nómina y honorarios', 1),
  ('egreso', 'Seguridad social', 2),
  ('egreso', 'Servidor e infraestructura', 3),
  ('egreso', 'Herramientas y licencias', 4),
  ('egreso', 'Mercadeo', 5),
  ('egreso', 'Contador y legal', 6),
  ('egreso', 'Equipos', 7),
  ('egreso', 'Impuestos', 8),
  ('egreso', 'Otros egresos', 9);

-- ───────────────────────── RLS ─────────────────────────

-- Cualquier usuario con perfil (socio o lector) puede consultar.
create function public.tiene_perfil()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles where id = auth.uid())
$$;

alter table public.naturalezas enable row level security;
alter table public.movimientos enable row level security;

create policy socios_todo on public.naturalezas for all using (es_socio()) with check (es_socio());
create policy socios_todo on public.movimientos for all using (es_socio()) with check (es_socio());
create policy lectura on public.naturalezas for select using (tiene_perfil());
create policy lectura on public.movimientos for select using (tiene_perfil());

-- Soportes: rutas ingresos/<archivo> y egresos/<archivo>. Los socios ya tienen soportes_socios (0001).
create policy soportes_lectura on storage.objects for select
  using (bucket_id = 'soportes' and public.tiene_perfil());

-- ───────────────────────── Totales por mes y naturaleza ─────────────────────────
-- El resumen lee sumas ya agrupadas (pocas filas) en vez de todos los movimientos.
-- security_invoker: la vista respeta la RLS de quien consulta.

create view public.totales_mensuales with (security_invoker = true) as
  select naturaleza_id,
         tipo,
         to_char(fecha, 'YYYY-MM') as mes,
         sum(monto)::numeric(16,2) as total,
         count(*)::int as cantidad
  from public.movimientos
  group by naturaleza_id, tipo, to_char(fecha, 'YYYY-MM');
