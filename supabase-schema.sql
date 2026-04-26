-- ============================================================
-- Simba Supermarket — Supabase Schema (v2 with RBAC)
-- Safe to run on an existing database — all changes are idempotent
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── STEP 1: Add missing columns to existing tables ───────────
-- Must happen BEFORE creating RLS policies that reference them

-- profiles: add role, branch_id, avatar_url, phone, updated_at
alter table public.profiles
  add column if not exists role       text not null default 'customer'
    check (role in ('customer', 'staff', 'manager', 'admin')),
  add column if not exists branch_id  text,
  add column if not exists avatar_url text,
  add column if not exists phone      text,
  add column if not exists updated_at timestamptz not null default now();

-- orders: add user_id and delivery fields
alter table public.orders
  add column if not exists user_id           uuid references auth.users(id) on delete set null,
  add column if not exists order_type        text not null default 'pickup',
  add column if not exists delivery_address  text,
  add column if not exists delivery_district text,
  add column if not exists delivery_fee      integer not null default 0,
  add column if not exists total_amount      integer not null default 0;

-- Widen the status check constraint to include dispatched/delivered
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending','accepted','ready','dispatched','delivered','completed'));

-- customer_flags: add flagged_by
alter table public.customer_flags
  add column if not exists flagged_by uuid references auth.users(id) on delete set null;

-- branch_reviews: add user_id
alter table public.branch_reviews
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- ── STEP 2: Create tables that may not exist yet ─────────────

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  email       text not null default '',
  role        text not null default 'customer'
              check (role in ('customer', 'staff', 'manager', 'admin')),
  branch_id   text,
  avatar_url  text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.branch_stock (
  id          uuid primary key default uuid_generate_v4(),
  branch_id   text not null,
  product_id  text not null,
  quantity    integer not null default 25,
  updated_at  timestamptz not null default now(),
  unique(branch_id, product_id)
);

create table if not exists public.orders (
  id                text primary key,
  user_id           uuid references auth.users(id) on delete set null,
  customer_name     text not null,
  customer_email    text not null,
  branch_id         text not null,
  time_slot         text not null,
  deposit           integer not null default 500,
  status            text not null default 'pending'
                    check (status in ('pending','accepted','ready','dispatched','delivered','completed')),
  assigned_to       text,
  order_type        text not null default 'pickup'
                    check (order_type in ('pickup', 'delivery')),
  delivery_address  text,
  delivery_district text,
  delivery_fee      integer not null default 0,
  total_amount      integer not null default 0,
  created_at        timestamptz not null default now()
);

create table if not exists public.order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    text not null references public.orders(id) on delete cascade,
  product_id  text not null,
  name        text not null,
  quantity    integer not null
);

create table if not exists public.branch_reviews (
  id            uuid primary key default uuid_generate_v4(),
  branch_id     text not null,
  user_id       uuid references auth.users(id) on delete set null,
  customer_name text not null,
  rating        integer not null check (rating between 1 and 5),
  comment       text not null default '',
  created_at    timestamptz not null default now()
);

create table if not exists public.customer_flags (
  id             uuid primary key default uuid_generate_v4(),
  customer_email text not null,
  branch_id      text not null,
  order_id       text not null references public.orders(id),
  flag_type      text not null check (flag_type in ('no_show', 'late_pickup', 'rude_behavior', 'other')),
  comment        text not null default '',
  flagged_by     uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now()
);

-- ── STEP 3: Enable RLS on all tables ─────────────────────────

alter table public.profiles       enable row level security;
alter table public.branch_stock   enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.branch_reviews enable row level security;
alter table public.customer_flags enable row level security;

-- ── STEP 4: Drop all old policies then recreate ───────────────

-- profiles
drop policy if exists "Users can view own profile"    on public.profiles;
drop policy if exists "Users can update own profile"  on public.profiles;
drop policy if exists "Admins can view all profiles"  on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'manager')
    )
  );

-- branch_stock
drop policy if exists "Anyone can read stock"         on public.branch_stock;
drop policy if exists "Authenticated can update stock" on public.branch_stock;
drop policy if exists "Authenticated can insert stock" on public.branch_stock;
drop policy if exists "Staff can update stock"        on public.branch_stock;
drop policy if exists "Staff can insert stock"        on public.branch_stock;

create policy "Anyone can read stock"
  on public.branch_stock for select using (true);

create policy "Staff can update stock"
  on public.branch_stock for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('staff', 'manager', 'admin')
    )
  );

create policy "Staff can insert stock"
  on public.branch_stock for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('staff', 'manager', 'admin')
    )
  );

-- orders
drop policy if exists "Anyone can insert orders"         on public.orders;
drop policy if exists "Anyone can read orders"           on public.orders;
drop policy if exists "Authenticated can update orders"  on public.orders;
drop policy if exists "Customers can insert own orders"  on public.orders;
drop policy if exists "Customers can read own orders"    on public.orders;
drop policy if exists "Staff can read all orders"        on public.orders;
drop policy if exists "Staff can update orders"          on public.orders;

create policy "Customers can insert own orders"
  on public.orders for insert
  with check (auth.uid() is not null);

create policy "Customers can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Staff can read all orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('staff', 'manager', 'admin')
    )
  );

create policy "Staff can update orders"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('staff', 'manager', 'admin')
    )
  );

-- order_items
drop policy if exists "Anyone can insert order items"       on public.order_items;
drop policy if exists "Anyone can read order items"         on public.order_items;
drop policy if exists "Authenticated can insert order items" on public.order_items;
drop policy if exists "Users can read own order items"      on public.order_items;
drop policy if exists "Staff can read all order items"      on public.order_items;

create policy "Authenticated can insert order items"
  on public.order_items for insert
  with check (auth.uid() is not null);

create policy "Users can read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "Staff can read all order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('staff', 'manager', 'admin')
    )
  );

-- branch_reviews
drop policy if exists "Anyone can read reviews"          on public.branch_reviews;
drop policy if exists "Anyone can insert reviews"        on public.branch_reviews;
drop policy if exists "Authenticated can insert reviews" on public.branch_reviews;

create policy "Anyone can read reviews"
  on public.branch_reviews for select using (true);

create policy "Authenticated can insert reviews"
  on public.branch_reviews for insert
  with check (auth.uid() is not null);

-- customer_flags
drop policy if exists "Anyone can read customer flags"           on public.customer_flags;
drop policy if exists "Authenticated can insert customer flags"  on public.customer_flags;
drop policy if exists "Authenticated can update customer flags"  on public.customer_flags;
drop policy if exists "Staff can read customer flags"            on public.customer_flags;
drop policy if exists "Staff can insert customer flags"          on public.customer_flags;

create policy "Staff can read customer flags"
  on public.customer_flags for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('staff', 'manager', 'admin')
    )
  );

create policy "Staff can insert customer flags"
  on public.customer_flags for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('staff', 'manager', 'admin')
    )
  );

-- ── STEP 5: Triggers ─────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ── STEP 6: Realtime ─────────────────────────────────────────

do $$
begin
  alter publication supabase_realtime add table public.orders;
exception when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.order_items;
exception when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.branch_stock;
exception when others then null;
end $$;

-- ── STEP 7: Helper function to assign roles ──────────────────
-- Usage: select public.set_user_role('user-uuid', 'manager', 'remera');

create or replace function public.set_user_role(
  target_user_id uuid,
  new_role        text,
  new_branch_id   text default null
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if new_role not in ('customer', 'staff', 'manager', 'admin') then
    raise exception 'Invalid role "%". Must be: customer, staff, manager, or admin', new_role;
  end if;
  update public.profiles
  set role = new_role, branch_id = new_branch_id
  where id = target_user_id;
  if not found then
    raise exception 'No profile found for user %', target_user_id;
  end if;
end;
$$;

-- ── STEP 8: Seed branch stock ────────────────────────────────

insert into public.branch_stock (branch_id, product_id, quantity)
select b.branch_id, p.product_id, 25
from (values
  ('remera'), ('kimironko'), ('kacyiru'), ('nyamirambo'),
  ('gikondo'), ('kanombe'), ('kinyinya'), ('kibagabaga'), ('nyanza')
) as b(branch_id)
cross join (values
  ('p1'),  ('p2'),  ('p3'),  ('p4'),  ('p5'),  ('p6'),  ('p7'),  ('p8'),  ('p9'),  ('p10'),
  ('p11'), ('p12'), ('p13'), ('p14'), ('p15'), ('p16'), ('p17'), ('p18'), ('p19'), ('p20'),
  ('p21'), ('p22'), ('p23'), ('p24'), ('p25'), ('p26'), ('p27'), ('p28'), ('p29'), ('p30'),
  ('p31'), ('p32'), ('p33'), ('p34'), ('p35'), ('p36'), ('p37'), ('p38'), ('p39'), ('p40'),
  ('p41'), ('p42'), ('p43'), ('p44'), ('p45'), ('p46'), ('p47'), ('p48'), ('p49'), ('p50'),
  ('p51'), ('p52'), ('p53'), ('p54'), ('p55'), ('p56'), ('p57'), ('p58'), ('p59'), ('p60'),
  ('p61'), ('p62'), ('p63'), ('p64'), ('p65'), ('p66')
) as p(product_id)
on conflict (branch_id, product_id) do nothing;
