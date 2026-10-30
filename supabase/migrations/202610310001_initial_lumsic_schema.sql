-- LUMSIC initial persistent data schema.
-- Apply in Supabase SQL Editor only after reviewing. Sensitive tables intentionally
-- have no client policies until server-side authorization is migrated.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '', phone text not null default '',
 email text not null default '', country_code text not null default '',
 country text not null default '', currency text not null default 'GBP',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.user_roles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('user','astrologer','admin','super_admin','operations_admin','chat_admin','content_admin','finance_admin')),
 assigned_at timestamptz not null default now()
);
create table if not exists public.readers (
 id text primary key, astro_id text unique, name text not null, email text,
 public_data jsonb not null default '{}'::jsonb, private_data jsonb not null default '{}'::jsonb,
 status text not null default 'offline', is_active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.consultation_sessions (
 id text primary key, customer_id uuid references auth.users(id) on delete set null,
 customer_snapshot jsonb not null default '{}'::jsonb, requested_reader_id text,
 assigned_reader_id text, status text not null default 'waiting'
 check (status in ('waiting','active','completed','cancelled')),
 payment_status text not null default 'free_tier', session_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists consultation_sessions_customer_idx on public.consultation_sessions(customer_id);
create index if not exists consultation_sessions_reader_idx on public.consultation_sessions(assigned_reader_id);
create index if not exists consultation_sessions_status_idx on public.consultation_sessions(status);

create table if not exists public.chat_messages (
 id text primary key, session_id text not null references public.consultation_sessions(id) on delete cascade,
 sender text not null check (sender in ('customer','astrologer','system')),
 sender_id uuid, message_data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create index if not exists chat_messages_session_created_idx on public.chat_messages(session_id, created_at);

create table if not exists public.wallets (
 customer_id uuid primary key references auth.users(id) on delete cascade,
 currency text not null default 'GBP', purchased_balance numeric(12,2) not null default 0 check (purchased_balance >= 0),
 bonus_balance numeric(12,2) not null default 0 check (bonus_balance >= 0),
 wallet_data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now()
);
create table if not exists public.wallet_transactions (
 id text primary key, customer_id uuid references auth.users(id) on delete set null,
 order_id text, amount numeric(12,2) not null, currency text not null default 'GBP',
 type text not null check (type in ('credit','debit')), status text not null default 'Pending',
 transaction_data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create index if not exists wallet_transactions_customer_created_idx on public.wallet_transactions(customer_id, created_at desc);

create table if not exists public.payment_intents (
 id text primary key, customer_id uuid references auth.users(id) on delete cascade,
 amount numeric(12,2) not null check (amount > 0), currency text not null,
 status text not null default 'pending' check (status in ('pending','succeeded','expired','cancelled')),
 provider_reference text, intent_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), expires_at timestamptz
);
create table if not exists public.activity_logs (
 id text primary key, admin_user_id uuid references auth.users(id) on delete set null,
 action text not null, target text, log_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create table if not exists public.app_settings (
 key text primary key, value jsonb not null default '{}'::jsonb,
 updated_by uuid references auth.users(id) on delete set null, updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.readers enable row level security;
alter table public.consultation_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.payment_intents enable row level security;
alter table public.activity_logs enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- All other tables remain default-deny for browser clients. Access them only
-- through server-side functions after per-role authorization is implemented.
