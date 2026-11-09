-- AUTOCHECK PRO AL: Supabase schema. Run in Supabase > SQL Editor.
create table if not exists admins (user_id uuid primary key references auth.users(id) on delete cascade);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,
  status text not null default 'E re'
    check (status in ('E re','Në pritje','E konfirmuar','E ricaktuar','E përfunduar','E anuluar')),
  data jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists diagnostic_requests (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,
  status text not null default 'E re',
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- RLS: no public policies, so visitors (anon key) can NOT read or write anything.
-- Only the Edge Function (service role, server-side) inserts; only admins read/update.
alter table admins enable row level security;
alter table bookings enable row level security;
alter table diagnostic_requests enable row level security;

create policy "admins read bookings" on bookings for select to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()));
create policy "admins update bookings" on bookings for update to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()));
create policy "admins read diag" on diagnostic_requests for select to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()));
create policy "admins update diag" on diagnostic_requests for update to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()));

-- After creating your owner account in Authentication > Users, run once:
-- insert into admins (user_id) values ('<OWNER-USER-UUID>');
