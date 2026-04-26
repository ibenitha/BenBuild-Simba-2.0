-- ============================================================
-- Simba Supermarket — RLS Fixes (run this in Supabase SQL editor)
-- Fixes infinite recursion in profiles policies
-- ============================================================

-- ── Step 1: Drop ALL existing profiles policies ───────────────
drop policy if exists "Users can view own profile"    on public.profiles;
drop policy if exists "Users can update own profile"  on public.profiles;
drop policy if exists "Admins can view all profiles"  on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;
drop policy if exists "Users can insert own profile"  on public.profiles;

-- ── Step 2: Create a SECURITY DEFINER function to get role ───
-- This bypasses RLS when checking the role, breaking the recursion loop
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'customer'
  );
$$;

-- ── Step 3: Recreate profiles policies using the function ─────

-- Anyone can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Managers and admins can view all profiles (uses function — no recursion)
create policy "Staff can view all profiles"
  on public.profiles for select
  using (public.get_my_role() in ('admin', 'manager'));

-- Users can insert their own profile row
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── Step 4: Fix orders policies (email fallback for old orders) ─
drop policy if exists "Customers can read own orders" on public.orders;
create policy "Customers can read own orders"
  on public.orders for select
  using (
    auth.uid() = user_id
    or customer_email = (select email from auth.users where id = auth.uid())
  );

drop policy if exists "Users can read own order items" on public.order_items;
create policy "Users can read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (
          o.user_id = auth.uid()
          or o.customer_email = (select email from auth.users where id = auth.uid())
        )
    )
  );

-- ── Step 5: Fix stock/flags/reviews policies (use function) ──
drop policy if exists "Staff can update stock"        on public.branch_stock;
drop policy if exists "Staff can insert stock"        on public.branch_stock;
drop policy if exists "Staff can read all orders"     on public.orders;
drop policy if exists "Staff can update orders"       on public.orders;
drop policy if exists "Staff can read all order items" on public.order_items;
drop policy if exists "Staff can read customer flags" on public.customer_flags;
drop policy if exists "Staff can insert customer flags" on public.customer_flags;

create policy "Staff can update stock"
  on public.branch_stock for update
  using (public.get_my_role() in ('staff', 'manager', 'admin'));

create policy "Staff can insert stock"
  on public.branch_stock for insert
  with check (public.get_my_role() in ('staff', 'manager', 'admin'));

create policy "Staff can read all orders"
  on public.orders for select
  using (public.get_my_role() in ('staff', 'manager', 'admin'));

create policy "Staff can update orders"
  on public.orders for update
  using (public.get_my_role() in ('staff', 'manager', 'admin'));

create policy "Staff can read all order items"
  on public.order_items for select
  using (public.get_my_role() in ('staff', 'manager', 'admin'));

create policy "Staff can read customer flags"
  on public.customer_flags for select
  using (public.get_my_role() in ('staff', 'manager', 'admin'));

create policy "Staff can insert customer flags"
  on public.customer_flags for insert
  with check (public.get_my_role() in ('staff', 'manager', 'admin'));

-- ── Step 6: Backfill user_id on old orders ────────────────────
update public.orders o
set user_id = u.id
from auth.users u
where o.customer_email = u.email
  and o.user_id is null;

-- ── Verify ────────────────────────────────────────────────────
-- select public.get_my_role();  -- should return your role
-- select id, full_name, role from public.profiles limit 5;
