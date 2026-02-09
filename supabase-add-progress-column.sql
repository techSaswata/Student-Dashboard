-- Run this in Supabase SQL Editor (main project / OG Supabase) to add the progress column to onboarding.
-- Progress stores the curriculum completion percentage (0–100) for each enrollment.

ALTER TABLE public.onboarding
ADD COLUMN IF NOT EXISTS progress numeric DEFAULT 0;

-- Optional: add a check so progress stays between 0 and 100
ALTER TABLE public.onboarding
ADD CONSTRAINT onboarding_progress_range CHECK (progress >= 0 AND progress <= 100);
