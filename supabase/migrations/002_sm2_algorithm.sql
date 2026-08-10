-- Switches the review scheduler from a fixed 5-box Leitner system to SM-2
-- (the forgetting-curve algorithm Anki and most vocab apps use).
-- Run this once in the Supabase SQL Editor against an existing database
-- that already has the old `box` column.

alter table public.cards
  add column if not exists ease_factor numeric not null default 2.5,
  add column if not exists interval_days int not null default 0,
  add column if not exists repetitions int not null default 0;

alter table public.cards drop column if exists box;
