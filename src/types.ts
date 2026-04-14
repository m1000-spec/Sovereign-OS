export interface Trade {
  id: string;
  trade_date: string;
  entry_time: string;
  exit_time: string;
  instrument: string;
  direction: string;
  session: string;
  risk_amount: number;
  pnl_amount: number;
  r_multiple: number;
  notes: string;
  setup: string;
  timeframe: string;
  duration?: number;
  tags?: string;
  rules_followed?: boolean;
  screenshots?: string[];
  created_at: string;
}

export interface TagData {
  id: string;
  label: string;
  color: string;
  bold?: boolean;
}

export interface TagGroup {
  id: string;
  title: string;
  tags: TagData[];
}

export interface TradeFormData {
  id?: string;
  trade_date: string;
  entry_time: string;
  exit_time: string;
  instrument: string;
  direction: string;
  session: string;
  risk_amount: string;
  pnl_amount: string;
  notes: string;
  setup: string;
  timeframe: string;
  duration?: string | number;
  tags?: string;
  rules_followed?: boolean;
  screenshots?: string[];
}

export interface UserSettings {
  id?: string;
  user_id: string;
  account_size: number;
  break_even_range: number;
  equity_curve_visible: boolean;
  drawdown_alerts: boolean;
  favorite_setups: string[];
  favorite_instruments: string[];
  master_strategy: string;
  updated_at?: string;
}
