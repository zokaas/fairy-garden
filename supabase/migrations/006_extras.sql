-- Aja Supabasen SQL Editorissa (kerran). Joukkueet, push-ilmoitukset, asetukset.
alter table public.fairies add column if not exists team text;

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

alter table public.settings enable row level security;
alter table public.push_subscriptions enable row level security;
