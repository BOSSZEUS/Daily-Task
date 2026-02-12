-- ============================================
-- Migration: Add Lists support
-- ============================================

-- 1. Create lists table
create table public.lists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  sort_order int default 0 not null,
  created_at timestamptz default now() not null
);

-- 2. Add list_id to categories (nullable initially for backfill)
alter table public.categories
  add column list_id uuid references public.lists(id) on delete cascade;

-- 3. Create a default list for every existing user
insert into public.lists (id, user_id, name, sort_order)
select gen_random_uuid(), p.id, 'My Task Tracker', 0
from public.profiles p;

-- 4. Backfill: assign all existing categories to their user's default list
update public.categories c
set list_id = (
  select l.id from public.lists l where l.user_id = c.user_id limit 1
);

-- 5. Make list_id NOT NULL now that all rows are backfilled
alter table public.categories
  alter column list_id set not null;

-- 6. RLS on lists
alter table public.lists enable row level security;

create policy "Users can view own lists"
  on public.lists for select
  using (auth.uid() = user_id);

create policy "Users can insert own lists"
  on public.lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lists"
  on public.lists for update
  using (auth.uid() = user_id);

create policy "Users can delete own lists"
  on public.lists for delete
  using (auth.uid() = user_id);

-- 7. Indexes
create index idx_lists_user_id on public.lists(user_id);
create index idx_categories_list_id on public.categories(list_id);

-- 8. Update handle_new_user to create a default list and assign categories to it
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  default_list_id uuid;
begin
  -- Create profile
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'User'));

  -- Create default list
  insert into public.lists (id, user_id, name, sort_order)
  values (gen_random_uuid(), new.id, 'My Task Tracker', 0)
  returning id into default_list_id;

  -- Seed default categories into that list
  insert into public.categories (user_id, list_id, name, sort_order) values
    (new.id, default_list_id, 'Bugs Fixed', 0),
    (new.id, default_list_id, 'Projects Shipped', 1),
    (new.id, default_list_id, 'Process Improvements', 2),
    (new.id, default_list_id, 'Skills Learned', 3),
    (new.id, default_list_id, 'Other Wins', 4);

  return new;
end;
$$;
