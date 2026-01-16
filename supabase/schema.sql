-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Set up Row Level Security (RLS) for profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Handle new user signup with a trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create lists table
create table lists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null default 'My Backlog',
  description text,
  is_public boolean default false,
  share_slug text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for lists
alter table lists enable row level security;

create policy "Users can view own lists."
  on lists for select
  using ( auth.uid() = user_id );

create policy "Public lists are viewable by everyone."
  on lists for select
  using ( is_public = true );

create policy "Users can create lists."
  on lists for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own lists."
  on lists for update
  using ( auth.uid() = user_id );

create policy "Users can delete own lists."
  on lists for delete
  using ( auth.uid() = user_id );

-- Create categories table (enum-like)
create table categories (
  id serial primary key,
  name text not null unique,
  slug text not null unique,
  icon text,
  color text
);

-- Insert default categories
insert into categories (name, slug, icon, color) values
  ('Movies', 'movies', 'Film', 'text-movies'),
  ('TV Shows', 'tv', 'Tv', 'text-tv'),
  ('Books', 'books', 'BookOpen', 'text-books'),
  ('Music', 'music', 'Music', 'text-music');

-- Create genres table
create table genres (
  id serial primary key,
  name text not null,
  category_id int references categories(id),
  unique(name, category_id)
);

-- Create items table
create table items (
  id uuid default uuid_generate_v4() primary key,
  list_id uuid references lists(id) on delete cascade not null,
  category_id int references categories(id) not null,
  external_id text,
  external_source text check (external_source in ('tmdb', 'google_books', 'spotify')),
  title text not null,
  subtitle text,
  image_url text,
  release_year int,
  description text,
  is_completed boolean default false,
  completed_at timestamp with time zone,
  added_at timestamp with time zone default timezone('utc'::text, now()),
  notes text,
  rating int check (rating >= 0 and rating <= 10)
);

-- RLS for items
alter table items enable row level security;

create policy "Users can view items in their lists."
  on items for select
  using ( exists ( select 1 from lists where id = items.list_id and user_id = auth.uid() ) );

create policy "Everyone can view items in public lists."
  on items for select
  using ( exists ( select 1 from lists where id = items.list_id and is_public = true ) );

create policy "Users can insert items into their lists."
  on items for insert
  with check ( exists ( select 1 from lists where id = items.list_id and user_id = auth.uid() ) );

create policy "Users can update items in their lists."
  on items for update
  using ( exists ( select 1 from lists where id = items.list_id and user_id = auth.uid() ) );

create policy "Users can delete items from their lists."
  on items for delete
  using ( exists ( select 1 from lists where id = items.list_id and user_id = auth.uid() ) );

-- Create item_genres junction table
create table item_genres (
  item_id uuid references items(id) on delete cascade,
  genre_id int references genres(id),
  primary key (item_id, genre_id)
);

-- RLS for item_genres
alter table item_genres enable row level security;

create policy "Users can view genres of their items."
  on item_genres for select
  using ( exists ( select 1 from items join lists on items.list_id = lists.id where items.id = item_genres.item_id and lists.user_id = auth.uid() ) );

create policy "Everyone can view genres of public list items."
  on item_genres for select
  using ( exists ( select 1 from items join lists on items.list_id = lists.id where items.id = item_genres.item_id and lists.is_public = true ) );

create policy "Users can manage genres for their items."
  on item_genres for all
  using ( exists ( select 1 from items join lists on items.list_id = lists.id where items.id = item_genres.item_id and lists.user_id = auth.uid() ) );
