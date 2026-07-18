create index profiles_reviewed_by_idx
  on public.profiles (reviewed_by);

drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

create policy "Users or admins can update profiles"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id or private.is_admin())
  with check ((select auth.uid()) = id or private.is_admin());
