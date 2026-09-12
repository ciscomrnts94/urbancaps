-- ============================================================
-- UrbanCaps · Migración a plataforma de producción (idempotente)
-- Ejecutar en: Supabase > SQL Editor
-- NO borra datos existentes. Añade tablas/columnas/funciones que faltan.
-- Incluye también el esquema de autenticación (profiles/addresses).
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- 1) AUTENTICACIÓN: perfiles, direcciones, roles
-- ============================================================
do $$ begin
  create type user_role as enum ('customer', 'store_admin', 'super_admin');
exception when duplicate_object then null; end $$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text, last_name text, email text, phone text, whatsapp text,
  avatar_url text, city text, department text,
  role user_role not null default 'customer',
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  label text default 'Casa', first_name text, last_name text, phone text,
  address text not null, address_complement text, neighborhood text,
  city text, department text, postal_code text,
  is_default boolean default false, created_at timestamptz default now()
);

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone, avatar_url)
  values (new.id, new.email,
    new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create or replace function prevent_role_change()
returns trigger language plpgsql security definer as $$
begin
  if new.role <> old.role and auth.uid() is not null then new.role := old.role; end if;
  return new;
end; $$;
drop trigger if exists profiles_lock_role on profiles;
create trigger profiles_lock_role before update on profiles
  for each row execute function prevent_role_change();

alter table profiles enable row level security;
alter table addresses enable row level security;
do $$ begin
  create policy "perfil propio - select" on profiles for select using (auth.uid() = id);
  create policy "perfil propio - update" on profiles for update using (auth.uid() = id);
  create policy "perfil propio - insert" on profiles for insert with check (auth.uid() = id);
  create policy "direcciones propias" on addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

create or replace function is_admin(uid uuid)
returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where id = uid and role in ('store_admin','super_admin'));
$$;

-- ============================================================
-- 2) PEDIDOS: historial de estados + tracking
-- ============================================================
alter table orders add column if not exists tracking_carrier text;
alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists paid_at timestamptz;

create table if not exists order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id text references orders(id) on delete cascade,
  status text not null,
  note text,
  created_by uuid,
  created_at timestamptz default now()
);
create index if not exists idx_osh_order on order_status_history(order_id);

-- ============================================================
-- 3) INVENTARIO: movimientos e historial
-- ============================================================
create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid references variants(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  delta int not null,               -- +25, -2, etc.
  qty_before int, qty_after int,
  reason text,                      -- 'venta', 'ajuste manual', 'reposición'…
  order_id text,
  created_by uuid, created_at timestamptz default now()
);
create index if not exists idx_invmov_variant on inventory_movements(variant_id);

-- ============================================================
-- 4) PROMOCIONES (%, fijo, por categoría/producto, programadas)
-- ============================================================
create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('percent','fixed')),
  value int not null,
  scope text not null default 'all' check (scope in ('all','category','product')),
  category_slug text,
  product_id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- 5) CUPONES (ampliar el existente con fechas/usos/alcance)
-- ============================================================
alter table coupons add column if not exists starts_at timestamptz;
alter table coupons add column if not exists ends_at timestamptz;
alter table coupons add column if not exists max_uses int;
alter table coupons add column if not exists max_uses_per_user int;
alter table coupons add column if not exists used_count int default 0;
alter table coupons add column if not exists category_slug text;
alter table coupons add column if not exists product_id uuid;

-- ============================================================
-- 6) BANNERS / HERO editable
-- ============================================================
create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'hero' check (kind in ('hero','sale','strip')),
  title text, subtitle text, badge text,
  image_url text, cta_label text, cta_link text,
  position int default 0, active boolean default true,
  starts_at timestamptz, ends_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- 7) RESEÑAS (compra verificada)
-- ============================================================
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text, rating int not null check (rating between 1 and 5),
  comment text, image_url text,
  verified boolean default false, approved boolean default true,
  created_at timestamptz default now()
);
create index if not exists idx_reviews_product on reviews(product_id);

-- ============================================================
-- 8) NOTIFICACIONES
-- ============================================================
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text, title text not null, body text, link text,
  read boolean default false, created_at timestamptz default now()
);
create index if not exists idx_notif_user on notifications(user_id);

-- ============================================================
-- 9) AUDITORÍA
-- ============================================================
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid, actor_name text,
  action text not null, entity text, entity_id text,
  before jsonb, after jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- 10) STORE SETTINGS (columnas extra para personalización)
-- ============================================================
alter table store_settings add column if not exists favicon_url text;
alter table store_settings add column if not exists secondary_color text;
alter table store_settings add column if not exists policy_privacy text;
alter table store_settings add column if not exists policy_terms text;
alter table store_settings add column if not exists policy_returns text;

-- ============================================================
-- 11) RPC: crear pedido con validación y descuento de stock (atómico)
-- ============================================================
create or replace function place_order(
  p_order_id text, p_customer_id uuid, p_items jsonb,
  p_subtotal int, p_discount int, p_shipping int, p_total int,
  p_coupon text, p_payment text, p_shipping_method text, p_contact jsonb
) returns text language plpgsql security definer as $$
declare
  it jsonb; v_stock int; v_variant uuid; v_qty int; v_before int;
begin
  -- Validar stock de cada ítem
  for it in select * from jsonb_array_elements(p_items) loop
    v_variant := (it->>'variant_id')::uuid;
    v_qty := (it->>'quantity')::int;
    select stock into v_stock from variants where id = v_variant for update;
    if v_stock is null then raise exception 'VARIANTE_NO_EXISTE'; end if;
    if v_stock < v_qty then raise exception 'STOCK_INSUFICIENTE'; end if;
  end loop;

  -- Crear pedido
  insert into orders (id, customer_id, status, subtotal, discount, shipping, total,
    coupon_code, payment_method, shipping_method,
    first_name, last_name, id_number, phone, whatsapp, email,
    address, address_complement, neighborhood, city, department, postal_code, notes)
  values (p_order_id, p_customer_id, 'pendiente', p_subtotal, p_discount, p_shipping, p_total,
    p_coupon, p_payment, p_shipping_method,
    p_contact->>'firstName', p_contact->>'lastName', p_contact->>'idNumber',
    p_contact->>'phone', p_contact->>'whatsapp', p_contact->>'email',
    p_contact->>'address', p_contact->>'addressComplement', p_contact->>'neighborhood',
    p_contact->>'city', p_contact->>'department', p_contact->>'postalCode', p_contact->>'notes');

  -- Ítems + descuento de stock + movimiento de inventario
  for it in select * from jsonb_array_elements(p_items) loop
    v_variant := (it->>'variant_id')::uuid;
    v_qty := (it->>'quantity')::int;
    insert into order_items (order_id, product_id, variant_id, name, color, size, unit_price, quantity)
    values (p_order_id, (it->>'product_id')::uuid, v_variant, it->>'name',
      it->>'color', it->>'size', (it->>'unit_price')::int, v_qty);

    select stock into v_before from variants where id = v_variant;
    update variants set stock = greatest(0, stock - v_qty) where id = v_variant;
    insert into inventory_movements (variant_id, product_id, delta, qty_before, qty_after, reason, order_id)
    values (v_variant, (it->>'product_id')::uuid, -v_qty, v_before, v_before - v_qty, 'venta', p_order_id);
  end loop;

  -- Historial de estado inicial
  insert into order_status_history (order_id, status, note) values (p_order_id, 'pendiente', 'Pedido creado');
  return p_order_id;
end; $$;

-- ============================================================
-- 12) RPC: ajuste manual de inventario con registro
-- ============================================================
create or replace function adjust_inventory(p_variant_id uuid, p_new_qty int, p_reason text, p_actor uuid)
returns void language plpgsql security definer as $$
declare v_before int; v_product uuid;
begin
  select stock, product_id into v_before, v_product from variants where id = p_variant_id;
  update variants set stock = greatest(0, p_new_qty) where id = p_variant_id;
  insert into inventory_movements (variant_id, product_id, delta, qty_before, qty_after, reason, created_by)
  values (p_variant_id, v_product, p_new_qty - v_before, v_before, p_new_qty, coalesce(p_reason,'ajuste manual'), p_actor);
end; $$;

-- ============================================================
-- 13) RLS de lectura pública para catálogo extendido
-- ============================================================
alter table promotions enable row level security;
alter table banners enable row level security;
alter table reviews enable row level security;
alter table notifications enable row level security;
do $$ begin
  create policy "promos publicas" on promotions for select using (active = true);
  create policy "banners publicos" on banners for select using (active = true);
  create policy "reviews publicas" on reviews for select using (approved = true);
  create policy "notif propias" on notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Pedidos: el cliente ve SOLO los suyos; los admin ven todo. Escritura por servicio.
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_history enable row level security;
do $$ begin
  create policy "pedidos propios o admin" on orders for select
    using (auth.uid() = customer_id or is_admin(auth.uid()));
  create policy "items de mis pedidos o admin" on order_items for select
    using (exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_admin(auth.uid()))));
  create policy "historial de mis pedidos o admin" on order_status_history for select
    using (exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_admin(auth.uid()))));
exception when duplicate_object then null; end $$;
