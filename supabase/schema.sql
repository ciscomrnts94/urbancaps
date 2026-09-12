-- ============================================================
-- UrbanCaps · Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecuta este script en: Supabase > SQL Editor
-- ============================================================

-- Extensiones
create extension if not exists "pgcrypto";

-- ---------- Configuración de la tienda ----------
create table if not exists store_settings (
  id            int primary key default 1,
  name          text not null default 'UrbanCaps',
  tagline       text,
  logo_url      text,
  banner_url    text,
  whatsapp      text,
  email         text,
  phone         text,
  city          text,
  instagram     text,
  facebook      text,
  tiktok        text,
  currency      text not null default 'COP',
  free_shipping_threshold int not null default 200000,
  flat_shipping_rate int not null default 15000,
  updated_at    timestamptz default now(),
  constraint single_row check (id = 1)
);

-- ---------- Categorías ----------
create table if not exists categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  image_url     text,
  subcategories text[] default '{}',
  position      int default 0,
  created_at    timestamptz default now()
);

-- ---------- Productos ----------
create table if not exists products (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name             text not null,
  sku              text,
  category_id      uuid references categories(id) on delete set null,
  subcategory      text,
  description      text,
  price            int not null,            -- COP, sin decimales
  compare_at_price int,                     -- precio anterior (tachado)
  cost             int,                     -- costo interno
  video_url        text,
  featured         boolean default false,
  is_new           boolean default false,
  active           boolean default true,
  low_stock_threshold int default 5,
  rating           numeric(2,1) default 5.0,
  review_count     int default 0,
  created_at       timestamptz default now()
);

-- ---------- Imágenes de producto ----------
create table if not exists product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references products(id) on delete cascade,
  url         text not null,
  alt         text,
  position    int default 0
);

-- ---------- Variantes (stock por combinación color+talla) ----------
create table if not exists variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references products(id) on delete cascade,
  color       text,
  color_hex   text,
  size        text,
  sku         text,
  price       int,        -- opcional: precio específico de la variante
  stock       int not null default 0,
  unique (product_id, color, size)
);

-- ---------- Clientes ----------
create table if not exists customers (
  id          uuid primary key default gen_random_uuid(),
  auth_id     uuid,       -- referencia a auth.users (si inicia sesión)
  first_name  text,
  last_name   text,
  email       text,
  phone       text,
  whatsapp    text,
  city        text,
  department  text,
  created_at  timestamptz default now()
);

-- ---------- Cupones ----------
create table if not exists coupons (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  type         text not null check (type in ('percent','fixed','free_shipping')),
  value        int not null default 0,
  min_subtotal int,
  active       boolean default true,
  expires_at   timestamptz
);

-- ---------- Pedidos ----------
create table if not exists orders (
  id             text primary key,           -- ej. UC-260912-1234
  customer_id    uuid references customers(id) on delete set null,
  status         text not null default 'pendiente',
  subtotal       int not null,
  discount       int not null default 0,
  shipping       int not null default 0,
  total          int not null,
  coupon_code    text,
  payment_method text,
  shipping_method text,
  -- datos de envío (snapshot)
  first_name     text, last_name text, id_number text,
  phone          text, whatsapp text, email text,
  address        text, address_complement text, neighborhood text,
  city           text, department text, postal_code text, notes text,
  created_at     timestamptz default now()
);

-- ---------- Ítems del pedido ----------
create table if not exists order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    text references orders(id) on delete cascade,
  product_id  uuid,
  variant_id  uuid,
  name        text not null,
  color       text,
  size        text,
  unit_price  int not null,
  quantity    int not null
);

-- ---------- Favoritos ----------
create table if not exists favorites (
  customer_id uuid references customers(id) on delete cascade,
  product_id  uuid references products(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (customer_id, product_id)
);

-- ============================================================
-- Descuento de stock atómico al confirmar un pedido pagado.
-- ============================================================
create or replace function decrement_variant_stock(p_variant_id uuid, p_qty int)
returns void language plpgsql as $$
begin
  update variants
     set stock = greatest(0, stock - p_qty)
   where id = p_variant_id;
end;
$$;

-- ============================================================
-- Índices
-- ============================================================
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_active on products(active);
create index if not exists idx_variants_product on variants(product_id);
create index if not exists idx_orders_customer on orders(customer_id);
create index if not exists idx_order_items_order on order_items(order_id);

-- ============================================================
-- Row Level Security (habilitar y ajustar según necesidades)
--   - Storefront: lectura pública de catálogo.
--   - Escrituras (productos, pedidos, etc.): solo rol de servicio / admin.
-- ============================================================
alter table products        enable row level security;
alter table product_images  enable row level security;
alter table variants        enable row level security;
alter table categories      enable row level security;
alter table store_settings  enable row level security;

create policy "catalogo publico - products"  on products       for select using (active = true);
create policy "catalogo publico - images"    on product_images for select using (true);
create policy "catalogo publico - variants"  on variants       for select using (true);
create policy "catalogo publico - cats"      on categories     for select using (true);
create policy "tienda publica - settings"    on store_settings for select using (true);
