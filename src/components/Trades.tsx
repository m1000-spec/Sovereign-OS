import { useState, useEffect, ReactNode } from "react";
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
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Calendar,
  Clock,
  DollarSign,
  Calculator,
  Image as ImageIcon,
  Edit3,
  ClipboardList,
  BookOpen,
  Tag,
  Bell,
  LogOut,
  Loader2,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  Mic
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";
import { TradeModal } from "./TradeModal";
import { Header } from "./Header";
import { Trade } from "../types";
import { Tooltip } from "./Tooltip";

interface TradesProps {
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

import { useTradeStore } from "../store/useTradeStore";

export default function Trades({ 
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
}: TradesProps) {
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
      } catch (error: any) {
        console.error('Error deleting trade:', error);
        alert(`Failed to delete trade: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const winRateFormatted = winRate.toFixed(1);
  const totalPnL = totalNetProfit;
  const avgRRFormatted = avgRR.toFixed(1);

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  return (
    <>
      <div className="flex-1 flex flex-col transition-all duration-300">
        <div className="pt-20 px-4 md:px-5 pb-32 md:pb-12 w-full space-y-6">
          {/* Mobile Search - Only visible on small screens */}
          <div className="md:hidden relative w-full mb-4">
            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", isDark ? "text-white/20" : "text-neutral-400")} />
            <input 
              type="text"
              placeholder="Search trades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-10 pr-3 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all outline-none border",
                isDark 
                  ? "bg-white/5 border-white/10 text-white placeholder:text-white/20" 
                  : "bg-neutral-100 border-neutral-200 text-black placeholder:text-neutral-400"
              )}
            />
          </div>

          {/* Title Section */}
          <div className="flex flex-col md:flex-row justify-end items-end gap-4 mb-1">
            <div className="flex gap-1.5">
              <div className={cn("px-3 py-1.5 border rounded-lg flex items-center gap-1.5", isDark ? "bg-white/5 border-white/10" : "bg-neutral-100 border-neutral-200")}>
                <div className={cn("w-1 h-1 rounded-full animate-pulse", isDark ? "bg-accent-green" : "bg-green-500")}></div>
                <span className={cn("text-[8px] font-bold uppercase tracking-widest opacity-60", isDark ? "text-white" : "text-black")}>Live Market</span>
              </div>
              <div className={cn("px-3 py-1.5 border rounded-lg", isDark ? "bg-white/5 border-white/10" : "bg-neutral-100 border-neutral-200")}>
                <span className={cn("text-[8px] font-bold uppercase tracking-widest opacity-60", isDark ? "text-white" : "text-black")}>{currentDate}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-1">
            <StatCard label="Win Rate" value={`${winRateFormatted}%`} trend="+2.1%" isDark={isDark} />
            <StatCard label="Total PnL" value={`$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} isSuccess={totalPnL >= 0} isDark={isDark} />
            <StatCard label="Avg R:R" value={`${avgRRFormatted} R`} subValue="OPTIMAL" isDark={isDark} />
            <StatCard label="Trade Count" value={trades.length.toString()} icon={<BarChart3 size={14} />} isDark={isDark} borderAccent />
          </div>

          {/* Trade log Table */}
          <div className={cn("standard-card overflow-hidden border transition-all duration-300", isDark ? "bg-[#0A0A0A] border-white/10" : "bg-white border-neutral-200 shadow-sm")}>
            <div className={cn("px-5 py-3 border-b flex justify-between items-center", isDark ? "border-white/10" : "border-neutral-100")}>
              <h3 className={cn("text-base font-black tracking-tight", isDark ? "text-white" : "text-black")}>TRADE LOG</h3>
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className={cn("border-b", isDark ? "bg-white/[0.02] border-white/5" : "bg-neutral-50 border-neutral-100")}>
                  <tr>
                    <TradeTh label="Instrument" isDark={isDark} />
                    <TradeTh label="Date & Time" isDark={isDark} />
                    <TradeTh label="Dur." isDark={isDark} />
                    <TradeTh label="Direction" isDark={isDark} />
                    <TradeTh label="Setup" isDark={isDark} />
                    <TradeTh label="TF" isDark={isDark} />
                    <TradeTh label="R:R" isDark={isDark} />
                    <TradeTh label="Session" isDark={isDark} />
                    <TradeTh label="Tags" isDark={isDark} />
                    <TradeTh label="Rules" isDark={isDark} />
                    <TradeTh label="PnL" isDark={isDark} />
                    <TradeTh label="" isDark={isDark} />
                  </tr>
                </thead>
                <tbody className={cn("divide-y", isDark ? "divide-white/5" : "divide-neutral-100")}>
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="py-10 text-center">
                        <Loader2 className="animate-spin mx-auto text-accent-green mb-2" size={20} />
                        <p className={cn("text-[10px] font-bold tracking-widest uppercase", isDark ? "text-white/40" : "text-neutral-500")}>
                          Synchronizing with Ledger...
                        </p>
                      </td>
                    </tr>
                  ) : filteredTrades.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-10 text-center">
                        <p className={cn("text-[10px] font-bold tracking-widest uppercase", isDark ? "text-white/40" : "text-neutral-500")}>
                          {searchQuery ? "No trades found matching your search." : "No trades found in ledger."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredTrades.map((trade) => (
                      <TradeRow 
                        key={trade.id} 
                        trade={trade} 
                        isDark={isDark} 
                        onEdit={handleEditTrade}
                        onDelete={handleDeleteTrade}
                        accountSize={accountSize}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-white/5">
              {loading ? (
                <div className="p-10 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-accent-green mx-auto mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Loading...</span>
                </div>
              ) : filteredTrades.length === 0 ? (
                <div className="p-10 text-center opacity-40 text-[10px] font-bold uppercase tracking-widest">
                  No trades found
                </div>
              ) : (
                filteredTrades.map((trade) => (
                  <div 
                    key={trade.id}
                    onClick={() => handleEditTrade(trade)}
                    className={cn(
                      "p-4 active:bg-white/5 transition-colors",
                      isDark ? "bg-black" : "bg-white"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-sm font-black tracking-tight mr-2">{trade.instrument}</span>
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                          trade.direction === "LONG" 
                            ? (isDark ? "bg-accent-green/10 text-accent-green" : "bg-green-100 text-green-700")
                            : (isDark ? "bg-accent-red/10 text-accent-red" : "bg-red-100 text-red-700")
                        )}>
                          {trade.direction}
                        </span>
                      </div>
                      <span className={cn(
                        "text-sm font-black tracking-tighter",
                        trade.pnl_amount >= 0 ? "text-accent-green" : "text-accent-red"
                      )}>
                        {trade.pnl_amount >= 0 ? '+' : ''}${Math.abs(trade.pnl_amount).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-[10px] opacity-60 font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={10} />
                        {new Date(trade.trade_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={10} />
                        {trade.entry_time}
                      </div>
                      <div>{trade.setup || "No Setup"}</div>
                      <div>{trade.session} Session</div>
                      <div>{Number(trade.r_multiple).toFixed(2)} R</div>
                    </div>

                    <div className="mt-3 flex gap-1 flex-wrap">
                      {trade.tags && trade.tags.split(',').map((tag, i) => (
                        <span key={i} className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest", isDark ? "bg-white/5 text-white/40" : "bg-neutral-100 text-neutral-500")}>
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className={cn("px-5 py-3 border-t flex justify-between items-center", isDark ? "bg-white/5 border-white/5" : "bg-neutral-50 border-neutral-100")}>
              <div className={cn("text-[8px] font-bold tracking-widest uppercase", isDark ? "text-white/40" : "text-neutral-500")}>
                Showing {trades.length} entries
              </div>
              <div className="flex gap-1">
                <PaginationButton icon={<ChevronLeft size={12} />} isDark={isDark} />
                <PaginationButton label="1" active isDark={isDark} />
                <PaginationButton icon={<ChevronRight size={12} />} isDark={isDark} />
              </div>
            </div>
          </div>

          {/* Performance Narrative & Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3 space-y-4">
              <h3 className={cn("text-[9px] font-bold tracking-[0.4em] uppercase ml-2", isDark ? "text-white/40" : "text-neutral-500")}>
                Performance Narrative
              </h3>
              <div className={cn("p-8 standard-card relative overflow-hidden", isDark ? "bg-white/5" : "bg-white shadow-sm")}>
                <div className={cn("absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl", isDark ? "bg-accent-green/5" : "bg-black/5")} />
                <p className={cn("text-xl font-medium leading-relaxed mb-6 relative z-10", isDark ? "text-white/90" : "text-black")}>
                  "The transition from October to November shows a marked increase in discipline. High-timeframe supply taps are delivering the highest R:R results. Note the emotional fatigue on short-duration AAPL trades—consider tightening the criteria for equity scalp setups."
                </p>
                <div className="flex items-center gap-4 relative z-10">
                  <div className={cn("flex items-center gap-2 px-4 py-2 rounded-lg border text-[11px] font-bold", isDark ? "bg-white/5 border-white/10 text-white/60" : "bg-neutral-100 border-neutral-200 text-neutral-600")}>
                    <Sparkles size={14} className="text-accent-green" />
                    JARVIS_ADVISORY
                  </div>
                  <div className={cn("flex items-center gap-2 px-4 py-2 rounded-lg border text-[11px] font-bold uppercase", isDark ? "bg-white/5 border-white/10 text-white/60" : "bg-neutral-100 border-neutral-200 text-neutral-600")}>
                    Risk: Moderate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate("copilot" as any)}
        className={cn(
          "fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center transition-transform group z-[100] shadow-[0_10px_40px_rgba(0,255,65,0.4)] no-print",
          isDark ? "bg-accent-green text-black hover:shadow-[0_0_20px_rgba(0,255,65,0.4)]" : "bg-black text-white"
        )}
      >
        <Mic size={24} />
      </motion.button>
    </>
  );
}


function StatCard({ label, value, trend, subValue, icon, isSuccess = false, isDark, borderAccent = false }: { label: string, value: string, trend?: string, subValue?: string, icon?: ReactNode, isSuccess?: boolean, isDark: boolean, borderAccent?: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={cn(
        "p-5 standard-card relative overflow-hidden group border transition-all duration-300",
        isDark ? "bg-white/3 border-white/10" : "bg-white border-neutral-200 shadow-sm",
      )}
    >
      <p className={cn("text-[8px] font-bold tracking-[0.2em] uppercase mb-2", isDark ? "text-white/40" : "text-neutral-500")}>
        {label}
      </p>
      <div className="flex items-end justify-between">
        <span className={cn("text-2xl font-black tracking-tighter", isSuccess ? "text-accent-green" : (isDark ? "text-white" : "text-black"))}>
          {value}
        </span>
        {trend && (
          <div className={cn("text-[10px] flex items-center gap-1 font-bold", "text-accent-green")}>
            <TrendingUp size={10} />
            {trend}
          </div>
        )}
        {subValue && (
          <span className={cn("text-[8px] font-bold tracking-widest", isDark ? "text-white/40" : "text-neutral-400")}>
            {subValue}
          </span>
        )}
        {icon && <div className={isDark ? "text-white/40" : "text-neutral-300"}>{icon}</div>}
      </div>
    </motion.div>
  );
}

function TradeTh({ label, isDark, tooltip }: { label: string, isDark: boolean, tooltip?: string }) {
  return (
    <th className={cn("px-5 py-2.5 text-[8px] font-bold uppercase tracking-widest", isDark ? "text-white/40" : "text-neutral-500")}>
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

function TradeRow({ trade, isDark, onEdit, onDelete, accountSize }: { trade: Trade, isDark: boolean, onEdit: (trade: Trade) => void, onDelete: (id: string) => void, accountSize: string, key?: any }) {
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
      <td className="px-5 py-2">
        <span className="font-bold text-[11px] tracking-tight">{trade.instrument}</span>
      </td>
      <td className="px-5 py-2">
        <p className={cn("text-[11px] font-bold", isDark ? "text-white" : "text-black")}>
          {new Date(trade.trade_date).toLocaleDateString()}
        </p>
        <p className={cn("text-[8px] font-mono opacity-40", isDark ? "text-white" : "text-black")}>
          {trade.entry_time.split(':').slice(0, 2).join(':')}
        </p>
      </td>
      <td className="px-5 py-2 text-[8px] font-mono font-bold">
        {formatDuration(duration)}
      </td>
      <td className={cn("px-5 py-2 text-[8px] font-bold uppercase tracking-widest", trade.direction === "LONG" ? "text-accent-green" : "text-accent-red")}>
        {trade.direction}
      </td>
      <td className="px-5 py-2 text-[8px] font-bold opacity-60">
        {trade.setup || "---"}
      </td>
      <td className="px-5 py-2 text-[8px] font-mono opacity-60">
        {trade.timeframe || "---"}
      </td>
      <td className="px-5 py-2 text-[8px] font-bold opacity-60">
        {Number(trade.r_multiple).toFixed(2)} R
      </td>
      <td className="px-5 py-2 text-[8px] font-bold opacity-60">
        {trade.session}
      </td>
      <td className="px-5 py-2">
        <div className="flex gap-1 flex-wrap max-w-[150px]">
          {trade.tags ? trade.tags.split(',').map((tag, i) => (
            <span key={i} className={cn("px-1 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest", isDark ? "bg-white/5 text-white/40" : "bg-neutral-100 text-neutral-500")}>
              {tag.trim()}
            </span>
          )) : "---"}
        </div>
      </td>
      <td className="px-5 py-2">
        {trade.rules_followed ? (
          <CheckCircle2 className="text-accent-green" size={12} />
        ) : (
          <div className="w-3 h-3 rounded-full border border-red-500/50 flex items-center justify-center">
            <div className="w-1 h-0.5 bg-red-500" />
          </div>
        )}
      </td>
      <td className={cn("px-5 py-2 font-black text-[12px] tracking-tight", isWin ? "text-accent-green" : "text-accent-red")}>
        <div className="flex flex-col">
          <span>{isWin ? '+' : ''}${trade.pnl_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <RewardBar pnlAmount={trade.pnl_amount} accountSize={accountSize} isWin={isWin} isDark={isDark} />
        </div>
      </td>
      <td className="px-5 py-2 relative" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className={cn("p-1 rounded-full transition-colors", isDark ? "hover:bg-white/10" : "hover:bg-neutral-100")}
        >
          <MoreVertical size={12} className={isDark ? "text-white/40" : "text-neutral-400"} />
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

function PaginationButton({ label, icon, active, isDark }: { label?: string, icon?: ReactNode, active?: boolean, isDark: boolean }) {
  return (
    <button className={cn(
      "w-7 h-7 flex items-center justify-center rounded-lg border transition-all text-[9px] font-bold",
      active 
        ? (isDark ? "bg-accent-green text-black border-accent-green" : "bg-black text-white border-black")
        : (isDark ? "border-white/10 text-white/40 hover:bg-white/5" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50")
    )}>
      {label || icon}
    </button>
  );
}

function DistributionItem({ label, value, isDark }: { label: string, value: number, isDark: boolean }) {
  return (
    <div className="group">
      <div className="flex justify-between text-[9px] font-bold uppercase mb-1.5 tracking-wider">
        <span className={isDark ? "text-white" : "text-black"}>{label}</span>
        <span className={isDark ? "text-white/40" : "text-neutral-500"}>{value}%</span>
      </div>
      <div className={cn("h-1 w-full rounded-full overflow-hidden", isDark ? "bg-white/5" : "bg-neutral-100")}>
        <div 
          className={cn("h-full transition-all group-hover:shadow-[0_0_10px_#00FF41]", isDark ? "bg-accent-green" : "bg-black")} 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}

function FormGroup({ label, children, isDark, accent }: { label: string, children: ReactNode, isDark: boolean, accent?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className={cn(
        "text-[9px] font-bold tracking-widest uppercase ml-1.5",
        accent ? (isDark ? "text-accent-green" : "text-black") : (isDark ? "text-white/40" : "text-neutral-500")
      )}>
        {label}
      </label>
      {children}
    </div>
  );
}
