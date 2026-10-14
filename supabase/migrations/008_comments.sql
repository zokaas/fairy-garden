-- Aja Supabasen SQL Editorissa (kerran). Lyhyet kommentit tekemisiin.
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references public.fairies(id) on delete cascade,
  to_id uuid not null references public.fairies(id) on delete cascade,
  target text not null,
  body text not null check (char_length(body) between 1 and 140),
  created_at timestamptz not null default now()
);
alter table public.comments enable row level security;
