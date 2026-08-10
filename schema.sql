-- Enable PostGIS extension for geolocation
create extension if not exists postgis;

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  display_name text,
  experience_level text check (experience_level in ('Beginner', 'Intermediate', 'Advanced')),
  total_distance float default 0,
  total_elevation float default 0,
  treks_completed integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Treks Table
create table if not exists public.treks (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  region text,
  description text,
  location geography(POINT, 4326),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Routes Table
create table if not exists public.routes (
  id uuid default gen_random_uuid() primary key,
  trek_id uuid references public.treks(id) on delete cascade,
  submitter_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  gpx_url text not null, -- URL to Supabase Storage
  distance float not null, -- in meters
  elevation_gain float not null, -- in meters
  difficulty_self_rating text check (difficulty_self_rating in ('Easy', 'Medium', 'Hard')),
  difficulty_computed_score float,
  avg_completion_time integer, -- in seconds
  times_followed integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Route Attempts Table
create table if not exists public.route_attempts (
  id uuid default gen_random_uuid() primary key,
  route_id uuid references public.routes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Row Level Security)

-- Profiles
alter table public.profiles enable row level security;
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Treks
alter table public.treks enable row level security;
drop policy if exists "Treks are viewable by everyone." on public.treks;
create policy "Treks are viewable by everyone." on public.treks for select using (true);
drop policy if exists "Authenticated users can insert treks." on public.treks;
create policy "Authenticated users can insert treks." on public.treks for insert to authenticated with check (true);

-- Routes
alter table public.routes enable row level security;
drop policy if exists "Routes are viewable by everyone." on public.routes;
create policy "Routes are viewable by everyone." on public.routes for select using (true);
drop policy if exists "Authenticated users can insert routes." on public.routes;
create policy "Authenticated users can insert routes." on public.routes for insert to authenticated with check (true);

-- Route Attempts
alter table public.route_attempts enable row level security;
drop policy if exists "Users can view their own attempts." on public.route_attempts;
create policy "Users can view their own attempts." on public.route_attempts for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own attempts." on public.route_attempts;
create policy "Users can insert their own attempts." on public.route_attempts for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own attempts." on public.route_attempts;
create policy "Users can update their own attempts." on public.route_attempts for update using (auth.uid() = user_id);

-- Setup Storage Bucket for GPX files
insert into storage.buckets (id, name, public) values ('gpx-routes', 'gpx-routes', true) on conflict do nothing;
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects for select using (bucket_id = 'gpx-routes');
drop policy if exists "Authenticated Users can upload" on storage.objects;
create policy "Authenticated Users can upload" on storage.objects for insert to authenticated with check (bucket_id = 'gpx-routes');

-- 5. Auto-create Profile Trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
