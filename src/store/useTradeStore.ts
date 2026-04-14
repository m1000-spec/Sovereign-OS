import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Trade } from '../types';

interface TradeStore {
  trades: Trade[];
  loading: boolean;
  error: string | null;
  fetchTrades: () => Promise<void>;
  
  // Computed values
  totalNetProfit: number;
  winRate: number;
  avgRR: number;
  equityCurve: { date: string; value: number; pnl: number }[];
  dailyPnL: Record<string, number>;
  tradesByDay: Record<string, Trade[]>;
  profitBySession: Record<string, number>;
  tradesBySession: Record<string, number>;
  profitByDayOfWeek: Record<string, number>;
  tradesByDayOfWeek: Record<string, number>;
  profitByTimeHeld: { label: string; pnl: number; count: number }[];
  radarData: {
    profit: number[];
    winRate: number[];
    trades: number[];
    avgRR: number[];
  };
  pnlByTime: (bin: "30m" | "1h") => { label: string; pnl: number; winPnL: number; lossPnL: number; tradeCount: number; wins: number }[];
  subscribeToTrades: () => () => void;
}

export const useTradeStore = create<TradeStore>((set, get) => ({
  trades: [],
  loading: false,
  error: null,
  totalNetProfit: 0,
  winRate: 0,
  avgRR: 0,
  equityCurve: [],
  dailyPnL: {},
  tradesByDay: {},
  profitBySession: {},
  tradesBySession: {},
  profitByDayOfWeek: {},
  tradesByDayOfWeek: {},
  profitByTimeHeld: [],
  radarData: {
    profit: [],
    winRate: [],
    trades: [],
    avgRR: []
  },

  fetchTrades: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('trade_date', { ascending: false })
        .order('entry_time', { ascending: false });

      if (error) throw error;

      const trades = data as Trade[];
      
      // Calculate all computed values
      const initialBalance = 100000; // Default or from settings
      let runningPnL = 0;
      
      const dailyPnL: Record<string, number> = {};
      const tradesByDay: Record<string, Trade[]> = {};
      const profitBySession: Record<string, number> = { "London": 0, "New York": 0, "Asia": 0 };
      const tradesBySession: Record<string, number> = { "London": 0, "New York": 0, "Asia": 0 };
      const profitByDayOfWeek: Record<string, number> = { "Sun": 0, "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0 };
      const tradesByDayOfWeek: Record<string, number> = { "Sun": 0, "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0 };
      
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      trades.forEach(trade => {
        const date = trade.trade_date;
        const pnl = trade.pnl_amount || 0;
        
        // Daily grouping
        dailyPnL[date] = (dailyPnL[date] || 0) + pnl;
        if (!tradesByDay[date]) tradesByDay[date] = [];
        tradesByDay[date].push(trade);
        
        // Session grouping
        const session = trade.session;
        if (session in profitBySession) {
          profitBySession[session] += pnl;
          tradesBySession[session]++;
        }
        
        // Day of week grouping
        const dayIndex = new Date(date).getDay();
        const dayName = dayNames[dayIndex];
        profitByDayOfWeek[dayName] += pnl;
        tradesByDayOfWeek[dayName]++;
      });

      // Equity Curve
      const sortedDates = Object.keys(dailyPnL).sort();
      const equityCurve = [
        { date: 'Initial', value: initialBalance, pnl: 0 },
        ...sortedDates.map(date => {
          runningPnL += dailyPnL[date];
          return {
            date: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            value: initialBalance + runningPnL,
            pnl: dailyPnL[date]
          };
        })
      ];

      // Win Rate & Avg RR
      const winningTrades = trades.filter(t => t.pnl_amount > 0);
      const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
      const avgRR = trades.length > 0 ? trades.reduce((acc, t) => acc + (t.r_multiple || 0), 0) / trades.length : 0;
      const totalNetProfit = trades.reduce((acc, t) => acc + (t.pnl_amount || 0), 0);

      // Profit by Time Held (binning logic)
      const timeHeldBins: Record<string, { pnl: number; count: number }> = {};
      trades.forEach(trade => {
        const entry = new Date(`${trade.trade_date}T${trade.entry_time}`);
        const exit = new Date(`${trade.trade_date}T${trade.exit_time}`);
        const durationMs = exit.getTime() - entry.getTime();
        const durationMin = Math.max(1, Math.floor(durationMs / (1000 * 60)));
        
        let bin = "";
        if (durationMin < 30) bin = "< 30m";
        else if (durationMin < 60) bin = "30m - 1h";
        else if (durationMin < 120) bin = "1h - 2h";
        else if (durationMin < 240) bin = "2h - 4h";
        else bin = "> 4h";

        if (!timeHeldBins[bin]) timeHeldBins[bin] = { pnl: 0, count: 0 };
        timeHeldBins[bin].pnl += trade.pnl_amount;
        timeHeldBins[bin].count++;
      });
      
      const profitByTimeHeld = Object.entries(timeHeldBins).map(([label, data]) => ({
        label,
        ...data
      }));

      // Radar Data
      const radarProfitData = [
        Math.max(0, (profitBySession["London"] / (winningTrades.reduce((s, t) => s + t.pnl_amount, 0) || 1)) * 100),
        Math.max(0, (profitBySession["New York"] / (winningTrades.reduce((s, t) => s + t.pnl_amount, 0) || 1)) * 100),
        Math.max(0, (profitBySession["Asia"] / (winningTrades.reduce((s, t) => s + t.pnl_amount, 0) || 1)) * 100)
      ];

      const radarWinRateData = [
        (tradesBySession["London"] > 0 ? (trades.filter(t => t.session === "London" && t.pnl_amount > 0).length / tradesBySession["London"]) * 100 : 0),
        (tradesBySession["New York"] > 0 ? (trades.filter(t => t.session === "New York" && t.pnl_amount > 0).length / tradesBySession["New York"]) * 100 : 0),
        (tradesBySession["Asia"] > 0 ? (trades.filter(t => t.session === "Asia" && t.pnl_amount > 0).length / tradesBySession["Asia"]) * 100 : 0)
      ];

      const radarTradesData = [
        (tradesBySession["London"] / (trades.length || 1)) * 100,
        (tradesBySession["New York"] / (trades.length || 1)) * 100,
        (tradesBySession["Asia"] / (trades.length || 1)) * 100
      ];

      const sessionAvgRR = { "London": { sum: 0, count: 0 }, "New York": { sum: 0, count: 0 }, "Asia": { sum: 0, count: 0 } };
      trades.forEach(trade => {
        const s = trade.session as keyof typeof sessionAvgRR;
        if (sessionAvgRR[s] !== undefined && trade.pnl_amount > 0) {
          sessionAvgRR[s].sum += (trade.r_multiple || 0);
          sessionAvgRR[s].count++;
        }
      });

      const radarAvgRRData = [
        (sessionAvgRR["London"].sum / (sessionAvgRR["London"].count || 1)) * 20,
        (sessionAvgRR["New York"].sum / (sessionAvgRR["New York"].count || 1)) * 20,
        (sessionAvgRR["Asia"].sum / (sessionAvgRR["Asia"].count || 1)) * 20
      ];

      set({ 
        trades, 
        loading: false, 
        totalNetProfit,
        winRate,
        avgRR,
        equityCurve,
        dailyPnL,
        tradesByDay,
        profitBySession,
        tradesBySession,
        profitByDayOfWeek,
        tradesByDayOfWeek,
        profitByTimeHeld,
        radarData: {
          profit: radarProfitData,
          winRate: radarWinRateData,
          trades: radarTradesData,
          avgRR: radarAvgRRData
        }
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  pnlByTime: (bin: "30m" | "1h") => {
    const trades = get().trades;
    const binMinutes = bin === "30m" ? 30 : 60;
    const binsCount = bin === "30m" ? 48 : 24;
    
    return Array.from({ length: binsCount }, (_, i) => {
      const totalMinutes = i * binMinutes;
      const hour = Math.floor(totalMinutes / 60);
      const min = totalMinutes % 60;
      const label = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      
      let pnl = 0;
      let winPnL = 0;
      let lossPnL = 0;
      let tradeCount = 0;
      let wins = 0;
      trades.forEach(t => {
        if (t.entry_time) {
          const [h, m] = t.entry_time.split(':').map(Number);
          const tradeMinutes = h * 60 + m;
          if (Math.floor(tradeMinutes / binMinutes) === i) {
            pnl += t.pnl_amount;
            tradeCount++;
            if (t.pnl_amount > 0) {
              winPnL += t.pnl_amount;
              wins++;
            } else {
              lossPnL += t.pnl_amount;
            }
          }
        }
      });
      return { label, pnl, winPnL, lossPnL, tradeCount, wins };
    });
  },

  subscribeToTrades: () => {
    const channel = supabase
      .channel('trades_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, () => {
        get().fetchTrades();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
,

  // These are computed from state, but for simplicity we calculated them in fetchTrades.
  // We could also use getter functions or separate selectors.
}));
