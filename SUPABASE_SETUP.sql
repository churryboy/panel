-- ═══════════════════════════════════════════════════════
-- Proby 설문 패널 — Supabase 스키마 & RLS 설정
-- 실행 순서: Supabase SQL Editor에서 전체 복사 후 1회 실행
-- (멱등 설계: 반복 실행해도 안전)
-- ═══════════════════════════════════════════════════════

-- ─── 확장 ───
create extension if not exists "pgcrypto";

-- ═══════════════════════════════════════════════════════
-- 1. panel_listings
-- ═══════════════════════════════════════════════════════
create table if not exists public.panel_listings (
  id               integer     primary key,
  title            text        not null default '',
  description      text        not null default '',
  reward           integer     not null default 0 check (reward >= 0),
  survey_link      text        not null default '',
  deadline         text        not null default '',
  status           text        not null default 'active'
                               check (status in ('active', 'closed', 'draft')),
  category         text        not null default '',
  estimated_time   text        not null default '',
  max_participants integer     not null default 0 check (max_participants >= 0),
  current_participants integer not null default 0 check (current_participants >= 0),
  created_at       timestamptz not null default now()
);

-- 참여 조건 (JSON 문자열 배열: 성별/연령대/기기)
alter table public.panel_listings add column if not exists participant_genders text not null default '[]';
alter table public.panel_listings add column if not exists participant_age_ranges text not null default '[]';
alter table public.panel_listings add column if not exists participant_devices text not null default '[]';

-- 인덱스
create index if not exists idx_listings_status on public.panel_listings(status);

alter table public.panel_listings enable row level security;

-- 읽기: 모든 사람(비로그인 포함) 허용
drop policy if exists "listings: public read" on public.panel_listings;
create policy "listings: public read"
  on public.panel_listings for select
  to anon, authenticated
  using (true);

-- 쓰기: service_role 전용(서버 API에서만 사용)
drop policy if exists "listings: service write" on public.panel_listings;
create policy "listings: service write"
  on public.panel_listings for all
  to service_role
  using (true)
  with check (true);

-- ═══════════════════════════════════════════════════════
-- 2. panel_users
-- ═══════════════════════════════════════════════════════
create table if not exists public.panel_users (
  email               text        primary key,
  name                text        not null default '',
  password            text        not null default '',
  phone               text        not null default '',
  phone_verified      boolean     not null default false,
  email_notice_agreed boolean     not null default false,
  created_at          timestamptz not null default now(),
  bank_name           text        not null default '',
  bank_account        text        not null default '',
  birthdate           text        not null default '',
  gender              text        not null default '',
  job                 text        not null default '',
  updated_at          timestamptz not null default now()
);

-- D10: phone UNIQUE 제약 (이미 있으면 무시)
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'panel_users_phone_unique'
  ) then
    alter table public.panel_users
      add constraint panel_users_phone_unique unique (phone);
  end if;
end $$;

-- 인덱스
create index if not exists idx_users_phone on public.panel_users(phone);

alter table public.panel_users enable row level security;

-- 읽기: service_role 전용 (관리자·서버만 전체 조회 가능)
drop policy if exists "users: service read" on public.panel_users;
create policy "users: service read"
  on public.panel_users for select
  to service_role
  using (true);

-- 쓰기(insert/update/delete): service_role 전용
drop policy if exists "users: service write" on public.panel_users;
create policy "users: service write"
  on public.panel_users for all
  to service_role
  using (true)
  with check (true);

-- ═══════════════════════════════════════════════════════
-- 3. sessions — D9: 서버사이드 세션 revoke 지원
-- ═══════════════════════════════════════════════════════
create table if not exists public.sessions (
  token_hash  text        primary key,
  email       text        not null references public.panel_users(email) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null,
  revoked     boolean     not null default false
);

create index if not exists idx_sessions_email     on public.sessions(email);
create index if not exists idx_sessions_expires_at on public.sessions(expires_at);

alter table public.sessions enable row level security;

-- service_role만 접근
drop policy if exists "sessions: service only" on public.sessions;
create policy "sessions: service only"
  on public.sessions for all
  to service_role
  using (true)
  with check (true);

-- ═══════════════════════════════════════════════════════
-- 4. phone_verifications
-- ═══════════════════════════════════════════════════════
create table if not exists public.phone_verifications (
  id            bigint generated always as identity primary key,
  phone         text        not null,
  code_hash     text        not null,
  status        text        not null default 'pending'
                            check (status in ('pending', 'verified', 'expired', 'failed')),
  attempt_count integer     not null default 0 check (attempt_count >= 0),
  expires_at    timestamptz not null,
  verified_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- D10: 상태/만료 인덱스
create index if not exists idx_pv_phone_status
  on public.phone_verifications(phone, status, expires_at desc);
create index if not exists idx_pv_expires_at
  on public.phone_verifications(expires_at);

alter table public.phone_verifications enable row level security;

-- service_role 전용
drop policy if exists "pv: service only" on public.phone_verifications;
create policy "pv: service only"
  on public.phone_verifications for all
  to service_role
  using (true)
  with check (true);

-- ═══════════════════════════════════════════════════════
-- 5. email_verifications — 이메일 인증코드
-- ═══════════════════════════════════════════════════════
create table if not exists public.email_verifications (
  id            bigint generated always as identity primary key,
  email         text        not null,
  code_hash     text        not null,
  status        text        not null default 'pending'
                            check (status in ('pending', 'verified', 'expired', 'failed')),
  attempt_count integer     not null default 0 check (attempt_count >= 0),
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_ev_email_status
  on public.email_verifications(email, status, expires_at desc);
create index if not exists idx_ev_expires_at
  on public.email_verifications(expires_at);

alter table public.email_verifications enable row level security;

drop policy if exists "ev: service only" on public.email_verifications;
create policy "ev: service only"
  on public.email_verifications for all
  to service_role
  using (true)
  with check (true);

-- panel_users: email_verified 컬럼 추가 (없으면)
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='panel_users' and column_name='email_verified'
  ) then
    alter table public.panel_users add column email_verified boolean not null default false;
  end if;
end $$;

-- ═══════════════════════════════════════════════════════
-- 6. panel_completed (설문 참여 이력 — 서버 저장소)
-- ═══════════════════════════════════════════════════════
create table if not exists public.panel_completed (
  id           bigint      generated always as identity primary key,
  user_email   text        not null,
  listing_id   integer     not null,
  completed_at timestamptz not null default now(),
  reward       integer     not null default 0,
  title        text        not null default '',
  constraint panel_completed_unique unique (user_email, listing_id)
);

create index if not exists idx_completed_email    on public.panel_completed(user_email);
create index if not exists idx_completed_listing  on public.panel_completed(listing_id);

alter table public.panel_completed enable row level security;

-- 읽기: 모든 사람(비로그인 포함) — 관리자 조회용
drop policy if exists "completed: public read" on public.panel_completed;
create policy "completed: public read"
  on public.panel_completed for select
  to anon, authenticated
  using (true);

-- 쓰기(insert/upsert): 누구나 허용 — 유저 본인이 anon key로 기록
drop policy if exists "completed: public insert" on public.panel_completed;
create policy "completed: public insert"
  on public.panel_completed for insert
  to anon, authenticated
  with check (true);

-- ═══════════════════════════════════════════════════════
-- 7. 만료 세션/인증 자동 정리 (선택: pg_cron 있으면 활성화)
-- ═══════════════════════════════════════════════════════
-- select cron.schedule('cleanup-expired', '0 * * * *', $$ 
--   delete from public.sessions where expires_at < now();
--   delete from public.phone_verifications
--     where expires_at < now() - interval '1 day';
--   delete from public.email_verifications
--     where expires_at < now() - interval '1 day';
-- $$);
