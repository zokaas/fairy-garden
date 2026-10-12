-- Aja Supabasen SQL Editorissa (kerran). Ylläpitäjä-lippu.
alter table public.fairies add column if not exists is_admin boolean not null default false;

-- Tee itsestäsi ylläpitäjä (vaihda nimi omaksesi):
-- update public.fairies set is_admin = true where lower(name) = lower('NIMESI');
