-- Aja Supabasen SQL Editorissa (kerran). Salasana ja yksilöllinen nimi.
-- HUOM: jos sinulla on jo kaksoiskappaleita samalla nimellä, poista ne ensin (ks. ohje), muuten indeksin luonti epäonnistuu.
alter table public.fairies add column if not exists pin_hash text;
create unique index if not exists fairies_name_lower_key on public.fairies (lower(name));
