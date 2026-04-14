import React, { useState, useEffect, ReactNode, useRef } from "react";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BarChart3, 
  FileText, 
  Settings, 
  Search, 
  Moon, 
  Sun, 
  TrendingUp,
  Plus,
  ClipboardList,
  BookOpen,
  Tag,
  Bell,
  LogOut,
  Loader2,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import MonthlyCalendar from "./MonthlyCalendar";
import { TradeModal } from "./TradeModal";
import { Header } from "./Header";
import { supabase } from "../lib/supabase";
import { Trade } from "../types";
import { Tooltip } from "./Tooltip";
import { useTradeStore } from "../store/useTradeStore";
import { AIInsightsPanel } from "./AIInsightsPanel";

interface DashboardProps {
  onNavigate: (view: "dashboard" | "trades" | "analytics" | "reports" | "settings" | "daily-journal" | "annotations") => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  openTradeModal: () => void;
  onEditTrade: (trade: Trade) => void;
  onLogout: () => void;
  accountSize: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Dashboard({ 
  onNavigate, 
  isDark, 
  setIsDark, 
  openTradeModal, 
  onEditTrade, 
  onLogout, 
  accountSize,
  isCollapsed,
  setIsCollapsed,
  searchQuery,
  setSearchQuery
}: DashboardProps) {
  const { trades, loading, totalNetProfit, winRate, avgRR, subscribeToTrades } = useTradeStore();

  const filteredTrades = trades.filter(trade => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      trade.instrument.toLowerCase().includes(query) ||
      trade.trade_date.toLowerCase().includes(query) ||
      trade.setup.toLowerCase().includes(query) ||
      trade.direction.toLowerCase().includes(query) ||
      trade.session.toLowerCase().includes(query) ||
      (trade.tags && trade.tags.toLowerCase().includes(query)) ||
      (trade.notes && trade.notes.toLowerCase().includes(query))
    );
  });

  useEffect(() => {
    const unsubscribe = subscribeToTrades();
    return () => unsubscribe();
  }, [subscribeToTrades]);

  const handleEditTrade = (trade: Trade) => {
    onEditTrade(trade);
  };

  const handleDeleteTrade = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this trade?")) {
      try {
        const { error } = await supabase
          .from('trades')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting trade:', error);
        alert('Failed to delete trade.');
      }
    }
  };

  const winRateFormatted = winRate.toFixed(1);
  const totalPnL = totalNetProfit;
  const avgRRFormatted = avgRR.toFixed(1);

  const lastWeekTrades = filteredTrades.filter(trade => {
    const tradeDate = new Date(trade.trade_date);
    tradeDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    return tradeDate >= lastWeek;
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="pt-20 px-4 md:px-6 pb-32 md:pb-16 space-y-4 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-auto">
          <AIInsightsPanel 
            id="dashboard"
            isDark={isDark}
            data={trades.slice(0, 10).map(t => ({
              setup: t.setup,
              session: t.session,
              pnl: t.pnl_amount,
              result: t.pnl_amount > 0 ? 'Win' : t.pnl_amount < 0 ? 'Loss' : 'BE'
            }))}
            prompt="You are a trading coach. Analyze these trades and tell me: my strongest session, my weakest setup, my current win rate trend, and one thing I should focus on this week. Be concise and direct."
          />
        </div>
        <div className="flex justify-end gap-2 w-full md:w-auto">
          <div className={cn("px-3 py-1.5 border rounded-lg flex items-center gap-2", isDark ? "bg-[#0A0A0A] border-white/10" : "bg-neutral-100 border-neutral-200")}>
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
            <span className={cn("text-[9px] font-bold uppercase tracking-widest opacity-60", isDark ? "text-white" : "text-black")}>Live Market</span>
          </div>
          <div className={cn("px-3 py-1.5 border rounded-lg flex items-center", isDark ? "bg-[#0A0A0A] border-white/10" : "bg-neutral-100 border-neutral-200")}>
            <span className={cn("text-[9px] font-bold uppercase tracking-widest opacity-60", isDark ? "text-white" : "text-black")}>{currentDate}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column: Profit Card */}
        <div className="md:col-span-8">
          <ProfitCard isDark={isDark} totalPnL={totalPnL} loading={loading} />
        </div>

        {/* Right Column: Win Rate + Session Status */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <WinRateCard isDark={isDark} winRate={winRateFormatted} totalTrades={trades.length} avgRR={avgRRFormatted} loading={loading} />
          <SessionStatusCard isDark={isDark} />
        </div>

        {/* Bottom: Recent Activity Table */}
        <div className="md:col-span-12">
          <RecentActivityCard 
            isDark={isDark} 
            trades={lastWeekTrades.slice(0, 5)} 
            loading={loading} 
            onNavigate={onNavigate} 
            onEdit={handleEditTrade}
            onDelete={handleDeleteTrade}
            accountSize={accountSize}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className={cn("font-body text-xs uppercase tracking-widest w-full py-12 border-t mt-auto transition-colors duration-300", isDark ? "bg-black border-white/10" : "bg-neutral-50 border-neutral-200")}>
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className={cn("font-black text-lg tracking-tighter", isDark ? "text-white" : "text-black")}>Sovereign Analyst</span>
            <p className={cn("text-[10px]", isDark ? "text-white/40" : "text-neutral-500")}>© 2024 Sovereign Analyst. Editorial Precision for the Modern Trader.</p>
          </div>
          <div className="flex gap-8">
            <FooterLink label="Privacy" isDark={isDark} />
            <FooterLink label="Terms" isDark={isDark} />
            <FooterLink label="Support" isDark={isDark} />
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProfitCard({ isDark, totalPnL, loading }: { isDark: boolean, totalPnL: number, loading: boolean }) {
  const [hoverPos, setHoverPos] = useState<{ x: number, y: number } | null>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!chartAreaRef.current) return;
    const rect = chartAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Ensure x and y are within bounds
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setHoverPos({ x, y });
    } else {
      setHoverPos(null);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "p-8 standard-card relative overflow-hidden flex flex-col h-[530px] group border transition-all duration-300", 
        isDark ? "bg-[#0A0A0A] border-white/10" : "bg-white border-neutral-200 shadow-sm"
      )}
    >
      <div className="flex justify-between items-start relative z-10">
        <div>
          <span className={cn("text-[9px] font-bold uppercase tracking-[0.2em] opacity-40", isDark ? "text-white" : "text-black")}>Total Net Profit</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className={cn("text-4xl font-black tracking-tighter", isDark ? "text-white" : "text-black")}>
              {loading ? "---" : `$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </h2>
            <span className={cn("font-bold text-[13px]", "text-accent-green")}>+12.4%</span>
          </div>
        </div>
        <div className="flex gap-1">
          {['1D', '1W', '1M', 'ALL'].map((tf) => (
            <motion.button 
              key={tf} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all",
                tf === 'ALL' 
                  ? "bg-accent-green text-black" 
                  : (isDark ? "bg-white/5 text-white/40 hover:text-white" : "bg-neutral-100 text-black/40 hover:text-black")
              )}
            >
              {tf}
            </motion.button>
          ))}
        </div>
      </div>
      
      <div 
        ref={chartAreaRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverPos(null)}
        className="mt-auto h-64 w-full relative cursor-crosshair"
      >
        {/* Crosshair */}
        {hoverPos && (
          <div 
            className="absolute top-0 bottom-0 w-px bg-accent-green/30 pointer-events-none z-20"
            style={{ left: hoverPos.x }}
          />
        )}

        {/* Liquid Glass Tooltip */}
        {hoverPos && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "absolute z-30 pointer-events-none px-5 py-4 rounded-2xl backdrop-blur-2xl border flex flex-col gap-1 shadow-2xl transition-all duration-200",
              isDark ? "bg-black/60 border-white/10" : "bg-white/70 border-black/5"
            )}
            style={{ 
              left: Math.min(Math.max(hoverPos.x - 80, 10), (chartAreaRef.current?.clientWidth || 0) - 170), 
              top: hoverPos.y > 128 ? hoverPos.y - 130 : hoverPos.y + 20
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", isDark ? "bg-accent-green" : "bg-green-500")} />
              <span className={cn("text-[10px] uppercase font-black tracking-[0.2em] opacity-50", isDark ? "text-white" : "text-black")}>Net Profit</span>
            </div>
            <span className={cn("text-xl font-black tracking-tighter", isDark ? "text-white" : "text-black")}>$142,890.42</span>
            <div className={cn("h-px w-full my-1", isDark ? "bg-white/10" : "bg-black/5")} />
            <span className={cn("text-[9px] opacity-50 font-bold uppercase tracking-widest", isDark ? "text-white" : "text-black")}>Oct 24, 2024</span>
          </motion.div>
        )}

        <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FF41" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00FF41" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path 
            d="M 0 250 Q 250 240, 500 245 T 1000 180 V 300 H 0 Z" 
            fill="url(#profitGradient)" 
          />
          <path 
            d="M 0 250 Q 250 240, 500 245 T 1000 180" 
            fill="none" 
            stroke="#00FF41" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
        </svg>
      </div>
    </motion.div>
  );
}

function WinRateCard({ isDark, winRate, totalTrades, avgRR, loading }: { isDark: boolean, winRate: string, totalTrades: number, avgRR: string, loading: boolean }) {
  const winRateNum = parseFloat(winRate);
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "p-6 standard-card flex flex-col items-center text-center gap-4 h-[384px] border transition-all duration-300", 
        isDark ? "bg-[#0A0A0A] border-white/10" : "bg-white border-neutral-200 shadow-sm"
      )}
    >
      <span className={cn("text-[10px] font-bold uppercase tracking-[0.3em] opacity-40", isDark ? "text-white" : "text-black")}>Win rate</span>
      <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle className={cn("fill-transparent stroke-[6]", isDark ? "stroke-white/5" : "stroke-neutral-100")} cx="50" cy="50" r="44"></circle>
          <circle 
            className={cn("fill-transparent stroke-[6] transition-all duration-1000", isDark ? "stroke-accent-green" : "stroke-black")} 
            cx="50" cy="50" r="44" 
            strokeDasharray="276.46" 
            strokeDashoffset={276.46 * (1 - (loading ? 0 : winRateNum / 100))}
            strokeLinecap="round"
          ></circle>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-black tracking-tighter", isDark ? "text-white" : "text-black")}>
            {loading ? "---" : `${winRate}%`}
          </span>
          <span className={cn("text-[8px] uppercase font-bold tracking-[0.3em] text-accent-green mt-1")}>Optimized</span>
        </div>
      </div>
      <div className={cn("grid grid-cols-2 w-full gap-3 pt-3 border-t mt-auto", isDark ? "border-white/10" : "border-neutral-100")}>
        <div className="min-w-0">
          <p className={cn("text-[7px] uppercase tracking-[0.2em] mb-0.5 font-bold opacity-40 truncate", isDark ? "text-white" : "text-black")}>Total Trades</p>
          <p className={cn("text-[13px] font-bold truncate", isDark ? "text-white" : "text-black")}>{loading ? "---" : totalTrades}</p>
        </div>
        <div className="min-w-0">
          <p className={cn("text-[7px] uppercase tracking-[0.2em] mb-0.5 font-bold opacity-40 truncate", isDark ? "text-white" : "text-black")}>Avg R:R</p>
          <p className={cn("text-[13px] font-bold truncate", isDark ? "text-white" : "text-black")}>{loading ? "---" : `${avgRR} R`}</p>
        </div>
      </div>
    </motion.div>
  );
}

function SessionStatusCard({ isDark }: { isDark: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "p-4 standard-card flex flex-col gap-2 h-[130px] border transition-all duration-300 overflow-hidden", 
        isDark ? "bg-[#0A0A0A] border-white/10" : "bg-white border-neutral-200 shadow-sm"
      )}
    >
      <span className={cn("text-[9px] font-bold uppercase tracking-[0.2em] opacity-40", isDark ? "text-white" : "text-black")}>Session Status</span>
      <div className="space-y-1">
        <SessionItem label="London" status="CLOSED" isDark={isDark} />
        <SessionItem label="New York" status="ACTIVE" isActive isDark={isDark} />
        <SessionItem label="Tokyo" status="OPENING" isDark={isDark} />
      </div>
    </motion.div>
  );
}

function SessionItem({ label, status, isActive = false, isDark }: { label: string, status: string, isActive?: boolean, isDark: boolean }) {
  return (
    <div className="flex justify-between items-center min-w-0 gap-2">
      <span className={cn("text-xs font-bold truncate", isDark ? "text-white" : "text-black")}>{label}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={cn("text-[9px] font-bold uppercase tracking-widest", isActive ? "text-accent-green" : (isDark ? "text-white/40" : "text-black/40"))}>
          {status}
        </span>
        {isActive && <div className="w-1 h-1 rounded-full bg-accent-green animate-pulse" />}
      </div>
    </div>
  );
}

function RecentActivityCard({ isDark, trades, loading, onNavigate, onEdit, onDelete, accountSize }: { isDark: boolean, trades: Trade[], loading: boolean, onNavigate: (view: any) => void, onEdit: (trade: Trade) => void, onDelete: (id: string) => void, accountSize: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={cn(
        "standard-card overflow-hidden border transition-all duration-300", 
        isDark ? "bg-[#0A0A0A] border-white/10" : "bg-white border-neutral-200 shadow-sm"
      )}
    >
      <div className={cn("px-6 py-4 border-b flex justify-between items-center", isDark ? "border-white/10" : "border-neutral-100")}>
        <h3 className={cn("text-lg font-black tracking-tight", isDark ? "text-white" : "text-black")}>RECENT ACTIVITY</h3>
        <motion.button 
          onClick={() => onNavigate("trades")}
          whileHover={{ x: 5 }}
          className={cn("text-[9px] font-bold uppercase tracking-[0.2em] text-accent-green hover:opacity-70 transition-opacity")}
        >
          View Ledger
        </motion.button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className={cn("border-b", isDark ? "bg-white/[0.02] border-white/5" : "bg-neutral-50 border-neutral-100")}>
            <tr>
              <TableHead label="Instrument" isDark={isDark} />
              <TableHead label="Date & Time" isDark={isDark} />
              <TableHead label="Dur." isDark={isDark} />
              <TableHead label="Direction" isDark={isDark} />
              <TableHead label="Setup" isDark={isDark} />
              <TableHead label="TF" isDark={isDark} />
              <TableHead label="R:R" isDark={isDark} />
              <TableHead label="Session" isDark={isDark} />
              <TableHead label="Tags" isDark={isDark} />
              <TableHead label="Rules" isDark={isDark} />
              <TableHead label="PnL" isDark={isDark} />
              <TableHead label="" isDark={isDark} />
            </tr>
          </thead>
          <tbody className={cn("divide-y", isDark ? "divide-white/5" : "divide-neutral-100")}>
            {loading ? (
              <tr>
                <td colSpan={12} className="py-8 text-center">
                  <Loader2 className="animate-spin mx-auto text-accent-green" size={20} />
                </td>
              </tr>
            ) : trades.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center opacity-40 text-[11px] uppercase tracking-widest font-bold">
                  No recent activity
                </td>
              </tr>
            ) : (
              trades.map((trade) => (
                <TableRow 
                  key={trade.id}
                  trade={trade}
                  isDark={isDark} 
                  onEdit={onEdit}
                  onDelete={onDelete}
                  accountSize={accountSize}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}


function TableHead({ label, isDark, tooltip }: { label: string, isDark: boolean, tooltip?: string }) {
  return (
    <th className={cn("px-6 py-3 text-[9px] font-bold uppercase tracking-widest", isDark ? "text-white/40" : "text-neutral-500")}>
      {label}
    </th>
  );
}

const formatDuration = (minutes: number | null) => {
  if (minutes === null) return "---";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const RewardBar = ({ pnlAmount, accountSize, isWin, isDark }: { pnlAmount: number, accountSize: string, isWin: boolean, isDark: boolean }) => {
  // Fulfillment Criteria: 0.5% -> 25%, 1% -> 50%, 1.5% -> 75%, 2% -> 100%
  const size = parseFloat(accountSize.replace(/,/g, '')) || 100000;
  const percentage = (Math.abs(pnlAmount) / size) * 100;
  const width = Math.min(percentage * 50, 100); 
  
  return (
    <div className={cn("h-1 w-16 rounded-full overflow-hidden mt-1.5", isDark ? "bg-white/5" : "bg-neutral-100")}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        className={cn(
          "h-full rounded-full transition-all duration-500", 
          isWin 
            ? "bg-accent-green shadow-[0_0_8px_rgba(0,255,65,0.6)]" 
            : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
        )}
      />
    </div>
  );
};

function TableRow({ trade, isDark, onEdit, onDelete, accountSize }: { trade: Trade, isDark: boolean, onEdit: (trade: Trade) => void, onDelete: (id: string) => void, accountSize: string, key?: any }) {
  const [showMenu, setShowMenu] = useState(false);
  const isWin = trade.pnl_amount >= 0;

  const calculateDuration = (entry: string, exit: string) => {
    if (!entry || !exit) return null;
    const [entryH, entryM] = entry.split(':').map(Number);
    const [exitH, exitM] = exit.split(':').map(Number);
    let diffMinutes = (exitH * 60 + exitM) - (entryH * 60 + entryM);
    if (diffMinutes < 0) diffMinutes += 24 * 60;
    return diffMinutes;
  };

  const duration = trade.duration || calculateDuration(trade.entry_time, trade.exit_time);
  
  return (
    <tr 
      onClick={() => onEdit(trade)}
      className={cn("transition-colors cursor-pointer group", isDark ? "hover:bg-white/[0.03]" : "hover:bg-neutral-50")}
    >
      <td className="px-6 py-2.5">
        <span className="font-bold text-[12px] tracking-tight">{trade.instrument}</span>
      </td>
      <td className="px-6 py-2.5">
        <p className={cn("text-[12px] font-bold", isDark ? "text-white" : "text-black")}>
          {new Date(trade.trade_date).toLocaleDateString()}
        </p>
        <p className={cn("text-[9px] font-mono opacity-40", isDark ? "text-white" : "text-black")}>
          {trade.entry_time.split(':').slice(0, 2).join(':')}
        </p>
      </td>
      <td className="px-6 py-2.5 text-[9px] font-mono font-bold">
        {formatDuration(duration)}
      </td>
      <td className={cn("px-6 py-2.5 text-[9px] font-bold uppercase tracking-widest", trade.direction === "LONG" ? "text-accent-green" : "text-accent-red")}>
        {trade.direction}
      </td>
      <td className="px-6 py-2.5 text-[9px] font-bold opacity-60">
        {trade.setup || "---"}
      </td>
      <td className="px-6 py-2.5 text-[9px] font-mono opacity-60">
        {trade.timeframe || "---"}
      </td>
      <td className="px-6 py-2.5 text-[9px] font-bold opacity-60">
        {Number(trade.r_multiple).toFixed(2)} R
      </td>
      <td className="px-6 py-2.5 text-[9px] font-bold opacity-60">
        {trade.session}
      </td>
      <td className="px-6 py-2.5">
        <div className="flex gap-1 flex-wrap max-w-[150px]">
          {trade.tags ? trade.tags.split(',').map((tag, i) => (
            <span key={i} className={cn("px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest", isDark ? "bg-white/5 text-white/40" : "bg-neutral-100 text-neutral-500")}>
              {tag.trim()}
            </span>
          )) : "---"}
        </div>
      </td>
      <td className="px-6 py-2.5">
        {trade.rules_followed ? (
          <CheckCircle2 className="text-accent-green" size={14} />
        ) : (
          <div className="w-3.5 h-3.5 rounded-full border border-red-500/50 flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-red-500" />
          </div>
        )}
      </td>
      <td className={cn("px-6 py-2.5 font-black text-[13px] tracking-tight", isWin ? "text-accent-green" : "text-accent-red")}>
        <div className="flex flex-col">
          <span>{isWin ? '+' : ''}${trade.pnl_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <RewardBar pnlAmount={trade.pnl_amount} accountSize={accountSize} isWin={isWin} isDark={isDark} />
        </div>
      </td>
      <td className="px-6 py-2.5 relative" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className={cn("p-1.5 rounded-full transition-colors", isDark ? "hover:bg-white/10" : "hover:bg-neutral-100")}
        >
          <MoreVertical size={14} className={isDark ? "text-white/40" : "text-neutral-400"} />
        </button>
        
        <AnimatePresence>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setShowMenu(false)} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className={cn(
                  "absolute right-8 top-12 w-48 rounded-xl border shadow-xl z-[70] overflow-hidden",
                  isDark ? "bg-[#0A0A0A] border-white/10" : "bg-white border-neutral-200"
                )}
              >
                <button 
                  onClick={() => {
                    onEdit(trade);
                    setShowMenu(false);
                  }}
                  className={cn("w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors", isDark ? "hover:bg-white/5 text-white/60" : "hover:bg-neutral-50 text-neutral-600")}
                >
                  <Edit2 size={14} className="text-accent-green" />
                  Edit Trade
                </button>
                <button 
                  onClick={() => {
                    onDelete(trade.id);
                    setShowMenu(false);
                  }}
                  className={cn("w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors border-t", isDark ? "hover:bg-white/5 text-red-500 border-white/5" : "hover:bg-neutral-50 text-red-500 border-neutral-100")}
                >
                  <Trash2 size={14} />
                  Delete Trade
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </td>
    </tr>
  );
}

function FooterLink({ label, isDark }: { label: string, isDark: boolean }) {
  return (
    <a href="#" className={cn("transition-colors", isDark ? "text-white/40 hover:text-accent-green" : "text-neutral-500 hover:text-black")}>
      {label}
    </a>
  );
}
