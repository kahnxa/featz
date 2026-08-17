alter table public.profiles
  add column if not exists about text;

alter table public.profiles
  add column if not exists photo_paths text[] not null default '{}';

-- carry existing single photos into the new list
update public.profiles
  set photo_paths = array[photo_path]
  where photo_path is not null and photo_paths = '{}';
