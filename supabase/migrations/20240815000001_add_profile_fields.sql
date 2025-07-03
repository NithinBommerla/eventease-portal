
-- Add new profile fields for country, city, and dob
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add new fields to events for countries
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS country TEXT;
