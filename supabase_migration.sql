-- CLEAN FIX: SQL Migration to create user_settings table
-- This script drops the old table to fix the 'uuid = text' type mismatch error.
-- Run this in your Supabase SQL Editor

DROP TABLE IF EXISTS public.user_settings;

CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL DEFAULT (auth.uid())::uuid,
    account_size NUMERIC DEFAULT 100000,
    break_even_range NUMERIC DEFAULT 15,
    equity_curve_visible BOOLEAN DEFAULT TRUE,
    drawdown_alerts BOOLEAN DEFAULT TRUE,
    favorite_setups TEXT[] DEFAULT '{}',
    favorite_instruments TEXT[] DEFAULT '{}',
    master_strategy TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for the 'authenticated' role based on user_id
-- We explicitly cast auth.uid() to uuid to avoid 'uuid = text' mismatch errors
-- EMERGENCY OVERRIDE: Allow ALL operations for the owner
CREATE POLICY "Allow all for owner" ON public.user_settings
    FOR ALL TO authenticated
    USING ((auth.uid())::uuid = user_id)
    WITH CHECK ((auth.uid())::uuid = user_id);

-- Grant permissions
GRANT ALL ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;
