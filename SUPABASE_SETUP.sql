create table if not exists public.panel_users (
  email text primary key,
  name text not null default '',
  password text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now(),
  bank_name text not null default '',
  bank_account text not null default '',
  birthdate text not null default '',
  gender text not null default '',
  job text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.panel_users enable row level security;

drop policy if exists "public read panel_users" on public.panel_users;
create policy "public read panel_users"
on public.panel_users
for select
to anon, authenticated
using (true);

drop policy if exists "public insert panel_users" on public.panel_users;
create policy "public insert panel_users"
on public.panel_users
for insert
to anon, authenticated
with check (true);

drop policy if exists "public update panel_users" on public.panel_users;
create policy "public update panel_users"
on public.panel_users
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public delete panel_users" on public.panel_users;
create policy "public delete panel_users"
on public.panel_users
for delete
to anon, authenticated
using (true);
