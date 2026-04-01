/*
  # Create Trading Journal Schema

  1. New Tables
    - `trades`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `instrument` (text) - e.g., "BTC/USDT", "AAPL", "XAU/USD"
      - `side` (text) - "Buy" or "Sell"
      - `setup` (text) - e.g., "Bullish Breakout", "Mean Reversion"
      - `timeframe` (text) - e.g., "15M", "1H", "4H"
      - `entry_time` (timestamp)
      - `exit_time` (timestamp)
      - `entry_price` (numeric)
      - `exit_price` (numeric)
      - `quantity` (numeric)
      - `pnl` (numeric) - Profit/Loss in dollars
      - `risk_reward_ratio` (text) - e.g., "1:2.5"
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `journal_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `entry_date` (date)
      - `daily_notes` (text)
      - `mood` (text)
      - `market_conditions` (text)
      - `lessons_learned` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `annotations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `trade_id` (uuid, foreign key to trades)
      - `annotation_text` (text)
      - `tag` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies so users can only see/edit their own data

  3. Indexes
    - Add indexes on user_id and entry_time for faster queries
*/

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instrument text NOT NULL,
  side text NOT NULL CHECK (side IN ('Buy', 'Sell')),
  setup text NOT NULL,
  timeframe text NOT NULL,
  entry_time timestamptz NOT NULL,
  exit_time timestamptz,
  entry_price numeric,
  exit_price numeric,
  quantity numeric,
  pnl numeric,
  risk_reward_ratio text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  daily_notes text,
  mood text,
  market_conditions text,
  lessons_learned text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create annotations table
CREATE TABLE IF NOT EXISTS annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id uuid REFERENCES trades(id) ON DELETE CASCADE,
  annotation_text text NOT NULL,
  tag text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

-- Create policies for trades table
CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON trades FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trades FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for journal_entries table
CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for annotations table
CREATE POLICY "Users can view own annotations"
  ON annotations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own annotations"
  ON annotations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own annotations"
  ON annotations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_entry_time ON trades(entry_time DESC);
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date DESC);
CREATE INDEX idx_annotations_user_id ON annotations(user_id);
CREATE INDEX idx_annotations_trade_id ON annotations(trade_id);
