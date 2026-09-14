create table if not exists public.movies (
  id bigint generated always as identity primary key,
  title text not null,
  language text not null,
  created_at timestamptz default now(),
  unique(title, language)
);

create table if not exists public.districts (
  id bigint generated always as identity primary key,
  name text not null unique
);

create table if not exists public.centres (
  id bigint generated always as identity primary key,
  district_id bigint not null references public.districts(id) on delete cascade,
  name text not null,
  unique(district_id,name)
);

create table if not exists public.theatres (
  id bigint generated always as identity primary key,
  centre_id bigint not null references public.centres(id) on delete cascade,
  name text not null,
  unique(centre_id,name)
);

create table if not exists public.screens (
  id bigint generated always as identity primary key,
  theatre_id bigint not null references public.theatres(id) on delete cascade,
  name text not null,
  total_seats integer,
  unique(theatre_id,name)
);

create table if not exists public.shows (
  id bigint generated always as identity primary key,
  movie_id bigint not null references public.movies(id) on delete cascade,
  screen_id bigint not null references public.screens(id) on delete cascade,
  show_date date not null,
  show_time timestamptz not null,
  ticket_price numeric,
  source text not null,
  source_show_id text,
  created_at timestamptz default now(),
  unique(movie_id,screen_id,show_time)
);

create table if not exists public.seat_snapshots (
  id bigint generated always as identity primary key,
  show_id bigint not null references public.shows(id) on delete cascade,
  snapshot_at timestamptz default now(),
  total_seats integer,
  available_seats integer,
  occupied_seats integer,
  occupancy_percent numeric,
  estimated_tickets integer,
  estimated_gross numeric,
  source text not null,
  source_status text
);

create index if not exists seat_snapshots_show_time_idx on public.seat_snapshots(show_id,snapshot_at desc);

create or replace view public.snapshot_view as
select ss.id, ss.snapshot_at, ss.total_seats, ss.available_seats, ss.occupied_seats,
       ss.occupancy_percent, ss.estimated_tickets, ss.estimated_gross, ss.source, ss.source_status,
       sh.show_time, sh.ticket_price, m.title as movie, m.language,
       d.name as district, c.name as centre, t.name as theatre, sc.name as screen
from public.seat_snapshots ss
join public.shows sh on sh.id=ss.show_id
join public.movies m on m.id=sh.movie_id
join public.screens sc on sc.id=sh.screen_id
join public.theatres t on t.id=sc.theatre_id
join public.centres c on c.id=t.centre_id
join public.districts d on d.id=c.district_id;

alter table public.movies enable row level security;
alter table public.districts enable row level security;
alter table public.centres enable row level security;
alter table public.theatres enable row level security;
alter table public.screens enable row level security;
alter table public.shows enable row level security;
alter table public.seat_snapshots enable row level security;

grant select on public.movies, public.districts, public.centres, public.theatres, public.screens, public.shows, public.seat_snapshots, public.snapshot_view to anon, authenticated;

drop policy if exists movies_read on public.movies;
create policy movies_read on public.movies for select to anon, authenticated using (true);
drop policy if exists districts_read on public.districts;
create policy districts_read on public.districts for select to anon, authenticated using (true);
drop policy if exists centres_read on public.centres;
create policy centres_read on public.centres for select to anon, authenticated using (true);
drop policy if exists theatres_read on public.theatres;
create policy theatres_read on public.theatres for select to anon, authenticated using (true);
drop policy if exists screens_read on public.screens;
create policy screens_read on public.screens for select to anon, authenticated using (true);
drop policy if exists shows_read on public.shows;
create policy shows_read on public.shows for select to anon, authenticated using (true);
drop policy if exists snapshots_read on public.seat_snapshots;
create policy snapshots_read on public.seat_snapshots for select to anon, authenticated using (true);
