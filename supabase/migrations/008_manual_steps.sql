-- Aja Supabasen SQL Editorissa (kerran). Merkitsee käsin kirjatut askeleet (näkyy ✏️-merkkinä).
alter table public.steps add column if not exists manual boolean not null default false;
