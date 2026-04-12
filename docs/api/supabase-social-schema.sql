-- StructSure Supabase social schema
-- Run in Supabase SQL Editor with a project owner role.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  tags text[] not null default '{}',
  severity integer check (severity between 1 and 10),
  resolution_status text not null default 'unresolved' check (resolution_status in ('resolved', 'unresolved')),
  building_id text,
  building_name text,
  building_address text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_images (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists post_images_post_id_idx on public.post_images(post_id, sort_order);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments(post_id, created_at);

create table if not exists public.upvotes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists upvotes_user_id_idx on public.upvotes(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      split_part(new.email, '@', 1),
      'user_' || left(new.id::text, 8)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_images enable row level security;
alter table public.comments enable row level security;
alter table public.upvotes enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
for select using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "posts_select_all" on public.posts;
create policy "posts_select_all" on public.posts
for select using (true);

drop policy if exists "posts_insert_authenticated" on public.posts;
create policy "posts_insert_authenticated" on public.posts
for insert with check (auth.uid() = author_id);

drop policy if exists "posts_update_owner" on public.posts;
create policy "posts_update_owner" on public.posts
for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "posts_delete_owner" on public.posts;
create policy "posts_delete_owner" on public.posts
for delete using (auth.uid() = author_id);

drop policy if exists "post_images_select_all" on public.post_images;
create policy "post_images_select_all" on public.post_images
for select using (true);

drop policy if exists "post_images_insert_post_owner" on public.post_images;
create policy "post_images_insert_post_owner" on public.post_images
for insert with check (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id and posts.author_id = auth.uid()
  )
);

drop policy if exists "post_images_delete_post_owner" on public.post_images;
create policy "post_images_delete_post_owner" on public.post_images
for delete using (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id and posts.author_id = auth.uid()
  )
);

drop policy if exists "comments_select_all" on public.comments;
create policy "comments_select_all" on public.comments
for select using (true);

drop policy if exists "comments_insert_authenticated" on public.comments;
create policy "comments_insert_authenticated" on public.comments
for insert with check (auth.uid() = author_id);

drop policy if exists "comments_delete_owner" on public.comments;
create policy "comments_delete_owner" on public.comments
for delete using (auth.uid() = author_id);

drop policy if exists "upvotes_select_all" on public.upvotes;
create policy "upvotes_select_all" on public.upvotes
for select using (true);

drop policy if exists "upvotes_insert_self" on public.upvotes;
create policy "upvotes_insert_self" on public.upvotes
for insert with check (auth.uid() = user_id);

drop policy if exists "upvotes_delete_self" on public.upvotes;
create policy "upvotes_delete_self" on public.upvotes
for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "post_images_storage_select_all" on storage.objects;
create policy "post_images_storage_select_all" on storage.objects
for select using (bucket_id = 'post-images');

drop policy if exists "post_images_storage_insert_self" on storage.objects;
create policy "post_images_storage_insert_self" on storage.objects
for insert with check (bucket_id = 'post-images' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "post_images_storage_delete_self" on storage.objects;
create policy "post_images_storage_delete_self" on storage.objects
for delete using (bucket_id = 'post-images' and auth.uid()::text = (storage.foldername(name))[1]);
