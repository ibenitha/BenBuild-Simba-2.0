-- ============================================================
-- Simba Supermarket — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES (extends Supabase auth.users) ──────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  email       text not null default '',
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── BRANCH STOCK ─────────────────────────────────────────────
create table if not exists public.branch_stock (
  id          uuid primary key default uuid_generate_v4(),
  branch_id   text not null,
  product_id  text not null,
  quantity    integer not null default 25,
  updated_at  timestamptz not null default now(),
  unique(branch_id, product_id)
);
alter table public.branch_stock enable row level security;
create policy "Anyone can read stock"         on public.branch_stock for select using (true);
create policy "Authenticated can update stock" on public.branch_stock for update using (auth.role() = 'authenticated');
create policy "Authenticated can insert stock" on public.branch_stock for insert with check (auth.role() = 'authenticated');

-- ── ORDERS ───────────────────────────────────────────────────
create table if not exists public.orders (
  id              text primary key,
  customer_name   text not null,
  customer_email  text not null,
  branch_id       text not null,
  time_slot       text not null,
  deposit         integer not null default 500,
  status          text not null default 'pending'
                  check (status in ('pending','accepted','ready','completed')),
  assigned_to     text,
  created_at      timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "Anyone can insert orders"          on public.orders for insert with check (true);
create policy "Anyone can read orders"            on public.orders for select using (true);
create policy "Authenticated can update orders"   on public.orders for update using (auth.role() = 'authenticated');

-- ── ORDER ITEMS ──────────────────────────────────────────────
create table if not exists public.order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    text not null references public.orders(id) on delete cascade,
  product_id  text not null,
  name        text not null,
  quantity    integer not null
);
alter table public.order_items enable row level security;
create policy "Anyone can insert order items"   on public.order_items for insert with check (true);
create policy "Anyone can read order items"     on public.order_items for select using (true);

-- ── BRANCH REVIEWS ───────────────────────────────────────────
create table if not exists public.branch_reviews (
  id              uuid primary key default uuid_generate_v4(),
  branch_id       text not null,
  customer_name   text not null,
  rating          integer not null check (rating between 1 and 5),
  comment         text not null default '',
  created_at      timestamptz not null default now()
);
alter table public.branch_reviews enable row level security;
create policy "Anyone can read reviews"   on public.branch_reviews for select using (true);
create policy "Anyone can insert reviews" on public.branch_reviews for insert with check (true);

-- ── REALTIME ─────────────────────────────────────────────────
-- Enable realtime for orders so branch dashboard updates live
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
