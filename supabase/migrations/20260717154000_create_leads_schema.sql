create table public.search_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  keyword text not null check (char_length(keyword) between 2 and 80),
  location text not null default '' check (char_length(location) <= 120),
  lead_count integer not null default 0 check (lead_count >= 0),
  next_page_token text,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  search_session_id uuid not null,
  google_place_id text not null,
  name text not null,
  formatted_address text not null default '',
  city text not null default '',
  state text not null default '' check (state = '' or state ~ '^[A-Z]{2}$'),
  phone_number text not null default '',
  website text not null default '',
  instagram text not null default '',
  facebook text not null default '',
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  user_ratings_total integer not null default 0 check (user_ratings_total >= 0),
  latitude double precision,
  longitude double precision,
  is_open boolean not null default false,
  opening_hours text[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint leads_session_owner_fk
    foreign key (search_session_id, user_id)
    references public.search_sessions (id, user_id)
    on delete cascade,
  unique (search_session_id, google_place_id)
);

create index search_sessions_user_created_idx
  on public.search_sessions (user_id, created_at desc);

create index leads_user_created_idx
  on public.leads (user_id, created_at desc);

create index leads_session_idx
  on public.leads (search_session_id);

alter table public.search_sessions enable row level security;
alter table public.leads enable row level security;

create policy "Users can read own search sessions"
  on public.search_sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create own search sessions"
  on public.search_sessions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own search sessions"
  on public.search_sessions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own search sessions"
  on public.search_sessions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can read own leads"
  on public.leads for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create own leads"
  on public.leads for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own leads"
  on public.leads for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own leads"
  on public.leads for delete
  to authenticated
  using ((select auth.uid()) = user_id);
