alter function public.set_updated_at() set search_path = public;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop policy "athletes insert own profile" on public.profiles;
create policy "athletes insert own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy "athletes update own profile" on public.profiles;
create policy "athletes update own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy "athletes insert own events" on public.events;
create policy "athletes insert own events"
on public.events for insert
to authenticated
with check ((select auth.uid()) = athlete_id);

drop policy "athletes update own events" on public.events;
create policy "athletes update own events"
on public.events for update
to authenticated
using ((select auth.uid()) = athlete_id)
with check ((select auth.uid()) = athlete_id);

drop policy "athletes delete own events" on public.events;
create policy "athletes delete own events"
on public.events for delete
to authenticated
using ((select auth.uid()) = athlete_id);
