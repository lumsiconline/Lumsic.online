-- Server-side persistence for server.ts (chats, sessions, customers, wallets, readers, settings).
-- server.ts reads/writes the single row id = 'primary' using the Supabase service-role key.
-- Row level security is ON with NO policies, so browsers (anon/authenticated keys) can never
-- read or write this table; only the server's service-role key can.

create table if not exists public.app_state (
  id text primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;
