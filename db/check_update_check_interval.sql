-- Check whether the column update_check_interval exists and inspect its properties
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'update_check_interval';

-- Show current values for the first 20 profiles (to inspect NULLs or existing values)
SELECT id, update_check_interval
FROM public.profiles
ORDER BY id
LIMIT 20;

-- If you want to ensure all existing rows have a default value (10) when NULL, run this:
-- This will set update_check_interval = 10 for rows that currently have NULL.
-- Execute only if you want to populate existing rows.
--
-- UPDATE public.profiles
-- SET update_check_interval = 10
-- WHERE update_check_interval IS NULL;

-- Optional: add a CHECK constraint to enforce a sensible range (0..1440 minutes)
-- (Uncomment to apply)
--
-- ALTER TABLE public.profiles
--   ADD CONSTRAINT profiles_update_check_interval_range
--   CHECK (update_check_interval >= 0 AND update_check_interval <= 1440);

-- Notes:
-- - Run these queries in Supabase SQL Editor.
-- - If the column doesn't exist, you can run the migration in db/ensure_update_check_interval.sql,
--   which adds the column with DEFAULT 10.
