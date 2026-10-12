-- Aja Supabasen SQL Editorissa (kerran). Lisää avatar-kentät.
alter table public.fairies add column if not exists avatar_emoji text;
alter table public.fairies add column if not exists avatar_bg text;
alter table public.fairies add column if not exists avatar_path text;
