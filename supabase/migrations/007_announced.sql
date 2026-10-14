-- Aja Supabasen SQL Editorissa (kerran). Muistaa, mistä saavutuksista on jo ilmoitettu.
create table if not exists public.announced (
  key text primary key,
  created_at timestamptz not null default now()
);
alter table public.announced enable row level security;
