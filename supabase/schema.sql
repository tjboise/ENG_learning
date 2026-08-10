-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  input_text text not null,
  input_type text,
  meaning_zh text not null,
  meaning_en text,
  usage_notes text,
  examples jsonb not null default '[]'::jsonb,
  source_note text,
  ease_factor numeric not null default 2.5,
  interval_days int not null default 0,
  repetitions int not null default 0,
  next_review_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  review_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists cards_user_next_review_idx
  on public.cards (user_id, next_review_at);

alter table public.cards enable row level security;

drop policy if exists "individual access" on public.cards;
create policy "individual access" on public.cards
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
