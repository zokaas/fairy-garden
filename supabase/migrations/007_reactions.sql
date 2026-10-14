-- Aja Supabasen SQL Editorissa (kerran). Reaktiot (👏) tekemisiin.
-- target: 'w:<workout id>' (liikunta/luova) tai 's:<fairy id>:<päivä>' (päivän askeltavoite)
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references public.fairies(id) on delete cascade,
  to_id uuid not null references public.fairies(id) on delete cascade,
  target text not null,
  created_at timestamptz not null default now(),
  unique (from_id, target),
  check (from_id <> to_id)
);
alter table public.reactions enable row level security;
