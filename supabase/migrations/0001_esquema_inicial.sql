-- Portal de inversionistas de Ronavi: aportes por tramos, ingresos por ventas y egresos con soporte.
-- Correr completo en Supabase → SQL Editor (o `supabase db push`).

-- ───────────────────────── Tablas ─────────────────────────

create table public.inversionistas (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  documento       text,
  email           text,
  monto_pactado   numeric(16,2) not null check (monto_pactado > 0),
  porcentaje      numeric(5,2)  not null check (porcentaje > 0 and porcentaje <= 100),
  fecha_acuerdo   date not null default current_date,
  notas           text,
  created_at      timestamptz not null default now()
);

-- Un perfil por usuario de Supabase Auth.
-- socio: acceso total. inversionista: solo lo suyo + lectura de ingresos/egresos.
create table public.perfiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text not null,
  nombre            text,
  rol               text not null default 'inversionista' check (rol in ('socio', 'inversionista')),
  inversionista_id  uuid references public.inversionistas(id) on delete set null,
  -- Los usuarios nacen con la clave inicial y deben cambiarla al primer ingreso.
  debe_cambiar_clave boolean not null default true,
  created_at        timestamptz not null default now()
);

-- Tramos pactados del desembolso (p. ej. 3 tramos de la inversión).
create table public.tramos (
  id                uuid primary key default gen_random_uuid(),
  inversionista_id  uuid not null references public.inversionistas(id) on delete cascade,
  numero            int  not null check (numero > 0),
  monto             numeric(16,2) not null check (monto > 0),
  fecha_esperada    date not null,
  descripcion       text,
  unique (inversionista_id, numero)
);

-- Plata que efectivamente entró del inversionista.
create table public.aportes (
  id                uuid primary key default gen_random_uuid(),
  inversionista_id  uuid not null references public.inversionistas(id) on delete restrict,
  tramo_id          uuid references public.tramos(id) on delete set null,
  fecha             date not null,
  monto             numeric(16,2) not null check (monto > 0),
  medio             text,
  referencia        text,
  soporte_path      text,
  registrado_por    uuid references auth.users(id) default auth.uid(),
  created_at        timestamptz not null default now()
);

-- Lo que Ronavi cobra a sus clientes.
create table public.ingresos_ventas (
  id              uuid primary key default gen_random_uuid(),
  fecha           date not null,
  cliente         text not null,
  concepto        text not null,
  monto           numeric(16,2) not null check (monto > 0),
  referencia      text,
  soporte_path    text,
  registrado_por  uuid references auth.users(id) default auth.uid(),
  created_at      timestamptz not null default now()
);

create table public.categorias_egreso (
  id      uuid primary key default gen_random_uuid(),
  nombre  text not null unique,
  activa  boolean not null default true
);

create table public.egresos (
  id              uuid primary key default gen_random_uuid(),
  fecha           date not null,
  categoria_id    uuid not null references public.categorias_egreso(id),
  beneficiario    text not null,
  concepto        text not null,
  monto           numeric(16,2) not null check (monto > 0),
  medio           text,
  referencia      text,
  soporte_path    text,
  registrado_por  uuid references auth.users(id) default auth.uid(),
  created_at      timestamptz not null default now()
);

create index on public.aportes (inversionista_id, fecha);
create index on public.ingresos_ventas (fecha);
create index on public.egresos (fecha);
create index on public.egresos (categoria_id);

insert into public.categorias_egreso (nombre) values
  ('Salarios y honorarios'),
  ('Planilla / seguridad social'),
  ('Servidor e infraestructura'),
  ('Herramientas y licencias'),
  ('Mercadeo'),
  ('Contador y legal'),
  ('Equipos'),
  ('Otros');

-- ───────────────────────── Perfil automático ─────────────────────────
-- Todo usuario nuevo nace como inversionista sin vínculo (no ve nada propio).
-- El rol socio y el vínculo los asignan los socios o el script de usuarios;
-- nunca se toman de los metadatos del registro, que controla el usuario.

create function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- ───────────────────────── Helpers para RLS ─────────────────────────

create function public.es_socio()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles where id = auth.uid() and rol = 'socio')
$$;

create function public.mi_inversionista()
returns uuid language sql stable security definer set search_path = public as $$
  select inversionista_id from perfiles where id = auth.uid()
$$;

-- El usuario no puede editar su perfil (cambiaría su rol); solo apagar esta marca tras cambiar la clave.
create function public.marcar_clave_cambiada()
returns void language sql security definer set search_path = public as $$
  update perfiles set debe_cambiar_clave = false where id = auth.uid()
$$;

-- ───────────────────────── RLS ─────────────────────────

alter table public.inversionistas     enable row level security;
alter table public.perfiles           enable row level security;
alter table public.tramos             enable row level security;
alter table public.aportes            enable row level security;
alter table public.ingresos_ventas    enable row level security;
alter table public.categorias_egreso  enable row level security;
alter table public.egresos            enable row level security;

-- Socios: todo.
create policy socios_todo on public.inversionistas    for all using (es_socio()) with check (es_socio());
create policy socios_todo on public.perfiles          for all using (es_socio()) with check (es_socio());
create policy socios_todo on public.tramos            for all using (es_socio()) with check (es_socio());
create policy socios_todo on public.aportes           for all using (es_socio()) with check (es_socio());
create policy socios_todo on public.ingresos_ventas   for all using (es_socio()) with check (es_socio());
create policy socios_todo on public.categorias_egreso for all using (es_socio()) with check (es_socio());
create policy socios_todo on public.egresos           for all using (es_socio()) with check (es_socio());

-- Cada usuario lee su perfil.
create policy perfil_propio on public.perfiles for select using (id = auth.uid());

-- Inversionista: solo lo suyo.
create policy inversionista_propio on public.inversionistas for select using (id = mi_inversionista());
create policy inversionista_propio on public.tramos         for select using (inversionista_id = mi_inversionista());
create policy inversionista_propio on public.aportes        for select using (inversionista_id = mi_inversionista());

-- Transparencia: cualquier inversionista vinculado ve ingresos y egresos de Ronavi (solo lectura).
create policy inversionista_lectura on public.ingresos_ventas   for select using (mi_inversionista() is not null);
create policy inversionista_lectura on public.egresos           for select using (mi_inversionista() is not null);
create policy inversionista_lectura on public.categorias_egreso for select using (mi_inversionista() is not null);

-- ───────────────────────── Soportes (Storage) ─────────────────────────

insert into storage.buckets (id, name, public) values ('soportes', 'soportes', false)
on conflict (id) do nothing;

create policy soportes_socios on storage.objects for all
  using (bucket_id = 'soportes' and public.es_socio())
  with check (bucket_id = 'soportes' and public.es_socio());

-- Rutas: egresos/<archivo>, ingresos/<archivo>, aportes/<inversionista_id>/<archivo>.
-- Los inversionistas abren los soportes de ingresos, egresos y de sus propios aportes.
create policy soportes_inversionistas on storage.objects for select
  using (bucket_id = 'soportes' and public.mi_inversionista() is not null
         and ((storage.foldername(name))[1] in ('egresos', 'ingresos')
              or ((storage.foldername(name))[1] = 'aportes'
                  and (storage.foldername(name))[2] = public.mi_inversionista()::text)));
