-- Ensure the profiles table has an integer column to store per-user update check interval (minutes).
-- Run this in Supabase SQL Editor or via psql as a privileged user.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS update_check_interval integer DEFAULT 10;

-- Optional: If you want to ensure non-negative values and a reasonable max, you can add a CHECK:
-- ALTER TABLE public.profiles
--   ADD CONSTRAINT profiles_update_check_interval_range CHECK (update_check_interval >= 0 AND update_check_interval <= 1440);

-- Note: If your `profiles` table lives in a different schema or uses a different name for the table, adjust the statement accordingly.
