create schema if not exists private;

create type public.profile_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  status public.profile_status not null default 'pending',
  is_admin boolean not null default false,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_status_created_idx
  on public.profiles (status, created_at desc);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create or replace function private.is_approved()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.is_admin()
    or exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and status = 'approved'
    );
$$;

create or replace function private.set_profiles_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.protect_profile_sensitive_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_admin() then
    return new;
  end if;

  if new.status is distinct from old.status
    or new.is_admin is distinct from old.is_admin
    or new.reviewed_by is distinct from old.reviewed_by
    or new.reviewed_at is distinct from old.reviewed_at
    or new.email is distinct from old.email
  then
    raise exception 'Alteração não permitida neste perfil.';
  end if;

  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  admin_user boolean := coalesce(new.raw_app_meta_data ->> 'role', '') = 'admin';
begin
  insert into public.profiles (id, email, full_name, status, is_admin)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when admin_user then 'approved'::public.profile_status else 'pending'::public.profile_status end,
    admin_user
  );
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function private.set_profiles_updated_at();

create trigger profiles_protect_sensitive_fields
  before update on public.profiles
  for each row
  execute function private.protect_profile_sensitive_fields();

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function private.handle_new_user();

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id or private.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Admins can update all profiles"
  on public.profiles for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

drop policy if exists "Users can read own search sessions" on public.search_sessions;
drop policy if exists "Users can create own search sessions" on public.search_sessions;
drop policy if exists "Users can update own search sessions" on public.search_sessions;
drop policy if exists "Users can delete own search sessions" on public.search_sessions;
drop policy if exists "Users can read own leads" on public.leads;
drop policy if exists "Users can create own leads" on public.leads;
drop policy if exists "Users can update own leads" on public.leads;
drop policy if exists "Users can delete own leads" on public.leads;

create policy "Approved users can read own search sessions"
  on public.search_sessions for select
  to authenticated
  using ((select auth.uid()) = user_id and private.is_approved());

create policy "Approved users can create own search sessions"
  on public.search_sessions for insert
  to authenticated
  with check ((select auth.uid()) = user_id and private.is_approved());

create policy "Approved users can update own search sessions"
  on public.search_sessions for update
  to authenticated
  using ((select auth.uid()) = user_id and private.is_approved())
  with check ((select auth.uid()) = user_id and private.is_approved());

create policy "Approved users can delete own search sessions"
  on public.search_sessions for delete
  to authenticated
  using ((select auth.uid()) = user_id and private.is_approved());

create policy "Approved users can read own leads"
  on public.leads for select
  to authenticated
  using ((select auth.uid()) = user_id and private.is_approved());

create policy "Approved users can create own leads"
  on public.leads for insert
  to authenticated
  with check ((select auth.uid()) = user_id and private.is_approved());

create policy "Approved users can update own leads"
  on public.leads for update
  to authenticated
  using ((select auth.uid()) = user_id and private.is_approved())
  with check ((select auth.uid()) = user_id and private.is_approved());

create policy "Approved users can delete own leads"
  on public.leads for delete
  to authenticated
  using ((select auth.uid()) = user_id and private.is_approved());

revoke all on function private.is_admin() from public;
revoke all on function private.is_approved() from public;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_approved() to authenticated;

insert into public.profiles (id, email, full_name, status, is_admin)
select
  users.id,
  coalesce(users.email, ''),
  coalesce(users.raw_user_meta_data ->> 'full_name', 'Allan Tomazela'),
  'approved'::public.profile_status,
  true
from auth.users as users
where users.email = 'allantomazela@gmail.com'
on conflict (id) do update
set
  status = 'approved',
  is_admin = true,
  full_name = coalesce(excluded.full_name, public.profiles.full_name);
