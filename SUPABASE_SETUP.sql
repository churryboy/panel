create table if not exists public.panel_listings (
  id integer primary key,
  title text not null default '',
  description text not null default '',
  reward integer not null default 0,
  survey_link text not null default '',
  deadline text not null default '',
  status text not null default 'active',
  category text not null default '',
  estimated_time text not null default '',
  max_participants integer not null default 0,
  current_participants integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.panel_listings enable row level security;

drop policy if exists "public read panel_listings" on public.panel_listings;
create policy "public read panel_listings"
on public.panel_listings for select to anon, authenticated using (true);

drop policy if exists "public insert panel_listings" on public.panel_listings;
create policy "public insert panel_listings"
on public.panel_listings for insert to anon, authenticated with check (true);

drop policy if exists "public update panel_listings" on public.panel_listings;
create policy "public update panel_listings"
on public.panel_listings for update to anon, authenticated using (true) with check (true);

drop policy if exists "public delete panel_listings" on public.panel_listings;
create policy "public delete panel_listings"
on public.panel_listings for delete to anon, authenticated using (true);

create table if not exists public.panel_users (
  email text primary key,
  name text not null default '',
  password text not null default '',
  phone text not null default '',
  phone_verified boolean not null default false,
  email_notice_agreed boolean not null default false,
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

create table if not exists public.phone_verifications (
  id bigint generated always as identity primary key,
  phone text not null,
  code_hash text not null,
  status text not null default 'pending',
  attempt_count integer not null default 0,
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_phone_verifications_phone_created_at
  on public.phone_verifications(phone, created_at desc);

alter table public.phone_verifications enable row level security;

drop policy if exists "public read phone_verifications" on public.phone_verifications;
create policy "public read phone_verifications"
on public.phone_verifications
for select
to anon, authenticated
using (true);

drop policy if exists "public insert phone_verifications" on public.phone_verifications;
create policy "public insert phone_verifications"
on public.phone_verifications
for insert
to anon, authenticated
with check (true);

drop policy if exists "public update phone_verifications" on public.phone_verifications;
create policy "public update phone_verifications"
on public.phone_verifications
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public delete phone_verifications" on public.phone_verifications;
create policy "public delete phone_verifications"
on public.phone_verifications
for delete
to anon, authenticated
using (true);
