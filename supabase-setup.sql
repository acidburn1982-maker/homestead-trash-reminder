-- Run this in your Supabase SQL editor to create the subscribers table

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  phone text,
  channels text[] not null default '{"email"}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Index for fast lookups by active status
create index if not exists subscribers_active_idx on subscribers (active);
