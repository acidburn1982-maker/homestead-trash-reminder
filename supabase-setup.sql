-- Run this in your Supabase SQL editor to create the subscribers table

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  phone text,
  channels text[] not null default '{"email"}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  language text not null default 'en',
  reminder_time text not null default 'evening'
);

-- Index for fast lookups by active status
create index if not exists subscribers_active_idx on subscribers (active);

-- If the table already exists, run these to add the new columns:
-- alter table subscribers add column if not exists language text not null default 'en';
-- alter table subscribers add column if not exists reminder_time text not null default 'evening';
