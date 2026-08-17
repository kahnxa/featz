alter table public.events
  add column if not exists event_url text;

alter table public.events
  add column if not exists link_clicks integer not null default 0;

create or replace function public.track_link_click(event_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.events
    set link_clicks = link_clicks + 1
    where id = event_id;
$$;

grant execute on function public.track_link_click(uuid) to anon, authenticated;
