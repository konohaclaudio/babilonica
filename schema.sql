-- ============================================================
-- Fluency Vitrine — Schema PostgreSQL (Supabase)
-- Execute no SQL Editor do Supabase
-- Versão: 2.0 — Outubro 2026
-- ============================================================
-- NOTA: Warnings de "incorrect syntax" do IDE são falsos
-- positivos. O linter usa T-SQL; este arquivo é PostgreSQL.
-- ============================================================

-- ── EXTENSÕES ────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── TABELA: products ─────────────────────────────────────────
create table if not exists products (
  id          uuid          default gen_random_uuid() primary key,
  created_at  timestamptz   default now() not null,
  name        text          not null,
  description text,
  price       numeric(10,2) not null check (price >= 0),
  category    text,
  image_url   text,
  images      text[]        default '{}',
  active      boolean       default true not null,
  sort_order  int           default 0 not null
);

-- ── TABELA: orders ───────────────────────────────────────────
create table if not exists orders (
  id             uuid          default gen_random_uuid() primary key,
  created_at     timestamptz   default now() not null,
  customer       text          not null,
  phone          text          not null,
  items          jsonb         not null,
  total          numeric(10,2) not null check (total >= 0),
  status         text          default 'novo' not null,
  payment_method text          default 'whatsapp',
  notes          text,
  constraint orders_status_check check (
    status in ('novo', 'confirmado', 'entregue', 'cancelado')
  ),
  constraint orders_payment_check check (
    payment_method in ('whatsapp', 'pix', 'cartao', 'dinheiro')
  )
);

-- ── TABELA: settings ─────────────────────────────────────────
-- Linha única — id sempre = 1. Constraint garante isso.
create table if not exists settings (
  id        int  primary key default 1,
  name      text not null default 'Babilônica',
  tagline   text default 'Joias em Aço Inox · Peças Autorais · Curadoria Ancestral',
  whatsapp  text default '5511956522793',
  city      text default 'Piraju — SP',
  logo_url  text default '',
  currency  text default 'R$',
  instagram text default 'https://www.instagram.com/babilonica7/',
  constraint settings_singleton check (id = 1)
);

insert into settings (id) values (1) on conflict (id) do nothing;

-- ── STORAGE ──────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

-- ── RLS: products ────────────────────────────────────────────
alter table products enable row level security;

drop policy if exists "produtos_publicos"   on products;
drop policy if exists "admin_produtos_all"  on products;

-- Vitrine pública: somente produtos ativos
create policy "produtos_publicos"
  on products for select
  using (active = true);

-- Admin autenticado: acesso total
create policy "admin_produtos_all"
  on products for all
  using (auth.role() = 'authenticated');

-- ── RLS: orders ──────────────────────────────────────────────
alter table orders enable row level security;

drop policy if exists "checkout_publico"  on orders;
drop policy if exists "admin_orders_all"  on orders;

-- Checkout público: qualquer visitante pode criar um pedido
create policy "checkout_publico"
  on orders for insert
  with check (true);

-- Admin autenticado: leitura e gestão completa
create policy "admin_orders_all"
  on orders for all
  using (auth.role() = 'authenticated');

-- ── RLS: settings ────────────────────────────────────────────
alter table settings enable row level security;

drop policy if exists "settings_public_read"  on settings;
drop policy if exists "settings_admin_write"  on settings;

create policy "settings_public_read"
  on settings for select
  using (true);

create policy "settings_admin_write"
  on settings for all
  using (auth.role() = 'authenticated');

-- ── RLS: storage.objects ─────────────────────────────────────
drop policy if exists "leitura_publica"    on storage.objects;
drop policy if exists "upload_autenticado" on storage.objects;
drop policy if exists "update_autenticado" on storage.objects;
drop policy if exists "delete_autenticado" on storage.objects;

create policy "leitura_publica"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "upload_autenticado"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "update_autenticado"
  on storage.objects for update
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "delete_autenticado"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ── ÍNDICES ──────────────────────────────────────────────────
create index if not exists idx_products_active_sort
  on products (active, sort_order);

create index if not exists idx_products_category
  on products (category);

create index if not exists idx_orders_created_at
  on orders (created_at desc);

create index if not exists idx_orders_status
  on orders (status);

-- ============================================================
-- MIGRAÇÃO — execute somente se o banco JÁ EXISTIA (v1 → v2)
-- Banco novo: ignore esta seção (já está no CREATE TABLE acima)
-- ============================================================

-- Múltiplas fotos por produto
alter table products
  add column if not exists images text[] default '{}';

-- Campos novos em orders
alter table orders
  add column if not exists payment_method text default 'whatsapp';
alter table orders
  add column if not exists notes text;

-- Instagram nas configurações
alter table settings
  add column if not exists instagram text
    default 'https://www.instagram.com/babilonica7/';

-- Corrige defaults desatualizados da linha singleton
update settings set
  tagline   = 'Joias em Aço Inox · Peças Autorais · Curadoria Ancestral',
  whatsapp  = '5511956522793',
  city      = 'Piraju — SP',
  instagram = coalesce(nullif(instagram, ''), 'https://www.instagram.com/babilonica7/')
where id = 1;
