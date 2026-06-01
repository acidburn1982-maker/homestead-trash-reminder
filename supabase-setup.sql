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

-- ──────────────────────────────────────────────────────────────────────────
-- Notification runs — tracks every send attempt for idempotency + watchdog
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists notification_runs (
  id uuid primary key default gen_random_uuid(),
  -- The calendar date the reminder is FOR (the pickup date). NOT the date the
  -- cron fired. This is the key we de-dupe on so 7pm + 7:30pm + 8pm crons
  -- targeting the same pickup don't double-send.
  pickup_date date not null,
  -- "morning" or "evening" — distinguishes the two daily windows so morning
  -- runs and evening runs both get recorded independently.
  reminder_time text not null,
  -- Which subscriber we successfully notified. nullable for "ran but no
  -- subscribers" or watchdog-only summary rows.
  subscriber_id uuid references subscribers(id) on delete set null,
  -- Channel actually used: email | sms | whatsapp | summary
  channel text not null,
  status text not null default 'sent', -- sent | error
  error_message text,
  created_at timestamptz not null default now()
);

create unique index if not exists notification_runs_unique_send
  on notification_runs (pickup_date, reminder_time, subscriber_id, channel)
  where status = 'sent' and subscriber_id is not null;

create index if not exists notification_runs_pickup_idx
  on notification_runs (pickup_date, reminder_time);

create index if not exists notification_runs_created_idx
  on notification_runs (created_at desc);
