-- ====================================================================
-- GATITOS EN LA CAJA - SUPABASE SCHEMA SETUP
-- ====================================================================
-- Copy and execute this script inside your Supabase SQL Editor to
-- initialize the database tables for the game progress & leaderboard!
-- ====================================================================

-- 1. Create the progress tracking table
CREATE TABLE IF NOT EXISTS public.gatitos_progress (
    id UUID PRIMARY KEY,                          -- Generated on client side
    nickname TEXT NOT NULL,                       -- Cute cat name or chosen name
    completed_levels INTEGER[] DEFAULT '{}',      -- Array of solved level IDs
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add an index to speed up sorting for leaderboards
CREATE INDEX IF NOT EXISTS idx_gatitos_progress_updated_at ON public.gatitos_progress (updated_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.gatitos_progress ENABLE ROW LEVEL SECURITY;

-- 4. Create policy to allow anyone to select player records (for the global leaderboard)
CREATE POLICY "Allow public read access to progress" 
ON public.gatitos_progress 
FOR SELECT 
USING (true);

-- 5. Create policy to allow anyone to insert or update their own progress
-- Since the player uses a client-generated UUID saved in localStorage, they can upsert their record.
CREATE POLICY "Allow public insert and update for players" 
ON public.gatitos_progress 
FOR ALL 
USING (true) 
WITH CHECK (true);
