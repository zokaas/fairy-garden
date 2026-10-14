-- AJA TÄMÄ KERRAN Supabasen SQL Editorissa. Turvallinen ajaa uudelleen: lisää vain puuttuvat osat.
-- Kun kysytään RLS:stä, valitse "Run and enable RLS".

create table if not exists public.fairies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  token text not null unique,
  created_at timestamptz not null default now()
);
alter table public.fairies add column if not exists avatar_emoji text;
alter table public.fairies add column if not exists avatar_bg text;
alter table public.fairies add column if not exists avatar_path text;
alter table public.fairies add column if not exists avatar_acc text;
alter table public.fairies add column if not exists pin_hash text;
alter table public.fairies add column if not exists is_admin boolean not null default false;
alter table public.fairies add column if not exists team text;

-- Sama nimi ei kahdesti. Jos nimiä on jo kaksoiskappaleina, indeksi jää luomatta (poista kaksoiskappale ja aja uudelleen).
do $$ begin
  create unique index if not exists fairies_name_lower_key on public.fairies (lower(name));
exception when others then
  raise notice 'Nimi-indeksiä ei luotu (kaksoiskappaleita?): %', sqlerrm;
end $$;

create table if not exists public.steps (
  fairy_id uuid not null references public.fairies(id) on delete cascade,
  day date not null,
  steps integer not null check (steps >= 0 and steps <= 200000),
  updated_at timestamptz not null default now(),
  primary key (fairy_id, day)
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  fairy_id uuid not null references public.fairies(id) on delete cascade,
  day date not null,
  sport text not null,
  minutes integer not null check (minutes > 0 and minutes <= 600),
  created_at timestamptz not null default now()
);

create table if not exists public.cheers (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references public.fairies(id) on delete cascade,
  to_id uuid not null references public.fairies(id) on delete cascade,
  day date not null,
  created_at timestamptz not null default now(),
  unique (from_id, to_id, day),
  check (from_id <> to_id)
);

create table if not exists public.settings (
  key text primary key,
  value text not null
);

create table if not exists public.push_subscriptions (
  endpoint text primary key,
  fairy_id uuid not null references public.fairies(id) on delete cascade,
  p256dh text not null,
  auth text not null
);

alter table public.fairies enable row level security;
alter table public.steps enable row level security;
alter table public.workouts enable row level security;
alter table public.cheers enable row level security;
alter table public.settings enable row level security;
alter table public.push_subscriptions enable row level security;

-- Tee itsestäsi ylläpitäjä (vaihda nimi omaksesi ja poista kommentti):
-- update public.fairies set is_admin = true where lower(name) = lower('NIMESI');
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
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references public.fairies(id) on delete cascade,
  to_id uuid not null references public.fairies(id) on delete cascade,
  target text not null,
  body text not null check (char_length(body) between 1 and 140),
  created_at timestamptz not null default now()
);
alter table public.comments enable row level security;
