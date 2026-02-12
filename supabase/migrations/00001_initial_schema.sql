-- ============================================
-- Brag Doc Tracker — Initial Schema
-- ============================================

-- 1. profiles — extends Supabase auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamptz default now() not null
);

-- 2. categories — buckets for brag doc entries
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  sort_order int default 0 not null,
  created_at timestamptz default now() not null
);

-- 3. entries — actual accomplishments
create table public.entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  content text not null,
  entry_date date default current_date not null,
  created_at timestamptz default now() not null
);

-- 4. reminder_schedules — email nudge configuration
create table public.reminder_schedules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  email_to text not null,
  days_of_week int[] default '{1,2,3,4,5}' not null,
  times text[] default '{"11:00","15:00"}' not null,
  timezone text default 'America/New_York' not null,
  is_active boolean default true not null,
  last_sent_at timestamptz,
  created_at timestamptz default now() not null
);

-- ============================================
-- Row Level Security
-- ============================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.entries enable row level security;
alter table public.reminder_schedules enable row level security;

-- profiles: users can read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- categories: users can CRUD their own categories
create policy "Users can view own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- entries: users can CRUD their own entries
create policy "Users can view own entries"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own entries"
  on public.entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own entries"
  on public.entries for delete
  using (auth.uid() = user_id);

-- reminder_schedules: users can CRUD their own schedules
create policy "Users can view own reminders"
  on public.reminder_schedules for select
  using (auth.uid() = user_id);

create policy "Users can insert own reminders"
  on public.reminder_schedules for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reminders"
  on public.reminder_schedules for update
  using (auth.uid() = user_id);

create policy "Users can delete own reminders"
  on public.reminder_schedules for delete
  using (auth.uid() = user_id);

-- ============================================
-- Function: seed default categories on new user signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Create profile
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'User'));

  -- Seed default categories
  insert into public.categories (user_id, name, sort_order) values
    (new.id, 'Bugs Fixed', 0),
    (new.id, 'Projects Shipped', 1),
    (new.id, 'Process Improvements', 2),
    (new.id, 'Skills Learned', 3),
    (new.id, 'Other Wins', 4);

  return new;
end;
$$;

-- Trigger on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- Indexes
-- ============================================

create index idx_categories_user_id on public.categories(user_id);
create index idx_entries_user_id on public.entries(user_id);
create index idx_entries_category_id on public.entries(category_id);
create index idx_entries_entry_date on public.entries(entry_date);
create index idx_reminder_schedules_user_id on public.reminder_schedules(user_id);
create index idx_reminder_schedules_active on public.reminder_schedules(is_active) where is_active = true;
