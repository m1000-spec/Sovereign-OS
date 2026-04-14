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
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronsDownUp,
  Target,
  Quote,
  X,
  Wallet,
  ClipboardList,
  BookOpen,
  Tag,
  Bell,
  Plus,
  LogOut,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { Header } from "./Header";
import { Tooltip } from "./Tooltip";
import { TagGroup } from "../types";

interface DailyJournalProps {
  onNavigate: (view: "dashboard" | "trades" | "analytics" | "reports" | "settings" | "daily-journal" | "annotations") => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  openTradeModal: () => void;
  onLogout: () => void;
  instruments: { id: number, name: string, color: string }[];
  setInstruments: (instruments: { id: number, name: string, color: string }[]) => void;
  setups: string[];
  setSetups: (setups: string[]) => void;
  tagGroups: TagGroup[];
  setTagGroups: (groups: TagGroup[]) => void;
  accountSize: string;
  setAccountSize: (size: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

import { useTradeStore } from "../store/useTradeStore";

export default function DailyJournal({ 
  onNavigate, 
  isDark, 
  setIsDark, 
  openTradeModal, 
  onLogout, 
  instruments, 
  setInstruments, 
  setups, 
  setSetups, 
  tagGroups, 
  setTagGroups, 
  accountSize, 
  setAccountSize,
  isCollapsed,
  setIsCollapsed,
  searchQuery,
  setSearchQuery
}: DailyJournalProps) {
  const { trades, loading, dailyPnL, subscribeToTrades } = useTradeStore();
  const [isExpandedAll, setIsExpandedAll] = useState(true);
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const unsubscribe = subscribeToTrades();
    return () => unsubscribe();
  }, [subscribeToTrades]);

  // Group trades by day for journal entries
  const tradesByDay = trades.reduce((acc: Record<string, any[]>, trade) => {
    if (!acc[trade.trade_date]) acc[trade.trade_date] = [];
    acc[trade.trade_date].push(trade);
    return acc;
  }, {});

  const sortedDates = Object.keys(tradesByDay).sort((a, b) => b.localeCompare(a));

  useEffect(() => {
    if (sortedDates.length > 0 && Object.keys(expandedEntries).length === 0) {
      const initialExpanded: Record<string, boolean> = {};
      sortedDates.slice(0, 5).forEach(date => initialExpanded[date] = true);
      setExpandedEntries(initialExpanded);
    }
  }, [sortedDates]);

  const toggleAll = () => {
    const newState = !isExpandedAll;
    setIsExpandedAll(newState);
    const updated: Record<string, boolean> = {};
    sortedDates.forEach(date => updated[date] = newState);
    setExpandedEntries(updated);
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleEntry = (id: string) => {
    setExpandedEntries(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const size = parseFloat(accountSize.replace(/,/g, '')) || 100000;
    
    const days = [];
    // Padding
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`pad-${i}`} className="aspect-square" />);
    }
    
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayTrades = tradesByDay[dateStr] || [];
      const pnl = dailyPnL[dateStr] || 0;
      const isTradingDay = dayTrades.length > 0;
      const isPositive = pnl >= 0;
      const pnlPercentage = (pnl / size) * 100;
      
                      days.push(
                        <div 
                          key={dateStr} 
                          className={cn(
                            "aspect-square flex items-center justify-center text-[10px] transition-all cursor-pointer rounded-lg",
                            isTradingDay 
                              ? cn(isDark ? "bg-white/5" : "bg-neutral-100", "font-bold", isPositive ? "text-[#00FF41]" : "text-[#FF3131]")
                              : (isDark ? "text-white/20 hover:bg-white/5" : "text-neutral-300 hover:bg-neutral-100")
                          )}
                        >
                          {isTradingDay ? (isPositive ? `+${pnlPercentage.toFixed(1)}%` : `${pnlPercentage.toFixed(1)}%`) : day}
                        </div>
                      );
    }
    return days;
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="pt-20 px-4 md:px-6 pb-32 md:pb-16 w-full">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column: Journal Entries */}
              <div className="flex-1 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className={cn("text-[11px] font-bold uppercase tracking-widest", isDark ? "text-white/40" : "text-neutral-500")}>
                      You have taken {trades.length} trades so far this week
                    </p>
                  </div>
                  <button 
                    onClick={toggleAll}
                    className={cn(
                      "standard-button px-6 py-2 font-bold gap-2 rounded-lg border backdrop-blur-sm transition-all active:scale-95 w-full sm:w-auto flex justify-center",
                      isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-neutral-100 border-neutral-200 text-black hover:bg-neutral-200"
                    )}
                  >
                    {isExpandedAll ? <ChevronsDownUp size={16} /> : <ChevronsUpDown size={16} />}
                    <span className="text-[9px] font-bold uppercase tracking-widest">
                      {isExpandedAll ? "Collapse All" : "Expand All"}
                    </span>
                  </button>
                </div>

                <div className="space-y-8">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-3">
                      <Loader2 className="w-5 h-5 text-accent-green animate-spin" />
                      <p className={cn("text-[9px] font-bold uppercase tracking-widest opacity-40", isDark ? "text-white" : "text-black")}>Syncing Journal...</p>
                    </div>
                  ) : sortedDates.length === 0 ? (
                    <div className={cn("p-8 text-center border rounded-xl border-dashed", isDark ? "border-white/10" : "border-neutral-200")}>
                      <p className={cn("text-[13px] font-medium opacity-40", isDark ? "text-white" : "text-black")}>No journal entries yet. Start trading to see your history.</p>
                    </div>
                  ) : (
                    sortedDates.map(date => {
                      const dayTrades = tradesByDay[date];
                      const pnl = dailyPnL[date] || 0;
                      const winners = dayTrades.filter(t => t.pnl_amount > 0).length;
                      const losers = dayTrades.filter(t => t.pnl_amount < 0).length;
                      const totalProfit = dayTrades.filter(t => t.pnl_amount > 0).reduce((s, t) => s + t.pnl_amount, 0);
                      const totalLoss = Math.abs(dayTrades.filter(t => t.pnl_amount < 0).reduce((s, t) => s + t.pnl_amount, 0));
                      const profitFactor = totalLoss > 0 ? (totalProfit / totalLoss).toFixed(2) : totalProfit > 0 ? "MAX" : "0.00";

                      return (
                        <JournalEntryBlock 
                          key={date}
                          id={date}
                          date={new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          isExpanded={!!expandedEntries[date]}
                          onToggle={() => toggleEntry(date)}
                          isDark={isDark}
                          stats={{
                            totalTrades: dayTrades.length.toString(),
                            grossPnl: `${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                            pnlClass: pnl >= 0 ? "text-accent-green" : "text-accent-red",
                            winners: winners.toString(),
                            losers: losers.toString(),
                            profitFactor: profitFactor
                          }}
                          trades={dayTrades.map(t => ({
                            id: t.id,
                            time: t.entry_time,
                            instrument: t.instrument,
                            side: t.direction,
                            pnl: `${t.pnl_amount >= 0 ? '+' : ''}$${t.pnl_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                            pnlClass: t.pnl_amount >= 0 ? "text-[#00FF41]" : "text-[#FF3131]"
                          }))}
                          chartPoint={{ 
                            x: 400, 
                            y: pnl >= 0 ? 45 : 180, 
                            color: pnl >= 0 ? "#00FF41" : "#FF4D4D", 
                            time: dayTrades[0]?.entry_time || "", 
                            result: `${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString()}` 
                          }}
                        />
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Calendar */}
              <div className="w-full lg:w-72 space-y-8">
                <div className={cn(
                  "border rounded-xl p-6 space-y-8 transition-all",
                  isDark ? "bg-black border-white/10" : "bg-white border-neutral-200 shadow-sm"
                )}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className={cn("font-black text-[13px] uppercase tracking-tight", isDark ? "text-white" : "text-black")}>
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </h3>
                      <div className="flex gap-1.5">
                        <ChevronUp 
                          size={16} 
                          className={cn("cursor-pointer transition-colors", isDark ? "text-white/20 hover:text-white" : "text-neutral-300 hover:text-black")} 
                          onClick={prevMonth}
                        />
                        <ChevronDown 
                          size={16} 
                          className={cn("cursor-pointer transition-colors", isDark ? "text-white/20 hover:text-white" : "text-neutral-300 hover:text-black")} 
                          onClick={nextMonth}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className={cn("text-[9px] font-bold mb-1 uppercase tracking-widest", isDark ? "text-white/20" : "text-neutral-400")}>{day}</div>
                      ))}
                      {renderCalendarDays()}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className={cn("text-[9px] font-bold uppercase tracking-widest mb-4", isDark ? "text-white/40" : "text-neutral-500")}>Monthly Performance</h4>
                      <div className="space-y-3">
                        <MonthlyStatRow label="Total Return" value="+5.6%" valueClass="text-accent-green" isDark={isDark} />
                        <MonthlyStatRow label="Win Rate" value="64%" isDark={isDark} />
                        <MonthlyStatRow label="Trading Days" value="12/21" isDark={isDark} />
                      </div>
                    </div>
                    <div className={cn("pt-6 border-t", isDark ? "border-white/10" : "border-neutral-100")}>
                      <button className={cn(
                        "standard-button w-full font-bold py-2 rounded-lg transition-all active:scale-95 text-[11px] uppercase tracking-widest",
                        isDark ? "bg-accent-green text-black" : "bg-black text-white hover:bg-neutral-800"
                      )}>
                        Generate Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}


function StatRow({ label, value, isDark, valueClass = "text-white" }: { label: string, value: string, isDark: boolean, valueClass?: string }) {
  return (
    <div className={cn("flex justify-between items-end border-b pb-2", isDark ? "border-white/5" : "border-neutral-100")}>
      <span className={cn("text-[9px] font-bold uppercase tracking-widest", isDark ? "text-white/40" : "text-neutral-500")}>{label}</span>
      <span className={cn("text-lg font-black tracking-tight", valueClass || (isDark ? "text-white" : "text-black"))}>{value}</span>
    </div>
  );
}

function MonthlyStatRow({ label, value, isDark, valueClass = "text-white" }: { label: string, value: string, isDark: boolean, valueClass?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className={cn("text-[9px] font-bold uppercase tracking-widest", isDark ? "text-white/30" : "text-neutral-400")}>{label}</span>
      <span className={cn("text-[11px] font-bold", valueClass || (isDark ? "text-white" : "text-black"))}>{value}</span>
    </div>
  );
}

interface JournalEntryBlockProps {
  key?: string;
  id: string;
  date: string;
  isExpanded: boolean;
  onToggle: () => void;
  isDark: boolean;
  stats: {
    totalTrades: string;
    grossPnl: string;
    pnlClass: string;
    winners: string;
    losers: string;
    profitFactor: string;
  };
  trades: {
    id: string;
    time: string;
    instrument: string;
    side: string;
    pnl: string;
    pnlClass: string;
  }[];
  chartPoint: {
    x: number;
    y: number;
    color: string;
    time: string;
    result: string;
  };
}

function JournalEntryBlock({ 
  id,
  date, 
  isExpanded, 
  onToggle, 
  isDark,
  stats, 
  trades, 
  chartPoint 
}: JournalEntryBlockProps) {
  return (
    <div className={cn(
      "standard-card overflow-hidden transition-all",
      isDark ? "bg-black border-white/10" : "bg-white border-neutral-200 shadow-sm"
    )}>
      <div 
        className={cn(
          "flex justify-between items-center px-6 py-4 cursor-pointer transition-all duration-300",
          isDark ? "hover:bg-white/5" : "hover:bg-neutral-50"
        )}
        onClick={onToggle}
      >
        <h3 className={cn("font-black text-[13px] uppercase tracking-[0.2em]", isDark ? "text-white" : "text-black")}>
          {date}
        </h3>
        <div className="flex items-center gap-4">
          <span className={cn("px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg border", stats.pnlClass.includes('green') ? "bg-accent-green/10 border-accent-green/20" : "bg-accent-red/10 border-accent-red/20", stats.pnlClass)}>
            {stats.grossPnl}
          </span>
          <div className={cn("transition-transform duration-300", isExpanded ? "text-accent-green" : (isDark ? "text-white/20" : "text-neutral-300"))}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn(
              "grid grid-cols-1 lg:grid-cols-12 gap-px border-t overflow-hidden",
              isDark ? "bg-white/10 border-white/10" : "bg-neutral-200 border-neutral-200"
            )}
          >
            {/* Performance Chart */}
            <div className={cn("lg:col-span-8 p-8 flex flex-col", isDark ? "bg-black" : "bg-white")}>
              <div className="flex justify-between items-center mb-8">
                <h4 className={cn("font-bold text-[10px] uppercase tracking-widest", isDark ? "text-white/40" : "text-neutral-500")}>
                  Execution Performance
                </h4>
              </div>
              
              <div className="relative flex mb-8 h-[250px]">
                {/* Y-Axis Labels */}
                <div className={cn("flex flex-col justify-between text-[10px] font-bold pr-6 h-full", isDark ? "text-white/20" : "text-neutral-400")}>
                  <span>+$1k</span>
                  <span>+$500</span>
                  <span className={isDark ? "text-white/40" : "text-neutral-600"}>P&L $0</span>
                  <span>-$500</span>
                  <span>-$1k</span>
                </div>
                
                {/* Chart Area */}
                <div className={cn("flex-1 relative border-l border-b group", isDark ? "border-white/5" : "border-neutral-200")}>
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 250">
                    <line className={cn("stroke-1", isDark ? "stroke-white/5" : "stroke-neutral-100")} x1="0" x2="800" y1="0" y2="0" />
                    <line className={cn("stroke-1", isDark ? "stroke-white/5" : "stroke-neutral-100")} x1="0" x2="800" y1="62.5" y2="62.5" />
                    <line className={cn("stroke-2", isDark ? "stroke-white/10" : "stroke-neutral-200")} x1="0" x2="800" y1="125" y2="125" />
                    <line className={cn("stroke-1", isDark ? "stroke-white/5" : "stroke-neutral-100")} x1="0" x2="800" y1="187.5" y2="187.5" />
                    <line className={cn("stroke-1", isDark ? "stroke-white/5" : "stroke-neutral-100")} x1="0" x2="800" y1="250" y2="250" />
                    
                    <line className={cn("stroke-1", isDark ? "stroke-white/5" : "stroke-neutral-100")} x1={chartPoint.x} x2={chartPoint.x} y1="0" y2="250" />
                    
                    {/* Trade Point */}
                    <circle 
                      className={cn("stroke-[2px] transition-all hover:r-[8px]", isDark ? "stroke-black" : "stroke-white")} 
                      style={{ fill: chartPoint.color }}
                      cx={chartPoint.x} cy={chartPoint.y} r="6" 
                    />
                    
                    {/* Indicators */}
                    <line stroke={isDark ? "#ffffff" : "#000000"} strokeDasharray="4" strokeOpacity="0.1" x1="0" x2="800" y1={chartPoint.y} y2={chartPoint.y} />
                    <line stroke={isDark ? "#ffffff" : "#000000"} strokeDasharray="4" strokeOpacity="0.1" x1={chartPoint.x} x2={chartPoint.x} y1="0" y2="250" />
                  </svg>

                  {/* X-Axis Label */}
                  <div className="absolute bottom-[-30px] left-0 w-full flex justify-center text-[10px] font-bold uppercase tracking-widest">
                    <span style={{ color: chartPoint.color }}>{chartPoint.time}</span>
                  </div>

                  {/* Tooltip */}
                  <div className={cn(
                    "absolute left-[52%] top-[5%] backdrop-blur-md border p-4 z-10 min-w-[150px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-2xl rounded-xl",
                    isDark ? "bg-black/80 border-white/10" : "bg-white/90 border-neutral-200"
                  )}>
                    <p className={cn("text-[9px] font-bold mb-2 tracking-widest uppercase", isDark ? "text-white/40" : "text-neutral-500")}>EXECUTION_DETAIL</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className={cn("text-[9px] font-bold uppercase", isDark ? "text-white/20" : "text-neutral-400")}>TIME</span>
                      <span className={cn("font-bold text-xs", isDark ? "text-white" : "text-black")}>{chartPoint.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={cn("text-[9px] font-bold uppercase", isDark ? "text-white/20" : "text-neutral-400")}>RESULT</span>
                      <span className="font-bold text-xs" style={{ color: chartPoint.color }}>{chartPoint.result}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Stats */}
            <div className={cn("lg:col-span-4 p-8 flex flex-col justify-center border-l", isDark ? "bg-black border-white/5" : "bg-neutral-50 border-neutral-200")}>
              <h4 className={cn("font-bold text-[9px] uppercase tracking-[0.3em] mb-8", isDark ? "text-white/40" : "text-neutral-500")}>Daily Statistics</h4>
              <div className="space-y-4">
                <StatRow label="Total Trades" value={stats.totalTrades} isDark={isDark} />
                <StatRow label="Gross PnL" value={stats.grossPnl} valueClass={stats.pnlClass} isDark={isDark} />
                <StatRow label="Total Winners" value={stats.winners} isDark={isDark} />
                <StatRow label="Total Losers" value={stats.losers} isDark={isDark} />
                <StatRow label="Profit Factor" value={stats.profitFactor} valueClass={isDark ? "text-white/40" : "text-neutral-400"} isDark={isDark} />
              </div>
            </div>

            {/* Trade Table */}
            <div className={cn("lg:col-span-12 border-t", isDark ? "bg-black border-white/10" : "bg-white border-neutral-200")}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={cn("border-b", isDark ? "border-white/5 bg-white/2" : "border-neutral-100 bg-neutral-50")}>
                      <th className={cn("px-6 py-3 text-[9px] font-bold uppercase tracking-[0.3em]", isDark ? "text-white/40" : "text-neutral-500")}>Time</th>
                      <th className={cn("px-6 py-3 text-[9px] font-bold uppercase tracking-[0.3em]", isDark ? "text-white/40" : "text-neutral-500")}>Instrument</th>
                      <th className={cn("px-6 py-3 text-[9px] font-bold uppercase tracking-[0.3em] text-center", isDark ? "text-white/40" : "text-neutral-500")}>Side</th>
                      <th className={cn("px-6 py-3 text-[9px] font-bold uppercase tracking-[0.3em] text-right", isDark ? "text-white/40" : "text-neutral-500")}>PnL</th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y", isDark ? "divide-white/5" : "divide-neutral-100")}>
                    {trades.map((trade) => (
                      <tr key={trade.id} className={cn("group transition-all duration-300", isDark ? "hover:bg-white/5" : "hover:bg-neutral-50")}>
                        <td className={cn("px-6 py-2 text-[11px] font-bold", isDark ? "text-white/60" : "text-neutral-600")}>{trade.time}</td>
                        <td className={cn("px-6 py-2 text-[11px] font-black uppercase tracking-tight", isDark ? "text-white" : "text-black")}>{trade.instrument}</td>
                        <td className="px-6 py-2 text-center">
                          <span className={cn(
                            "px-2 py-0.5 text-[8px] font-bold uppercase rounded-md border",
                            trade.side === "Buy" ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/20" : "bg-[#FF3131]/10 text-[#FF3131] border-[#FF3131]/20"
                          )}>
                            {trade.side}
                          </span>
                        </td>
                        <td className={cn("px-6 py-2 text-[11px] font-black text-right", trade.pnlClass)}>{trade.pnl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
