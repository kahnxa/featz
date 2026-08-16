-- featz core schema: public athlete resumes
create extension if not exists pgcrypto;

create type public.sport as enum ('running', 'cycling', 'triathlon');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  slug text not null unique,
  first_name text not null default '',
  last_name text not null default '',
  age integer,
  weight_kg numeric,
  height_cm numeric,
  sport public.sport,
  photo_path text,
  instagram_url text,
  youtube_url text,
  tiktok_url text,
  strava_url text,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  event_date date not null,
  position text,
  result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_athlete_date_idx on public.events (athlete_id, event_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, slug)
  values (new.id, 'user-' || substr(replace(new.id::text, '-', ''), 1, 12));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.events enable row level security;

create policy "profiles are publicly readable"
on public.profiles for select
using (true);

create policy "athletes insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "athletes update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "events are publicly readable"
on public.events for select
using (true);

create policy "athletes insert own events"
on public.events for insert
to authenticated
with check (auth.uid() = athlete_id);

create policy "athletes update own events"
on public.events for update
to authenticated
using (auth.uid() = athlete_id)
with check (auth.uid() = athlete_id);

create policy "athletes delete own events"
on public.events for delete
to authenticated
using (auth.uid() = athlete_id);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar images are publicly readable"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "athletes upload own avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "athletes update own avatars"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "athletes delete own avatars"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
