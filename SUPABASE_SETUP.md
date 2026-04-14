# Supabase Database Setup

To fix the "Row-Level Security (RLS) policy" error and ensure your `trades` table has all the necessary columns, please run the following SQL script in your Supabase **SQL Editor**.

## SQL Script

```sql
-- 1. Create the trades table if it doesn't exist
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_date DATE NOT NULL,
  entry_time TIME NOT NULL,
  exit_time TIME NOT NULL,
  instrument TEXT NOT NULL,
  direction TEXT NOT NULL,
  session TEXT NOT NULL,
  risk_amount DECIMAL NOT NULL,
  pnl_amount DECIMAL NOT NULL,
  r_multiple DECIMAL NOT NULL,
  notes TEXT,
  setup TEXT,
  timeframe TEXT,
  duration INTEGER,
  tags TEXT,
  rules_followed BOOLEAN DEFAULT false,
  screenshots TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add missing columns if the table already exists
-- This ensures that older tables are updated with the new fields
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trades' AND column_name='duration') THEN
        ALTER TABLE trades ADD COLUMN duration INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trades' AND column_name='tags') THEN
        ALTER TABLE trades ADD COLUMN tags TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trades' AND column_name='rules_followed') THEN
        ALTER TABLE trades ADD COLUMN rules_followed BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trades' AND column_name='screenshots') THEN
        ALTER TABLE trades ADD COLUMN screenshots TEXT[];
    END IF;
END $$;

-- 5. Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE DEFAULT 'default_user', -- In a real app, this would be the auth.uid()
  account_size DECIMAL DEFAULT 100000,
  break_even_range DECIMAL DEFAULT 15,
  equity_curve_visible BOOLEAN DEFAULT true,
  drawdown_alerts BOOLEAN DEFAULT true,
  favorite_setups TEXT[] DEFAULT ARRAY['ICT Silver Bullet', '2022 Model', 'MSS + FVG'],
  favorite_instruments TEXT[] DEFAULT ARRAY['NQ', 'ES'],
  htf_bias_instruction TEXT DEFAULT 'Focus on 15m Internal Trend Line (ITL) for directional bias.',
  execution_logic_instruction TEXT DEFAULT 'Look for 1m Inversion Fair Value Gaps (IFVG) for entries.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous select settings" ON user_settings;
CREATE POLICY "Allow anonymous select settings" ON user_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert settings" ON user_settings;
CREATE POLICY "Allow anonymous insert settings" ON user_settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update settings" ON user_settings;
CREATE POLICY "Allow anonymous update settings" ON user_settings FOR UPDATE USING (true);

-- 6. Create policies for anonymous access
-- Since the app currently uses a mock login system, we allow all actions for the 'anon' role.
-- In a production app with real user accounts, you would use 'auth.uid()' checks.

DROP POLICY IF EXISTS "Allow anonymous select" ON trades;
CREATE POLICY "Allow anonymous select" ON trades FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert" ON trades;
CREATE POLICY "Allow anonymous insert" ON trades FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update" ON trades;
CREATE POLICY "Allow anonymous update" ON trades FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anonymous delete" ON trades;
CREATE POLICY "Allow anonymous delete" ON trades FOR DELETE USING (true);
```

## How to apply this:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Click on **SQL Editor** in the left sidebar.
4. Click **New query**.
5. Paste the code above and click **Run**.
