import React, { useState, useEffect, ReactNode } from "react";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BarChart3, 
  FileText, 
  Settings, 
  Terminal, 
  Bell, 
  User,
  Calendar,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Percent,
  Activity,
  DollarSign,
  ChevronDown,
  ClipboardList,
  BookOpen,
  Tag,
  Sun,
  Moon,
  LogOut,
  Download
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { Header } from "./Header";
import { Tooltip } from "./Tooltip";
import { TagGroup } from "../types";

interface ReportsProps {
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
import { AIInsightsPanel } from "./AIInsightsPanel";

export default function Reports({ 
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
}: ReportsProps) {
  const { trades, loading, profitByDayOfWeek, tradesByDayOfWeek, subscribeToTrades, pnlByTime } = useTradeStore();
  const [activeFilter, setActiveFilter] = useState("Time");
  const [timeInterval, setTimeInterval] = useState("1hr");
  const [hoveredBar, setHoveredBar] = useState<{ type: 'pl' | 'dist', index: number, value: string, time: string } | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToTrades();
    return () => unsubscribe();
  }, [subscribeToTrades]);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const pnlByTimeData = pnlByTime(timeInterval === "30m" ? "30m" : "1h");

  const maxPnL = Math.max(...pnlByTimeData.map(d => Math.abs(d.pnl)), 100);
  const maxTrades = Math.max(...pnlByTimeData.map(d => d.tradeCount), 1);

  const dayPnL = days.map(day => profitByDayOfWeek[day] || 0);
  const dayTrades = days.map(day => tradesByDayOfWeek[day] || 0);

  const maxDayPnL = Math.max(...dayPnL.map(p => Math.abs(p)), 100);
  const maxDayTrades = Math.max(...dayTrades, 1);

  const dayData = {
    pl: dayPnL.map(p => (Math.abs(p) / maxDayPnL) * 100),
    dist: dayTrades.map(t => (t / maxDayTrades) * 100),
    maxPnL: maxDayPnL,
    maxTrades: maxDayTrades,
    summary: [
      { label: "Peak Performance", value: days[dayPnL.indexOf(Math.max(...dayPnL))], subValue: `+$${Math.max(...dayPnL).toLocaleString()}`, color: "text-[#00FF41]" },
      { label: "Drawdown Zone", value: days[dayPnL.indexOf(Math.min(...dayPnL))], subValue: `-$${Math.abs(Math.min(...dayPnL)).toLocaleString()}`, color: "text-[#E01E37]" },
      { label: "High Volume", value: days[dayTrades.indexOf(Math.max(...dayTrades))], subValue: `${Math.max(...dayTrades)} TRADES`, color: "text-neutral-400" },
      { label: "Low Volume", value: days[dayTrades.indexOf(Math.min(...dayTrades.filter(t => t > 0)) || 0)], subValue: `${Math.min(...dayTrades.filter(t => t > 0)) || 0} TRADES`, color: "text-neutral-400" },
    ],
    overview: days.map(day => {
      const dTrades = trades.filter(t => new Date(t.trade_date).getDay() === days.indexOf(day));
      const profit = profitByDayOfWeek[day] || 0;
      const wins = dTrades.filter(t => t.pnl_amount > 0).length;
      const winRate = dTrades.length > 0 ? (wins / dTrades.length * 100).toFixed(0) : "0";
      return { day, trades: dTrades.length, profit: `$${profit.toLocaleString()}`, winRate: `${winRate}%`, wlb: `${wins}W-${dTrades.length - wins}L` };
    }).filter(d => d.trades > 0)
  };

  // Time insights
  const timePnL = pnlByTimeData.map(d => d.pnl);
  const timeTrades = pnlByTimeData.map(d => d.tradeCount);
  const peakTimeIdx = timePnL.indexOf(Math.max(...timePnL));
  const drawdownTimeIdx = timePnL.indexOf(Math.min(...timePnL));
  const highVolTimeIdx = timeTrades.indexOf(Math.max(...timeTrades));
  const lowVolTimeIdx = timeTrades.indexOf(Math.min(...timeTrades.filter(t => t > 0)) || 0);

  const timeSummary = [
    { label: "Peak Performance", value: pnlByTimeData[peakTimeIdx]?.label || "N/A", subValue: `+$${(pnlByTimeData[peakTimeIdx]?.pnl || 0).toLocaleString()}`, color: "text-[#00FF41]" },
    { label: "Drawdown Zone", value: pnlByTimeData[drawdownTimeIdx]?.label || "N/A", subValue: `-$${Math.abs(pnlByTimeData[drawdownTimeIdx]?.pnl || 0).toLocaleString()}`, color: "text-[#E01E37]" },
    { label: "High Volume", value: pnlByTimeData[highVolTimeIdx]?.label || "N/A", subValue: `${pnlByTimeData[highVolTimeIdx]?.tradeCount || 0} TRADES`, color: "text-neutral-400" },
    { label: "Low Volume", value: pnlByTimeData[lowVolTimeIdx]?.label || "N/A", subValue: `${pnlByTimeData[lowVolTimeIdx]?.tradeCount || 0} TRADES`, color: "text-neutral-400" },
  ];

  // Helper to process categories
  const getCategoryData = (category: 'month' | 'symbol' | 'tag' | 'setup') => {
    const stats: Record<string, { pnl: number, trades: number, wins: number }> = {};
    
    // Initialize stats for months to ensure all months are present
    if (category === 'month') {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      months.forEach(m => {
        stats[m] = { pnl: 0, trades: 0, wins: 0 };
      });
    }

    trades.forEach(t => {
      let keys: string[] = [];
      if (category === 'month') {
        keys = [new Date(t.trade_date).toLocaleString('en-US', { month: 'long' })];
      } else if (category === 'symbol') {
        keys = [t.instrument];
      } else if (category === 'setup') {
        keys = [t.setup || 'No Setup'];
      } else if (category === 'tag') {
        keys = t.tags ? t.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "") : ['No Tags'];
        if (keys.length === 0) keys = ['No Tags'];
      }

      keys.forEach(key => {
        if (!stats[key]) stats[key] = { pnl: 0, trades: 0, wins: 0 };
        stats[key].pnl += t.pnl_amount;
        stats[key].trades += 1;
        if (t.pnl_amount > 0) stats[key].wins += 1;
      });
    });

    const sortedKeys = Object.keys(stats).sort((a, b) => {
      if (category === 'month') {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return months.indexOf(a) - months.indexOf(b);
      }
      return stats[b].pnl - stats[a].pnl;
    });

    const maxT = Math.max(...Object.values(stats).map(s => s.trades), 1);
    const maxP = Math.max(...Object.values(stats).map(s => Math.abs(s.pnl)), 100);
    
    const best = sortedKeys.reduce((a, b) => stats[a].pnl > stats[b].pnl ? a : b, sortedKeys[0] || 'N/A');
    const worst = sortedKeys.reduce((a, b) => stats[a].pnl < stats[b].pnl ? a : b, sortedKeys[0] || 'N/A');
    const most = sortedKeys.reduce((a, b) => stats[a].trades > stats[b].trades ? a : b, sortedKeys[0] || 'N/A');
    const least = sortedKeys.filter(k => stats[k].trades > 0).reduce((a, b) => stats[a].trades < stats[b].trades ? a : b, sortedKeys[0] || 'N/A');

    return {
      pl: sortedKeys.map(k => (Math.abs(stats[k].pnl) / maxP) * 100),
      dist: sortedKeys.map(k => (stats[k].trades / maxT) * 100),
      maxP,
      maxT,
      summary: [
        { label: "Peak Performance", value: best, subValue: `+$${(stats[best]?.pnl || 0).toLocaleString()}`, color: "text-[#00FF41]" },
        { label: "Drawdown Zone", value: worst, subValue: `$${(stats[worst]?.pnl || 0).toLocaleString()}`, color: "text-[#E01E37]" },
        { label: "High Volume", value: most, subValue: `${stats[most]?.trades || 0} TRADES`, color: "text-neutral-400" },
        { label: "Low Volume", value: least, subValue: `${stats[least]?.trades || 0} TRADES`, color: "text-neutral-400" },
      ],
      overview: sortedKeys.map(k => ({
        [category]: k,
        trades: stats[k].trades,
        profit: `$${stats[k].pnl.toLocaleString()}`,
        winRate: `${(stats[k].wins / stats[k].trades * 100).toFixed(0)}%`,
        wlb: `${stats[k].wins}W-${stats[k].trades - stats[k].wins}L`
      })) as any[]
    };
  };

  const monthData = getCategoryData('month');
  const symbolData = getCategoryData('symbol');
  const tagsData = getCategoryData('tag');
  const setupsData = getCategoryData('setup');

  const overviewData = pnlByTimeData.map(d => ({
    time: d.label,
    trades: d.tradeCount,
    profit: `$${d.pnl.toLocaleString()}`,
    winRate: `${d.tradeCount > 0 ? (d.wins / d.tradeCount * 100).toFixed(0) : 0}%`,
    wlb: `${d.wins}W-${d.tradeCount - d.wins}L`
  })).filter(d => d.trades > 0);

  useEffect(() => {
    // Global theme management is handled in App.tsx
  }, []);

  const handleDownloadPDF = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="flex-1 flex flex-col transition-all duration-300">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .md\\:ml-\\[180px\\], .md\\:ml-\\[60px\\] { margin-left: 0 !important; }
          header, nav, .sidebar, .bottom-nav, .ai-insights-trigger { display: none !important; }
          .standard-card { border: 1px solid #eee !important; box-shadow: none !important; break-inside: avoid; }
          .grid { display: block !important; }
          .grid > div { margin-bottom: 20px !important; width: 100% !important; }
          canvas { max-width: 100% !important; height: auto !important; }
          .pt-20 { padding-top: 0 !important; }
          .pb-32 { padding-bottom: 0 !important; }
        }
      `}} />
      <div className="w-full space-y-6 pt-20 px-4 md:px-6 pb-32 md:pb-16">
          {/* Title Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
            <div className="w-full sm:w-auto">
              <AIInsightsPanel 
                id="reports"
                isDark={isDark}
                data={{
                  profitByDay: profitByDayOfWeek,
                  tradesByDay: tradesByDayOfWeek,
                  summary: dayData.summary
                }}
                prompt="Summarize my trading performance. Tell me what worked, what didnt, and what I should prioritize next week. Be concise."
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end no-print">
              <button
                onClick={handleDownloadPDF}
                className={cn(
                  "px-4 py-2 border rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                  isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-white border-neutral-200 hover:bg-neutral-50 text-black shadow-sm"
                )}
              >
                <Download size={14} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Download PDF</span>
              </button>
              <div className={cn("px-4 py-2 border rounded-lg flex items-center gap-2 backdrop-blur-sm", isDark ? "bg-white/5 border-white/10" : "bg-neutral-100 border-neutral-200")}>
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isDark ? "bg-accent-green" : "bg-green-500")}></div>
                <span className={cn("text-[9px] font-bold uppercase tracking-widest opacity-60", isDark ? "text-white" : "text-black")}>Live Market</span>
              </div>
              <div className={cn("px-4 py-2 border rounded-lg backdrop-blur-sm", isDark ? "bg-white/5 border-white/10" : "bg-neutral-100 border-neutral-200")}>
                <span className={cn("text-[9px] font-bold uppercase tracking-widest opacity-60", isDark ? "text-white" : "text-black")}>{currentDate}</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              {["Time", "Day", "Month", "Symbol", "Tags", "Setups"].map((filter) => (
                <motion.button 
                  key={filter}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "px-4 py-2 text-[9px] font-bold rounded-lg uppercase tracking-widest transition-all border",
                    activeFilter === filter 
                      ? (isDark ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "bg-black text-white border-black shadow-[0_10px_20px_rgba(0,0,0,0.1)]")
                      : (isDark ? "bg-[#111111] text-[#888888] border-[#222222] hover:text-white hover:border-[#444444]" : "bg-white text-neutral-500 border-neutral-200 hover:text-black hover:border-neutral-300 hover:shadow-sm")
                  )}
                >
                  {filter}
                </motion.button>
              ))}
            </div>
            <div className="relative">
              <select 
                value={timeInterval}
                onChange={(e) => setTimeInterval(e.target.value)}
                className={cn(
                  "appearance-none border py-2 pl-4 pr-10 rounded-lg text-[9px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-accent-green cursor-pointer transition-all",
                  isDark ? "bg-[#111111] border-[#222222] text-white hover:border-[#444444]" : "bg-white border-neutral-200 text-black hover:border-neutral-300 hover:shadow-sm"
                )}
              >
                <option value="1hr">1hr</option>
                <option value="30m">30m</option>
                <option value="15M">15M</option>
                <option value="10m">10m</option>
                <option value="5m">5m</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#888888]">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {activeFilter === "Time" ? (
              <>
                {/* P&L By Time */}
                <div className={cn(
                  "rounded-xl border p-5 flex flex-col min-h-[420px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <h2 className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Performance Matrix</h2>
                      <p className={cn("text-base font-serif italic leading-none", isDark ? "text-white" : "text-black")}>P&L By Time Interval</p>
                    </div>
                    <div className={cn("flex rounded-lg p-0.5 border shadow-inner", isDark ? "bg-black border-white/5" : "bg-neutral-100 border-neutral-200")}>
                      <button className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-neutral-500 rounded-md hover:text-white transition-colors">Separate</button>
                      <button className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest bg-[#00FF41] text-black rounded-md shadow-lg font-black">Total</button>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[9px] font-mono font-bold text-neutral-600 pr-6 w-20 text-right z-10 py-2">
                      <span>${(maxPnL / 1000).toFixed(1)}k</span>
                      <span>${(maxPnL * 0.75 / 1000).toFixed(1)}k</span>
                      <span>${(maxPnL * 0.5 / 1000).toFixed(1)}k</span>
                      <span>${(maxPnL * 0.25 / 1000).toFixed(1)}k</span>
                      <span className="text-neutral-400">$0.0</span>
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-end px-2 pt-4 gap-[2px] rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50"
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-2 gap-[2px] pointer-events-none">
                        {pnlByTimeData.map((_, i) => (
                          <div key={i} className={cn("flex-1 border-r h-full last:border-r-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-t w-full first:border-t-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      
                      {/* Bars */}
                      {pnlByTimeData.map((d, i) => {
                        const h = (Math.abs(d.pnl) / maxPnL) * 100;
                        return (
                          <div 
                            key={`pl-bar-${i}`}
                            onMouseEnter={() => setHoveredBar({ type: 'pl', index: i, value: `$${d.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, time: d.label })}
                            onMouseLeave={() => setHoveredBar(null)}
                            className="flex-1 bg-gradient-to-t from-[#00FF41]/20 to-[#00FF41] hover:from-[#00FF41]/40 hover:to-[#00FF41] rounded-t-[1px] transition-all duration-300 relative group cursor-crosshair z-10"
                            style={{ height: `${h}%` }}
                          >
                            {hoveredBar?.type === 'pl' && hoveredBar.index === i && (
                              <div className={cn(
                                "absolute left-1/2 -translate-x-1/2 p-3 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 min-w-[140px] pointer-events-none backdrop-blur-2xl border transition-all duration-300",
                                h > 60 ? "top-2" : "-top-20",
                                isDark ? "bg-black/60 border-white/10" : "bg-white/70 border-neutral-200 shadow-xl"
                              )}>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <div className="w-1 h-1 rounded-full bg-[#00FF41] animate-pulse" />
                                  <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-[0.2em]">P&L - {hoveredBar.time}</p>
                                </div>
                                <p className={cn("text-lg font-black font-mono tracking-tighter leading-none", isDark ? "text-white" : "text-black")}>{hoveredBar.value}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* X-Axis Labels */}
                  <div className="flex ml-20 mt-6 h-6 items-start">
                    <div className="flex-grow flex justify-between px-2">
                      {["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"].map((time, i) => (
                        <span key={`pl-label-${i}`} className="text-[8px] font-mono font-black text-neutral-600 uppercase tracking-widest">{time}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Trade Distribution By Time */}
                <div className={cn(
                  "rounded-xl border p-5 flex flex-col min-h-[420px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <h2 className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Volume Analysis</h2>
                      <p className={cn("text-base font-serif italic leading-none", isDark ? "text-white" : "text-black")}>Trade Distribution</p>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[9px] font-mono font-bold text-neutral-600 pr-6 w-20 text-right z-10 py-2">
                      <span>{maxTrades.toFixed(1)}</span>
                      <span>{(maxTrades * 0.75).toFixed(1)}</span>
                      <span>{(maxTrades * 0.5).toFixed(1)}</span>
                      <span>{(maxTrades * 0.25).toFixed(1)}</span>
                      <span className="text-neutral-400">0.0</span>
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-end px-2 pt-4 gap-[2px] rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50"
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-2 gap-[2px] pointer-events-none">
                        {pnlByTimeData.map((_, i) => (
                          <div key={i} className={cn("flex-1 border-r h-full last:border-r-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-t w-full first:border-t-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>

                      {/* Bars */}
                      {pnlByTimeData.map((d, i) => {
                        const h = (d.tradeCount / maxTrades) * 100;
                        return (
                          <div 
                            key={`dist-bar-${i}`}
                            onMouseEnter={() => setHoveredBar({ type: 'dist', index: i, value: d.tradeCount.toString(), time: d.label })}
                            onMouseLeave={() => setHoveredBar(null)}
                            className="flex-1 bg-gradient-to-t from-[#00BCD4]/20 to-[#00BCD4] hover:from-[#00BCD4]/40 hover:to-[#00BCD4] rounded-t-[1px] transition-all duration-300 relative group cursor-crosshair z-10"
                            style={{ height: `${h}%` }}
                          >
                            {hoveredBar?.type === 'dist' && hoveredBar.index === i && (
                              <div className={cn(
                                "absolute left-1/2 -translate-x-1/2 p-3 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 min-w-[140px] pointer-events-none backdrop-blur-2xl border transition-all duration-300",
                                h > 60 ? "top-2" : "-top-20",
                                isDark ? "bg-black/60 border-white/10" : "bg-white/70 border-neutral-200 shadow-xl"
                              )}>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <div className="w-1 h-1 rounded-full bg-[#00BCD4] animate-pulse" />
                                  <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-[0.2em]">Trades - {hoveredBar.time}</p>
                                </div>
                                <p className={cn("text-lg font-black font-mono tracking-tighter leading-none", isDark ? "text-white" : "text-black")}>{hoveredBar.value}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* X-Axis Labels */}
                  <div className="flex ml-20 mt-6 h-6 items-start">
                    <div className="flex-grow flex justify-between px-2">
                      {["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"].map((time, i) => (
                        <span key={`dist-label-${i}`} className="text-[8px] font-mono font-black text-neutral-600 uppercase tracking-widest">{time}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : activeFilter === "Day" ? (
              <>
                {/* P&L By Day */}
                <div className={cn(
                  "rounded-xl border p-5 flex flex-col min-h-[420px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <h2 className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Performance Matrix</h2>
                      <p className={cn("text-lg font-serif italic leading-none", isDark ? "text-white" : "text-black")}>P&L By Day of Week</p>
                    </div>
                    <div className={cn("flex rounded-lg p-0.5 border shadow-inner", isDark ? "bg-black border-white/5" : "bg-neutral-100 border-neutral-200")}>
                      <button className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-neutral-500 rounded-md hover:text-white transition-colors">Separate</button>
                      <button className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest bg-[#00FF41] text-black rounded-md shadow-lg font-black">Total</button>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>${(dayData.maxPnL / 1000).toFixed(1)}k</span>
                      <span>${(dayData.maxPnL * 0.75 / 1000).toFixed(1)}k</span>
                      <span>${(dayData.maxPnL * 0.5 / 1000).toFixed(1)}k</span>
                      <span>${(dayData.maxPnL * 0.25 / 1000).toFixed(1)}k</span>
                      <span className="text-neutral-400">$0.0</span>
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-end justify-around px-4 pt-6 rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50"
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-4 justify-around pointer-events-none">
                        {[...Array(7)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-r h-full last:border-r-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-t w-full first:border-t-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>

                      {dayData.pl.map((h, i) => (
                        <div 
                          key={`pl-day-bar-${i}`}
                          onMouseEnter={() => setHoveredBar({ type: 'pl', index: i, value: `$${(h * dayData.maxPnL / 100).toFixed(2)}`, time: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i] })}
                          onMouseLeave={() => setHoveredBar(null)}
                          className="w-full max-w-[48px] bg-gradient-to-t from-[#00FF41]/20 to-[#00FF41] hover:from-[#00FF41]/40 hover:to-[#00FF41] transition-all duration-300 rounded-t-[2px] z-10 mx-1 relative group cursor-crosshair"
                          style={{ height: `${h}%` }}
                        >
                          {hoveredBar?.type === 'pl' && hoveredBar.index === i && activeFilter === "Day" && (
                            <div className={cn(
                              "absolute left-1/2 -translate-x-1/2 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 min-w-[160px] pointer-events-none backdrop-blur-2xl border transition-all duration-300",
                              h > 60 ? "top-4" : "-top-24",
                              isDark ? "bg-black/60 border-white/10" : "bg-white/70 border-neutral-200 shadow-xl"
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
                                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.2em]">P&L - {hoveredBar.time}</p>
                              </div>
                              <p className={cn("text-xl font-black font-mono tracking-tighter leading-none", isDark ? "text-white" : "text-black")}>{hoveredBar.value}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex ml-24 mt-8 h-8 items-center justify-around px-4">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <span key={day} className="text-[9px] font-mono font-black text-neutral-600 uppercase tracking-widest">{day}</span>
                    ))}
                  </div>
                </div>

                {/* Trade Distribution By Day */}
                <div className={cn(
                  "rounded-xl border p-5 flex flex-col min-h-[420px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <h2 className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Volume Analysis</h2>
                      <p className={cn("text-lg font-serif italic leading-none", isDark ? "text-white" : "text-black")}>By Day of Week</p>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>{dayData.maxTrades.toFixed(1)}</span>
                      <span>{(dayData.maxTrades * 0.75).toFixed(1)}</span>
                      <span>{(dayData.maxTrades * 0.5).toFixed(1)}</span>
                      <span>{(dayData.maxTrades * 0.25).toFixed(1)}</span>
                      <span className="text-neutral-400">0.0</span>
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-end justify-around px-4 pt-6 rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50"
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-4 justify-around pointer-events-none">
                        {[...Array(7)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-r h-full last:border-r-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-t w-full first:border-t-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>

                      {dayData.dist.map((h, i) => (
                        <div 
                          key={`dist-day-bar-${i}`}
                          onMouseEnter={() => setHoveredBar({ type: 'dist', index: i, value: Math.round(h * dayData.maxTrades / 100).toString(), time: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i] })}
                          onMouseLeave={() => setHoveredBar(null)}
                          className="w-full max-w-[48px] bg-gradient-to-t from-[#00BCD4]/20 to-[#00BCD4] hover:from-[#00BCD4]/40 hover:to-[#00BCD4] transition-all duration-300 rounded-t-[2px] z-10 mx-1 relative group cursor-crosshair"
                          style={{ height: `${h}%` }}
                        >
                          {hoveredBar?.type === 'dist' && hoveredBar.index === i && activeFilter === "Day" && (
                            <div className={cn(
                              "absolute left-1/2 -translate-x-1/2 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 min-w-[160px] pointer-events-none backdrop-blur-2xl border transition-all duration-300",
                              h > 60 ? "top-4" : "-top-24",
                              isDark ? "bg-black/60 border-white/10" : "bg-white/70 border-neutral-200 shadow-xl"
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00BCD4] animate-pulse" />
                                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.2em]">Trades - {hoveredBar.time}</p>
                              </div>
                              <p className={cn("text-xl font-black font-mono tracking-tighter leading-none", isDark ? "text-white" : "text-black")}>{hoveredBar.value}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex ml-24 mt-8 h-8 items-center justify-around px-4">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <span key={day} className="text-[9px] font-mono font-black text-neutral-600 uppercase tracking-widest">{day}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : activeFilter === "Month" ? (
              <>
                {/* P&L By Month */}
                <div className={cn(
                  "rounded-xl border p-5 flex flex-col min-h-[420px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <h2 className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Performance Matrix</h2>
                      <p className={cn("text-lg font-serif italic leading-none", isDark ? "text-white" : "text-black")}>P&L By Month</p>
                    </div>
                    <div className={cn("flex rounded-lg p-0.5 border shadow-inner", isDark ? "bg-black border-white/5" : "bg-neutral-100 border-neutral-200")}>
                      <button className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-neutral-500 rounded-md hover:text-white transition-colors">Separate</button>
                      <button className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest bg-[#00FF41] text-black rounded-md shadow-lg font-black">Total</button>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>${(monthData.maxP / 1000).toFixed(1)}k</span>
                      <span>${(monthData.maxP * 0.75 / 1000).toFixed(1)}k</span>
                      <span>${(monthData.maxP * 0.5 / 1000).toFixed(1)}k</span>
                      <span>${(monthData.maxP * 0.25 / 1000).toFixed(1)}k</span>
                      <span className="text-neutral-400">$0.0</span>
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-end justify-around px-4 pt-6 rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50"
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-4 justify-around pointer-events-none">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-r h-full last:border-r-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-t w-full first:border-t-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>

                      {monthData.pl.map((h, i) => (
                        <div 
                          key={`pl-month-bar-${i}`}
                          onMouseEnter={() => setHoveredBar({ type: 'pl', index: i, value: `$${(h * monthData.maxP / 100).toFixed(2)}`, time: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i] })}
                          onMouseLeave={() => setHoveredBar(null)}
                          className="w-full max-w-[24px] bg-gradient-to-t from-[#00FF41]/20 to-[#00FF41] hover:from-[#00FF41]/40 hover:to-[#00FF41] transition-all duration-300 rounded-t-[2px] z-10 mx-0.5 relative group cursor-crosshair"
                          style={{ height: `${h}%` }}
                        >
                          {hoveredBar?.type === 'pl' && hoveredBar.index === i && activeFilter === "Month" && (
                            <div className={cn(
                              "absolute left-1/2 -translate-x-1/2 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 min-w-[160px] pointer-events-none backdrop-blur-2xl border transition-all duration-300",
                              h > 60 ? "top-4" : "-top-24",
                              isDark ? "bg-black/60 border-white/10" : "bg-white/70 border-neutral-200 shadow-xl"
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
                                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.2em]">P&L - {hoveredBar.time}</p>
                              </div>
                              <p className={cn("text-xl font-black font-mono tracking-tighter leading-none", isDark ? "text-white" : "text-black")}>{hoveredBar.value}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex ml-24 mt-8 h-8 items-center justify-around px-4">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                      <span key={m} className="text-[9px] font-mono font-black text-neutral-600 uppercase tracking-widest">{m}</span>
                    ))}
                  </div>
                </div>

                {/* Trade Distribution By Month */}
                <div className={cn(
                  "rounded-xl border p-5 flex flex-col min-h-[420px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <h2 className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Volume Analysis</h2>
                      <p className={cn("text-lg font-serif italic leading-none", isDark ? "text-white" : "text-black")}>By Month</p>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>{monthData.maxT.toFixed(1)}</span>
                      <span>{(monthData.maxT * 0.75).toFixed(1)}</span>
                      <span>{(monthData.maxT * 0.5).toFixed(1)}</span>
                      <span>{(monthData.maxT * 0.25).toFixed(1)}</span>
                      <span className="text-neutral-400">0.0</span>
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-end justify-around px-4 pt-6 rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50"
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-4 justify-around pointer-events-none">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-r h-full last:border-r-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-t w-full first:border-t-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>

                      {monthData.dist.map((h, i) => (
                        <div 
                          key={`dist-month-bar-${i}`}
                          onMouseEnter={() => setHoveredBar({ type: 'dist', index: i, value: Math.round(h * monthData.maxT / 100).toString(), time: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i] })}
                          onMouseLeave={() => setHoveredBar(null)}
                          className="w-full max-w-[24px] bg-gradient-to-t from-[#00BCD4]/20 to-[#00BCD4] hover:from-[#00BCD4]/40 hover:to-[#00BCD4] transition-all duration-300 rounded-t-[2px] z-10 mx-0.5 relative group cursor-crosshair"
                          style={{ height: `${h}%` }}
                        >
                          {hoveredBar?.type === 'dist' && hoveredBar.index === i && activeFilter === "Month" && (
                            <div className={cn(
                              "absolute left-1/2 -translate-x-1/2 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 min-w-[160px] pointer-events-none backdrop-blur-2xl border transition-all duration-300",
                              h > 60 ? "top-4" : "-top-24",
                              isDark ? "bg-black/60 border-white/10" : "bg-white/70 border-neutral-200 shadow-xl"
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00BCD4] animate-pulse" />
                                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.2em]">Trades - {hoveredBar.time}</p>
                              </div>
                              <p className={cn("text-xl font-black font-mono tracking-tighter leading-none", isDark ? "text-white" : "text-black")}>{hoveredBar.value}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex ml-24 mt-8 h-8 items-center justify-around px-4">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                      <span key={m} className="text-[9px] font-mono font-black text-neutral-600 uppercase tracking-widest">{m}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : activeFilter === "Symbol" ? (
              <>
                {/* P&L By Symbol */}
                <div className={cn(
                  "rounded-xl border p-5 flex flex-col min-h-[420px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <h2 className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Performance Matrix</h2>
                      <p className={cn("text-lg font-serif italic leading-none", isDark ? "text-white" : "text-black")}>P&L By Symbol</p>
                    </div>
                    <div className={cn("flex rounded-lg p-0.5 border shadow-inner", isDark ? "bg-black border-white/5" : "bg-neutral-100 border-neutral-200")}>
                      <button className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-neutral-500 rounded-md hover:text-white transition-colors">Separate</button>
                      <button className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest bg-[#00FF41] text-black rounded-md shadow-lg font-black">Total</button>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>${(symbolData.maxP / 1000).toFixed(1)}k</span>
                      <span>${(symbolData.maxP * 0.75 / 1000).toFixed(1)}k</span>
                      <span>${(symbolData.maxP * 0.5 / 1000).toFixed(1)}k</span>
                      <span>${(symbolData.maxP * 0.25 / 1000).toFixed(1)}k</span>
                      <span className="text-neutral-400">$0.0</span>
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-end justify-around px-4 pt-6 rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50"
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-4 justify-around pointer-events-none">
                        {symbolData.pl.map((_, i) => (
                          <div key={i} className={cn("flex-1 border-r h-full last:border-r-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-t w-full first:border-t-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>

                      {symbolData.pl.map((h, i) => (
                        <div 
                          key={`pl-symbol-bar-${i}`}
                          onMouseEnter={() => setHoveredBar({ type: 'pl', index: i, value: `$${(h * symbolData.maxP / 100).toFixed(2)}`, time: symbolData.overview[i]?.symbol || "N/A" })}
                          onMouseLeave={() => setHoveredBar(null)}
                          className="w-full max-w-[64px] bg-gradient-to-t from-[#00FF41]/20 to-[#00FF41] hover:from-[#00FF41]/40 hover:to-[#00FF41] transition-all duration-300 rounded-t-[2px] z-10 mx-1 relative group cursor-crosshair"
                          style={{ height: `${h}%` }}
                        >
                          {hoveredBar?.type === 'pl' && hoveredBar.index === i && activeFilter === "Symbol" && (
                            <div className={cn(
                              "absolute left-1/2 -translate-x-1/2 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 min-w-[160px] pointer-events-none backdrop-blur-2xl border transition-all duration-300",
                              h > 60 ? "top-4" : "-top-24",
                              isDark ? "bg-black/60 border-white/10" : "bg-white/70 border-neutral-200 shadow-xl"
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
                                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.2em]">P&L - {hoveredBar.time}</p>
                              </div>
                              <p className={cn("text-xl font-black font-mono tracking-tighter leading-none", isDark ? "text-white" : "text-black")}>{hoveredBar.value}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex ml-24 mt-8 h-8 items-center justify-around px-4">
                    {symbolData.overview.map((row) => (
                      <span key={row.symbol} className="text-[9px] font-mono font-black text-neutral-600 uppercase tracking-widest">{row.symbol}</span>
                    ))}
                  </div>
                </div>

                {/* Trade Distribution By Symbol */}
                <div className={cn(
                  "rounded-xl border p-5 flex flex-col min-h-[420px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <h2 className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Volume Analysis</h2>
                      <p className={cn("text-lg font-serif italic leading-none", isDark ? "text-white" : "text-black")}>By Symbol</p>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>{symbolData.maxT.toFixed(1)}</span>
                      <span>{(symbolData.maxT * 0.75).toFixed(1)}</span>
                      <span>{(symbolData.maxT * 0.5).toFixed(1)}</span>
                      <span>{(symbolData.maxT * 0.25).toFixed(1)}</span>
                      <span className="text-neutral-400">0.0</span>
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-end justify-around px-4 pt-6 rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50"
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-4 justify-around pointer-events-none">
                        {symbolData.dist.map((_, i) => (
                          <div key={i} className={cn("flex-1 border-r h-full last:border-r-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-t w-full first:border-t-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>

                      {symbolData.dist.map((h, i) => (
                        <div 
                          key={`dist-symbol-bar-${i}`}
                          onMouseEnter={() => setHoveredBar({ type: 'dist', index: i, value: Math.round(h * symbolData.maxT / 100).toString(), time: symbolData.overview[i]?.symbol || "N/A" })}
                          onMouseLeave={() => setHoveredBar(null)}
                          className="w-full max-w-[64px] bg-gradient-to-t from-[#00BCD4]/20 to-[#00BCD4] hover:from-[#00BCD4]/40 hover:to-[#00BCD4] transition-all duration-300 rounded-t-[2px] z-10 mx-1 relative group cursor-crosshair"
                          style={{ height: `${h}%` }}
                        >
                          {hoveredBar?.type === 'dist' && hoveredBar.index === i && activeFilter === "Symbol" && (
                            <div className={cn(
                              "absolute left-1/2 -translate-x-1/2 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 min-w-[160px] pointer-events-none backdrop-blur-2xl border transition-all duration-300",
                              h > 60 ? "top-4" : "-top-24",
                              isDark ? "bg-black/60 border-white/10" : "bg-white/70 border-neutral-200 shadow-xl"
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00BCD4] animate-pulse" />
                                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.2em]">Trades - {hoveredBar.time}</p>
                              </div>
                              <p className={cn("text-xl font-black font-mono tracking-tighter leading-none", isDark ? "text-white" : "text-black")}>{hoveredBar.value}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex ml-24 mt-8 h-8 items-center justify-around px-4">
                    {symbolData.overview.map((row) => (
                      <span key={row.symbol} className="text-[9px] font-mono font-black text-neutral-600 uppercase tracking-widest">{row.symbol}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : activeFilter === "Tags" ? (
              <>
                {/* P&L By Tags */}
                <div className={cn(
                  "rounded-xl border p-5 flex flex-col min-h-[420px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <h2 className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Performance Matrix</h2>
                      <p className={cn("text-lg font-serif italic leading-none", isDark ? "text-white" : "text-black")}>P&L By Tags</p>
                    </div>
                    <div className={cn("flex rounded-lg p-0.5 border shadow-inner", isDark ? "bg-black border-white/5" : "bg-neutral-100 border-neutral-200")}>
                      <button className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-neutral-500 rounded-md hover:text-white transition-colors">Separate</button>
                      <button className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest bg-[#00FF41] text-black rounded-md shadow-lg font-black">Total</button>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>${(tagsData.maxP / 1000).toFixed(1)}k</span>
                      <span>${(tagsData.maxP * 0.75 / 1000).toFixed(1)}k</span>
                      <span>${(tagsData.maxP * 0.5 / 1000).toFixed(1)}k</span>
                      <span>${(tagsData.maxP * 0.25 / 1000).toFixed(1)}k</span>
                      <span className="text-neutral-400">$0.0</span>
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-end justify-around px-4 pt-6 rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50"
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-4 justify-around pointer-events-none">
                        {tagsData.pl.map((_, i) => (
                          <div key={i} className={cn("flex-1 border-r h-full last:border-r-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-t w-full first:border-t-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>

                      {tagsData.pl.map((h, i) => (
                        <div 
                          key={`pl-tag-bar-${i}`}
                          onMouseEnter={() => setHoveredBar({ type: 'pl', index: i, value: `$${(h * tagsData.maxP / 100).toFixed(2)}`, time: tagsData.overview[i]?.tag || "N/A" })}
                          onMouseLeave={() => setHoveredBar(null)}
                          className="w-full max-w-[80px] bg-gradient-to-t from-[#00FF41]/20 to-[#00FF41] hover:from-[#00FF41]/40 hover:to-[#00FF41] transition-all duration-300 rounded-t-[2px] z-10 mx-1 relative group cursor-crosshair"
                          style={{ height: `${h}%` }}
                        >
                          {hoveredBar?.type === 'pl' && hoveredBar.index === i && activeFilter === "Tags" && (
                            <div className={cn(
                              "absolute left-1/2 -translate-x-1/2 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 min-w-[160px] pointer-events-none backdrop-blur-2xl border transition-all duration-300",
                              h > 60 ? "top-4" : "-top-24",
                              isDark ? "bg-black/60 border-white/10" : "bg-white/70 border-neutral-200 shadow-xl"
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
                                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.2em]">P&L - {hoveredBar.time}</p>
                              </div>
                              <p className={cn("text-xl font-black font-mono tracking-tighter leading-none", isDark ? "text-white" : "text-black")}>{hoveredBar.value}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex ml-24 mt-8 h-8 items-center justify-around px-4">
                    {tagsData.overview.map((row) => (
                      <span key={row.tag} className="text-[9px] font-mono font-black text-neutral-600 uppercase tracking-widest">{row.tag}</span>
                    ))}
                  </div>
                </div>

                {/* Trade Distribution By Tags */}
                <div className={cn(
                  "rounded-xl border p-5 flex flex-col min-h-[420px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <h2 className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Volume Analysis</h2>
                      <p className={cn("text-lg font-serif italic leading-none", isDark ? "text-white" : "text-black")}>By Tags</p>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>{tagsData.maxT.toFixed(1)}</span>
                      <span>{(tagsData.maxT * 0.75).toFixed(1)}</span>
                      <span>{(tagsData.maxT * 0.5).toFixed(1)}</span>
                      <span>{(tagsData.maxT * 0.25).toFixed(1)}</span>
                      <span className="text-neutral-400">0.0</span>
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-end justify-around px-4 pt-6 rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50"
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-4 justify-around pointer-events-none">
                        {tagsData.dist.map((_, i) => (
                          <div key={i} className={cn("flex-1 border-r h-full last:border-r-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-t w-full first:border-t-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>

                      {tagsData.dist.map((h, i) => (
                        <div 
                          key={`dist-tag-bar-${i}`}
                          onMouseEnter={() => setHoveredBar({ type: 'dist', index: i, value: Math.round(h * tagsData.maxT / 100).toString(), time: tagsData.overview[i]?.tag || "N/A" })}
                          onMouseLeave={() => setHoveredBar(null)}
                          className="w-full max-w-[80px] bg-gradient-to-t from-[#00BCD4]/20 to-[#00BCD4] hover:from-[#00BCD4]/40 hover:to-[#00BCD4] transition-all duration-300 rounded-t-[2px] z-10 mx-1 relative group cursor-crosshair"
                          style={{ height: `${h}%` }}
                        >
                          {hoveredBar?.type === 'dist' && hoveredBar.index === i && activeFilter === "Tags" && (
                            <div className={cn(
                              "absolute left-1/2 -translate-x-1/2 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 min-w-[160px] pointer-events-none backdrop-blur-2xl border transition-all duration-300",
                              h > 60 ? "top-4" : "-top-24",
                              isDark ? "bg-black/60 border-white/10" : "bg-white/70 border-neutral-200 shadow-xl"
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00BCD4] animate-pulse" />
                                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.2em]">Trades - {hoveredBar.time}</p>
                              </div>
                              <p className={cn("text-xl font-black font-mono tracking-tighter leading-none", isDark ? "text-white" : "text-black")}>{hoveredBar.value}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex ml-24 mt-8 h-8 items-center justify-around px-4">
                    {tagsData.overview.map((row) => (
                      <span key={row.tag} className="text-[9px] font-mono font-black text-neutral-600 uppercase tracking-widest">{row.tag}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : activeFilter === "Setups" ? (
              <>
                {/* P&L By Setups */}
                <div className={cn(
                  "rounded-xl border p-5 flex flex-col min-h-[420px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <h2 className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Performance Matrix</h2>
                      <p className={cn("text-lg font-serif italic leading-none", isDark ? "text-white" : "text-black")}>P&L By Setups</p>
                    </div>
                    <div className={cn("flex rounded-lg p-0.5 border shadow-inner", isDark ? "bg-black border-white/5" : "bg-neutral-100 border-neutral-200")}>
                      <button className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-neutral-500 rounded-md hover:text-white transition-colors">Separate</button>
                      <button className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest bg-[#00FF41] text-black rounded-md shadow-lg font-black">Total</button>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>${(setupsData.maxP / 1000).toFixed(1)}k</span>
                      <span>${(setupsData.maxP * 0.75 / 1000).toFixed(1)}k</span>
                      <span>${(setupsData.maxP * 0.5 / 1000).toFixed(1)}k</span>
                      <span>${(setupsData.maxP * 0.25 / 1000).toFixed(1)}k</span>
                      <span className="text-neutral-400">$0.0</span>
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-end justify-around px-4 pt-6 rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50"
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-4 justify-around pointer-events-none">
                        {setupsData.pl.map((_, i) => (
                          <div key={i} className={cn("flex-1 border-r h-full last:border-r-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-t w-full first:border-t-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>

                      {setupsData.pl.map((h, i) => (
                        <div 
                          key={`pl-setup-bar-${i}`}
                          onMouseEnter={() => setHoveredBar({ type: 'pl', index: i, value: `$${(h * setupsData.maxP / 100).toFixed(2)}`, time: setupsData.overview[i]?.setup || "N/A" })}
                          onMouseLeave={() => setHoveredBar(null)}
                          className="w-full max-w-[80px] bg-gradient-to-t from-[#00FF41]/20 to-[#00FF41] hover:from-[#00FF41]/40 hover:to-[#00FF41] transition-all duration-300 rounded-t-[2px] z-10 mx-1 relative group cursor-crosshair"
                          style={{ height: `${h}%` }}
                        >
                          {hoveredBar?.type === 'pl' && hoveredBar.index === i && activeFilter === "Setups" && (
                            <div className={cn(
                              "absolute left-1/2 -translate-x-1/2 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 min-w-[160px] pointer-events-none backdrop-blur-2xl border transition-all duration-300",
                              h > 60 ? "top-4" : "-top-24",
                              isDark ? "bg-black/60 border-white/10" : "bg-white/70 border-neutral-200 shadow-xl"
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
                                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.2em]">P&L - {hoveredBar.time}</p>
                              </div>
                              <p className={cn("text-xl font-black font-mono tracking-tighter leading-none", isDark ? "text-white" : "text-black")}>{hoveredBar.value}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex ml-24 mt-8 h-8 items-center justify-around px-4">
                    {setupsData.overview.map((row) => (
                      <span key={row.setup} className="text-[9px] font-mono font-black text-neutral-600 uppercase tracking-widest">{row.setup}</span>
                    ))}
                  </div>
                </div>

                {/* Trade Distribution By Setups */}
                <div className={cn(
                  "rounded-xl border p-5 flex flex-col min-h-[420px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <h2 className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Volume Analysis</h2>
                      <p className={cn("text-lg font-serif italic leading-none", isDark ? "text-white" : "text-black")}>By Setups</p>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>{setupsData.maxT.toFixed(1)}</span>
                      <span>{(setupsData.maxT * 0.75).toFixed(1)}</span>
                      <span>{(setupsData.maxT * 0.5).toFixed(1)}</span>
                      <span>{(setupsData.maxT * 0.25).toFixed(1)}</span>
                      <span className="text-neutral-400">0.0</span>
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-end justify-around px-4 pt-6 rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50"
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-4 justify-around pointer-events-none">
                        {setupsData.dist.map((_, i) => (
                          <div key={i} className={cn("flex-1 border-r h-full last:border-r-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-t w-full first:border-t-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>

                      {setupsData.dist.map((h, i) => (
                        <div 
                          key={`dist-setup-bar-${i}`}
                          onMouseEnter={() => setHoveredBar({ type: 'dist', index: i, value: Math.round(h * setupsData.maxT / 100).toString(), time: setupsData.overview[i]?.setup || "N/A" })}
                          onMouseLeave={() => setHoveredBar(null)}
                          className="w-full max-w-[80px] bg-gradient-to-t from-[#00BCD4]/20 to-[#00BCD4] hover:from-[#00BCD4]/40 hover:to-[#00BCD4] transition-all duration-300 rounded-t-[2px] z-10 mx-1 relative group cursor-crosshair"
                          style={{ height: `${h}%` }}
                        >
                          {hoveredBar?.type === 'dist' && hoveredBar.index === i && activeFilter === "Setups" && (
                            <div className={cn(
                              "absolute left-1/2 -translate-x-1/2 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 min-w-[160px] pointer-events-none backdrop-blur-2xl border transition-all duration-300",
                              h > 60 ? "top-4" : "-top-24",
                              isDark ? "bg-black/60 border-white/10" : "bg-white/70 border-neutral-200 shadow-xl"
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00BCD4] animate-pulse" />
                                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.2em]">Trades - {hoveredBar.time}</p>
                              </div>
                              <p className={cn("text-xl font-black font-mono tracking-tighter leading-none", isDark ? "text-white" : "text-black")}>{hoveredBar.value}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex ml-24 mt-8 h-8 items-center justify-around px-4">
                    {setupsData.overview.map((row) => (
                      <span key={row.setup} className="text-[9px] font-mono font-black text-neutral-600 uppercase tracking-widest">{row.setup}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
            <div className={cn(
              "rounded-2xl border p-12 flex flex-col items-center justify-center min-h-[400px]",
              isDark ? "bg-[#111111] border-[#222222]" : "bg-neutral-100 border-neutral-200"
            )}>
              <BarChart3 size={48} className={cn("mb-4", isDark ? "text-[#222222]" : "text-neutral-300")} />
              <p className={cn("font-bold uppercase tracking-widest", isDark ? "text-[#888888]" : "text-neutral-500")}>Data for {activeFilter} coming soon</p>
            </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {activeFilter === "Time" ? (
              timeSummary.map((stat, i) => (
                <SummaryCard 
                  key={i} 
                  label={stat.label} 
                  value={stat.value} 
                  subValue={stat.subValue} 
                  subColor={stat.color} 
                  subBg={isDark ? "bg-white/5" : "bg-neutral-100"} 
                  isDark={isDark}
                />
              ))
            ) : activeFilter === "Day" ? (
              dayData.summary.map((stat, i) => (
                <SummaryCard 
                  key={i} 
                  label={stat.label} 
                  value={stat.value} 
                  subValue={stat.subValue} 
                  subColor={stat.color} 
                  subBg={isDark ? "bg-white/5" : "bg-neutral-100"} 
                  isDark={isDark}
                />
              ))
            ) : activeFilter === "Month" ? (
              monthData.summary.map((stat, i) => (
                <SummaryCard 
                  key={i} 
                  label={stat.label} 
                  value={stat.value} 
                  subValue={stat.subValue} 
                  subColor={stat.color} 
                  subBg={isDark ? "bg-white/5" : "bg-neutral-100"} 
                  isDark={isDark}
                />
              ))
            ) : activeFilter === "Symbol" ? (
              symbolData.summary.map((stat, i) => (
                <SummaryCard 
                  key={i} 
                  label={stat.label} 
                  value={stat.value} 
                  subValue={stat.subValue} 
                  subColor={stat.color} 
                  subBg={isDark ? "bg-white/5" : "bg-neutral-100"} 
                  isDark={isDark}
                />
              ))
            ) : activeFilter === "Tags" ? (
              tagsData.summary.map((stat, i) => (
                <SummaryCard 
                  key={i} 
                  label={stat.label} 
                  value={stat.value} 
                  subValue={stat.subValue} 
                  subColor={stat.color} 
                  subBg={isDark ? "bg-white/5" : "bg-neutral-100"} 
                  isDark={isDark}
                />
              ))
            ) : activeFilter === "Setups" ? (
              setupsData.summary.map((stat, i) => (
                <SummaryCard 
                  key={i} 
                  label={stat.label} 
                  value={stat.value} 
                  subValue={stat.subValue} 
                  subColor={stat.color} 
                  subBg={isDark ? "bg-white/5" : "bg-neutral-100"} 
                  isDark={isDark}
                />
              ))
            ) : null}
          </div>



          <div className="mt-12 pb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className={cn("text-sm font-bold uppercase tracking-widest", isDark ? "text-[#888888]" : "text-neutral-500")}>Overview</h2>
              <button className={cn(
                "px-3 py-1.5 border rounded-xl text-[9px] font-bold uppercase tracking-widest transition-colors",
                isDark 
                  ? "bg-[#111111] border-[#222222] text-[#888888] hover:bg-[#222222] hover:text-white" 
                  : "bg-neutral-100 border-neutral-200 text-neutral-500 hover:bg-neutral-200 hover:text-black"
              )}>
                {activeFilter === "Day" ? "Show all days" : activeFilter === "Month" ? "Show all months" : activeFilter === "Symbol" ? "Show all symbols" : activeFilter === "Tags" ? "Show all tags" : activeFilter === "Setups" ? "Show all setups" : "Show all intervals"}
              </button>
            </div>
            <div className={cn(
              "border rounded-xl overflow-hidden group transition-colors",
              isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
            )}>
              <table className="w-full text-left border-collapse">
                <thead className={cn("border-b", isDark ? "bg-white/[0.02] border-white/5" : "bg-neutral-50 border-neutral-200")}>
                  <tr>
                    <th className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 font-serif italic">{activeFilter === "Day" ? "Day" : activeFilter === "Month" ? "Month" : activeFilter === "Symbol" ? "Symbol" : activeFilter === "Tags" ? "Tag" : activeFilter === "Setups" ? "Setup" : "Time"}</th>
                    <th className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 text-center font-serif italic">Total Trades</th>
                    <th className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 text-center font-serif italic">Net Profits</th>
                    <th className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 text-center font-serif italic">Win Rate</th>
                    <th className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 text-right font-serif italic">W-L-BE</th>
                  </tr>
                </thead>
                <tbody className={cn("divide-y", isDark ? "divide-white/5" : "divide-neutral-200")}>
                  {(activeFilter === "Day" ? dayData.overview : activeFilter === "Month" ? monthData.overview : activeFilter === "Symbol" ? symbolData.overview : activeFilter === "Tags" ? tagsData.overview : activeFilter === "Setups" ? setupsData.overview : overviewData).map((row: any, i) => (
                    <tr key={i} className={cn("transition-colors group/row", isDark ? "hover:bg-white/[0.03]" : "hover:bg-neutral-50")}>
                      <td className={cn("px-6 py-2.5 text-[11px] font-bold transition-colors", isDark ? "text-neutral-400 group-hover/row:text-white" : "text-neutral-600 group-hover/row:text-black")}>{activeFilter === "Day" ? row.day : activeFilter === "Month" ? row.month : activeFilter === "Symbol" ? row.symbol : activeFilter === "Tags" ? row.tag : activeFilter === "Setups" ? row.setup : row.time}</td>
                      <td className={cn("px-6 py-2.5 text-[11px] font-mono font-black text-center", isDark ? "text-neutral-300" : "text-neutral-600")}>{row.trades}</td>
                      <td className={cn("px-6 py-2.5 text-[11px] font-mono font-black text-center", "text-accent-green")}>{row.profit}</td>
                      <td className="px-6 py-2.5 text-[11px] font-bold text-center">
                        <div className="flex items-center justify-center gap-3">
                          <div className={cn("w-20 h-1.5 rounded-full overflow-hidden shadow-inner", isDark ? "bg-white/5" : "bg-neutral-100")}>
                            <div className="h-full bg-gradient-to-r from-[#00FF41]/40 to-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.3)]" style={{ width: row.winRate }}></div>
                          </div>
                          <span className={cn("text-[9px] font-mono font-black", isDark ? "text-neutral-300" : "text-neutral-600")}>{row.winRate}</span>
                        </div>
                      </td>
                      <td className={cn("px-6 py-2.5 text-[11px] font-mono font-black text-right transition-colors", isDark ? "text-neutral-500 group-hover/row:text-neutral-300" : "text-neutral-400 group-hover/row:text-neutral-600")}>{row.wlb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <style>{`
        `}</style>
      </div>
  );
}


function SummaryCard({ label, value, subValue, subColor, subBg, isDark }: { label: string, value: string, subValue: string, subColor: string, subBg: string, isDark: boolean, key?: any }) {
  return (
    <motion.div 
      whileHover={{ y: -3 }}
      className={cn(
        "border rounded-xl p-6 flex flex-col justify-between h-32 transition-all duration-500 group relative overflow-hidden",
        isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/20" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
      )}
    >
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl transition-colors duration-700",
        isDark ? "bg-white/[0.01] group-hover:bg-accent-green/5" : "bg-neutral-100 group-hover:bg-green-50"
      )} />
      
      <span className={cn("text-[9px] font-bold uppercase tracking-[0.3em] relative z-10 font-mono", isDark ? "text-neutral-500" : "text-neutral-400")}>{label}</span>
      <div className="flex justify-between items-end relative z-10">
        <span className={cn("text-3xl font-black tracking-tighter transition-colors duration-500 font-mono", isDark ? "text-white group-hover:text-accent-green" : "text-black group-hover:text-accent-green")}>{value}</span>
        <div className={cn("px-2 py-1 rounded-md text-[9px] font-black tracking-widest uppercase shadow-2xl backdrop-blur-md border", subColor, subBg, isDark ? "border-white/5" : "border-neutral-200")}>
          {subValue}
        </div>
      </div>
    </motion.div>
  );
}
