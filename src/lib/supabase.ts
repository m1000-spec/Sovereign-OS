import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Trade = {
  id: string;
  user_id: string;
  instrument: string;
  side: 'Buy' | 'Sell';
  setup: string;
  timeframe: string;
  entry_time: string;
  exit_time: string | null;
  entry_price: number | null;
  exit_price: number | null;
  quantity: number | null;
  pnl: number | null;
  risk_reward_ratio: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  daily_notes: string | null;
  mood: string | null;
  market_conditions: string | null;
  lessons_learned: string | null;
  created_at: string;
  updated_at: string;
};

export type Annotation = {
  id: string;
  user_id: string;
  trade_id: string | null;
  annotation_text: string;
  tag: string | null;
  created_at: string;
};
