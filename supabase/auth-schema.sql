-- ============================================================
-- UrbanCaps · Esquema de autenticación (perfiles, roles, direcciones)
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- Roles de la plataforma
do $$ begin
  create type user_role as enum ('customer', 'store_admin', 'super_admin');
exception when duplicate_object then null; end $$;

-- ---------- Perfiles (1:1 con auth.users) ----------
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  first_name  text,
  last_name   text,
  email       text,
  phone       text,
  whatsapp    text,
  avatar_url  text,
  city        text,
  department  text,
  role        user_role not null default 'customer',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ---------- Direcciones del cliente ----------
create table if not exists addresses (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users(id) on delete cascade,
  label              text default 'Casa',
  first_name         text,
  last_name          text,
  phone              text,
  address            text not null,
  address_complement text,
  neighborhood       text,
  city               text,
  department         text,
  postal_code        text,
  is_default         boolean default false,
  created_at         timestamptz default now()
);

-- ============================================================
-- Trigger: crear perfil automáticamente al registrarse
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- mantener updated_at
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists profiles_touch on profiles;
create trigger profiles_touch before update on profiles
  for each row execute function touch_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles  enable row level security;
alter table addresses enable row level security;

-- Perfiles: cada usuario ve y edita SOLO el suyo.
-- (La columna role NO puede ser cambiada por el propio usuario: se controla
--  con un trigger que impide cambiar el rol salvo desde el rol de servicio.)
drop policy if exists "perfil propio - select" on profiles;
create policy "perfil propio - select" on profiles for select using (auth.uid() = id);
drop policy if exists "perfil propio - update" on profiles;
create policy "perfil propio - update" on profiles for update using (auth.uid() = id);
drop policy if exists "perfil propio - insert" on profiles;
create policy "perfil propio - insert" on profiles for insert with check (auth.uid() = id);

-- Impedir que un usuario escale su propio rol
create or replace function prevent_role_change()
returns trigger language plpgsql security definer as $$
begin
  if new.role <> old.role then
    -- Sólo el rol de servicio (sin auth.uid) puede cambiar el rol
    if auth.uid() is not null then
      new.role := old.role;
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists profiles_lock_role on profiles;
create trigger profiles_lock_role before update on profiles
  for each row execute function prevent_role_change();

-- Direcciones: cada usuario gestiona SOLO las suyas.
drop policy if exists "direcciones propias - all" on addresses;
create policy "direcciones propias - all" on addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Helper para el backend: ¿es admin?
-- ============================================================
create or replace function is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists (select 1 from profiles where id = uid and role in ('store_admin','super_admin'));
$$;
