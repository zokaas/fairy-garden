-- Aja Supabasen SQL Editorissa (kerran). Kimalle-tervehdykset.
create table if not exists public.cheers (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references public.fairies(id) on delete cascade,
  to_id uuid not null references public.fairies(id) on delete cascade,
  day date not null,
  created_at timestamptz not null default now(),
  unique (from_id, to_id, day),
  check (from_id <> to_id)
);
alter table public.cheers enable row level security;
