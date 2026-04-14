import React, { useState, useEffect, ReactNode } from "react";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BarChart3, 
  FileText, 
  Settings, 
  Terminal, 
  Search,
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
  ClipboardList,
  BookOpen,
  Tag,
  Sun,
  Moon,
  Plus,
  LogOut
} from "lucide-react";
import { motion } from "motion/react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { cn } from "../lib/utils";
import { Header } from "./Header";
import MonthlyCalendar from "./MonthlyCalendar";
import { Tooltip as AppTooltip } from "./Tooltip";
import { supabase } from "../lib/supabase";
import { Trade, TagGroup } from "../types";
import { Loader2 } from "lucide-react";
import { useTradeStore } from "../store/useTradeStore";
import { AIInsightsPanel } from "./AIInsightsPanel";

interface AnalyticsProps {
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
  onEditTrade?: (trade: Trade) => void;
}

import { DayTradeLogModal } from "./DayTradeLogModal";

export default function Analytics({ 
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
  setSearchQuery,
  onEditTrade
}: AnalyticsProps) {
  const { 
    trades, 
    loading, 
    totalNetProfit, 
    winRate, 
    avgRR, 
    equityCurve, 
    profitBySession, 
    tradesBySession, 
    profitByDayOfWeek, 
    tradesByDayOfWeek,
    radarData,
    pnlByTime,
    subscribeToTrades 
  } = useTradeStore();

  const [isDayLogModalOpen, setIsDayLogModalOpen] = useState(false);
  const [selectedLogDate, setSelectedLogDate] = useState("");
  const [selectedLogTrades, setSelectedLogTrades] = useState<Trade[]>([]);

  const handleDayClick = (date: string) => {
    const dayTrades = trades.filter(t => t.trade_date === date);
    if (dayTrades.length > 0) {
      setSelectedLogDate(date);
      setSelectedLogTrades(dayTrades);
      setIsDayLogModalOpen(true);
    }
  };

  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<"percent" | "profit" | "all">("all");
  const [equityToggle, setEquityToggle] = useState<"equity" | "date">("date");
  const [timeBin, setTimeBin] = useState<"30m" | "1h">("1h");
  const [dayView, setDayView] = useState<"separate" | "total">("total");
  const [hoveredScatterPoint, setHoveredScatterPoint] = useState<{ id: string, x: string, y: string, time: string, profit: string, type: 'win' | 'loss' } | null>(null);
  const [hoveredBar, setHoveredBar] = useState<{ label: string, value: string, x: number, y: number } | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToTrades();
    return () => unsubscribe();
  }, [subscribeToTrades]);

  const initialBalance = parseFloat(accountSize.replace(/,/g, '')) || 100000;
  
  // Process Equity Data
  const processedEquityData = equityCurve.map(point => ({
    ...point,
    value: point.value - 100000 + initialBalance // Adjust for custom account size
  }));

  // Process Scatter Points
  // Calculate dynamic max values for normalization
  const durations = trades.map(t => {
    const e = new Date(`${t.trade_date}T${t.entry_time}`);
    const ex = new Date(`${t.trade_date}T${t.exit_time}`);
    return Math.max(1, Math.floor((ex.getTime() - e.getTime()) / (1000 * 60)));
  });
  const maxDuration = Math.max(...durations, 60); // At least 60m
  const maxAbsPnL = Math.max(...trades.map(t => Math.abs(t.pnl_amount || 0)), 100);

  const scatterPoints = trades.map((trade, idx) => {
    const durationMin = durations[idx];
    
    // Normalize for chart (5-95% to avoid edges)
    const x = (Math.min(0.95, Math.max(0.05, durationMin / maxDuration)) * 100) + '%';
    const y = (50 - (trade.pnl_amount / maxAbsPnL) * 45) + '%';

    return {
      id: trade.id,
      x,
      y,
      time: durationMin > 60 ? `${Math.floor(durationMin/60)}h ${durationMin%60}m` : `${durationMin}m`,
      profit: trade.pnl_amount >= 0 ? `$${trade.pnl_amount.toFixed(2)}` : `-$${Math.abs(trade.pnl_amount).toFixed(2)}`,
      type: trade.pnl_amount >= 0 ? 'win' as const : 'loss' as const
    };
  });

  // Calculate Metrics
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl_amount > 0);
  const losingTrades = trades.filter(t => t.pnl_amount < 0);
  
  const totalProfit = winningTrades.reduce((sum, t) => sum + t.pnl_amount, 0);
  const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl_amount, 0));
  const profitFactor = totalLoss > 0 ? (totalProfit / totalLoss).toFixed(2) : totalProfit > 0 ? "∞" : "0.00";
  
  const netPnL = totalNetProfit;
  const currentBalance = initialBalance + netPnL;
  const totalReturnPercent = (netPnL / initialBalance) * 100;

  const avgProfit = totalTrades > 0 ? netPnL / totalTrades : 0;
  
  const avgRRFormatted = avgRR.toFixed(2);

  // Process Daily Stats
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyPnLValues = days.map(day => profitByDayOfWeek[day] || 0);
  const dailyTradeCountValues = days.map(day => tradesByDayOfWeek[day] || 0);
  
  const maxDailyPnL = Math.max(...dailyPnLValues.map(Math.abs), 1);
  const maxDailyTrades = Math.max(...dailyTradeCountValues, 1);

  // Process Session Stats (Radar Charts)
  const radarProfitData = radarData.profit;
  const radarWinRateData = radarData.winRate;
  const radarTradesData = radarData.trades;
  const radarAvgRRData = radarData.avgRR;

  // Process P&L by Time (Dynamic Binning)
  const pnlByTimeData = pnlByTime(timeBin);

  // Process P&L by Day
  const pnlByDayData = days.map((day, i) => {
    const tradesForDay = trades.filter(t => new Date(t.trade_date).getDay() === i);
    const pnl = profitByDayOfWeek[day] || 0;
    const winPnL = tradesForDay.filter(t => t.pnl_amount >= 0).reduce((s, t) => s + t.pnl_amount, 0);
    const lossPnL = tradesForDay.filter(t => t.pnl_amount < 0).reduce((s, t) => s + t.pnl_amount, 0);
    return { 
      label: day.toUpperCase(), 
      pnl, 
      winPnL, 
      lossPnL,
      absPnL: Math.abs(pnl)
    };
  });

  // Process Trade Distribution
  const tradeDistData = days.map((day, i) => {
    const count = tradesByDayOfWeek[day] || 0;
    return { label: day.toUpperCase(), count };
  });

  // Process Monthly Profit Table
  const years = Array.from(new Set(trades.map(t => new Date(t.trade_date).getFullYear()))).sort((a: number, b: number) => b - a);
  if (years.length === 0) years.push(new Date().getFullYear());

  const monthlyStats = years.map(year => {
    const yearTrades = trades.filter(t => new Date(t.trade_date).getFullYear() === year);
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthTrades = yearTrades.filter(t => new Date(t.trade_date).getMonth() === i);
      const profit = monthTrades.reduce((sum, t) => sum + t.pnl_amount, 0);
      const count = monthTrades.length;
      return { profit, count };
    });
    const ytdProfit = months.reduce((sum, m) => sum + m.profit, 0);
    return { year, months, ytdProfit };
  });

  // Process Annual Performance Calendar
  const annualDailyPnL = trades.reduce((acc: Record<string, number>, t) => {
    if (new Date(t.trade_date).getFullYear() === calendarYear) {
      acc[t.trade_date] = (acc[t.trade_date] || 0) + t.pnl_amount;
    }
    return acc;
  }, {});

  const formatCurrency = (value: number, compact = false) => {
    if (compact) {
      const absVal = Math.abs(value);
      if (absVal >= 1000) {
        return (value / 1000).toFixed(1) + 'k';
      }
      return value.toFixed(0);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    // No manual dark mode activation here, handled by isDark prop
  }, []);

  return (
    <div className="flex-1 flex flex-col transition-all duration-300">
        {/* Analytics Dashboard */}
        <div className="pt-16 px-4 md:px-6 pb-32 md:pb-16 space-y-8 w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
              <Loader2 className="w-6 h-6 text-accent-green animate-spin" />
              <p className={cn("text-[10px] font-bold uppercase tracking-widest opacity-40", isDark ? "text-white" : "text-black")}>Connecting Trades...</p>
            </div>
          ) : (
            <>
              {/* Page Title Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div className="w-full sm:w-auto">
                  <AIInsightsPanel 
                    id="analytics"
                    isDark={isDark}
                    data={trades.map(t => ({
                      setup: t.setup,
                      time: t.entry_time,
                      pnl: t.pnl_amount,
                      session: t.session
                    }))}
                    prompt="Analyze these trades. Identify which of my setups fail most, what time of day I perform worst, and any rule violation patterns you notice. Be concise."
                  />
                </div>
                <div className={cn("px-4 py-2 rounded-lg flex items-center gap-2 border backdrop-blur-sm self-end sm:self-auto", isDark ? "bg-white/5 border-white/10" : "bg-neutral-100 border-neutral-200")}>
                  <Calendar size={14} className="text-accent-green" />
                  <span className={cn("text-[9px] font-bold uppercase tracking-[0.2em] opacity-60", isDark ? "text-white" : "text-black")}>
                    {trades.length > 0 
                      ? `${new Date(trades[0].trade_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} — ${new Date(trades[trades.length-1].trade_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`
                      : 'No Trades Found'}
                  </span>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                  label="Account Balance" 
                  value={formatCurrency(currentBalance)} 
                  trend={`${netPnL >= 0 ? '+' : ''}${formatCurrency(netPnL)} (${totalReturnPercent.toFixed(2)}%)`} 
                  icon={<Wallet size={32} />}
                  isDark={isDark}
                />
                <MetricCard 
                  label="Win Rate" 
                  value={`${winRate.toFixed(2)}%`} 
                  trend={`${winningTrades.length}W / ${losingTrades.length}L / ${totalTrades - winningTrades.length - losingTrades.length}BE`} 
                  icon={<Percent size={32} />}
                  isDark={isDark}
                />
                <MetricCard 
                  label="Profit Factor" 
                  value={profitFactor} 
                  trend={`${formatCurrency(avgProfit)} Avg Profit`} 
                  icon={<DollarSign size={32} />}
                  isDark={isDark}
                />
                <MetricCard 
                  label="Average RR" 
                  value={avgRRFormatted} 
                  trend="Risk/Reward Performance" 
                  icon={<Activity size={32} />}
                  isDark={isDark}
                />
              </div>

              {/* Equity Curve */}
              <div className={cn("p-6 rounded-xl border transition-all duration-300 h-[480px] flex flex-col", isDark ? "bg-white/5 border-white/10" : "bg-white border-neutral-200 shadow-sm")}>
                <div className="flex items-center justify-between mb-6">
                  <h4 className={cn("text-base font-sans font-bold uppercase tracking-tight", isDark ? "text-white" : "text-black")}>P&L By Time (Equity Curve)</h4>
                  <div className="flex gap-3 items-center">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-accent-green">
                      <span className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_8px_#00FF41]"></span>
                      Cumulative P&L
                    </span>
                    <div className={cn("flex rounded-lg p-0.5 border transition-all duration-300", isDark ? "bg-black border-white/10" : "bg-neutral-100 border-neutral-200")}>
                      <button 
                        onClick={() => setEquityToggle("equity")}
                        className={cn("px-2.5 py-1 text-[9px] font-bold uppercase rounded-md transition-all", equityToggle === "equity" ? (isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm") : (isDark ? "text-white/40 hover:text-white" : "text-neutral-500 hover:text-black"))}
                      >
                        Equity
                      </button>
                      <button 
                        onClick={() => setEquityToggle("date")}
                        className={cn("px-2.5 py-1 text-[9px] font-bold uppercase rounded-md transition-all", equityToggle === "date" ? (isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm") : (isDark ? "text-white/40 hover:text-white" : "text-neutral-500 hover:text-black"))}
                      >
                        Date
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={processedEquityData}
                      margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00FF41" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00FF41" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 
                      />
                      <XAxis 
                        dataKey={equityToggle === "equity" ? "trade" : "date"} 
                        axisLine={false}
                        tickLine={false}
                        tick={{ 
                          fill: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", 
                          fontSize: 9, 
                          fontWeight: 'bold' 
                        }}
                        dy={10}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ 
                          fill: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", 
                          fontSize: 9, 
                          fontWeight: 'bold' 
                        }}
                        tickFormatter={(value) => formatCurrency(value)}
                        dx={-10}
                        domain={['auto', 'auto']}
                      />
                      <ReferenceLine 
                        y={initialBalance} 
                        stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"} 
                        strokeDasharray="3 3" 
                        label={{ 
                          value: 'Initial', 
                          position: 'right', 
                          fill: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                          fontSize: 8,
                          fontWeight: 'bold'
                        }} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid',
                          padding: '12px'
                        }}
                        itemStyle={{ color: '#00FF41', fontWeight: 'bold' }}
                        labelStyle={{ color: isDark ? 'white' : 'black', marginBottom: '4px', fontSize: '10px', opacity: 0.5 }}
                        formatter={(value: number) => [formatCurrency(value), 'Cumulative P&L']}
                        labelFormatter={(label) => equityToggle === "equity" ? `Trade ${label}` : label}
                        cursor={{ stroke: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', strokeWidth: 1 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#00FF41" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <StatsOverviewBox title="Overview" isDark={isDark}>
                  <StatRow label="Total Trades" value={totalTrades.toString()} isDark={isDark} />
                  <StatRow label="Win Rate" value={`${winRate.toFixed(2)}%`} isDark={isDark} />
                  <StatRow label="Average RR" value={avgRRFormatted} isDark={isDark} />
                  <StatRow label="Net P&L" value={formatCurrency(netPnL)} color={netPnL >= 0 ? "text-accent-green" : "text-accent-red"} isDark={isDark} />
                  <StatRow label="Average Profit/Loss" value={formatCurrency(avgProfit)} isDark={isDark} />
                </StatsOverviewBox>
                <StatsOverviewBox title="Winning Trades" isDark={isDark}>
                  <StatRow label="Total Winners" value={winningTrades.length.toString()} isDark={isDark} />
                  <StatRow label="Total Profit" value={formatCurrency(totalProfit)} color="text-accent-green" isDark={isDark} />
                  <StatRow label="Average Win" value={winningTrades.length > 0 ? formatCurrency(totalProfit / winningTrades.length) : "$0.00"} color="text-accent-green" isDark={isDark} />
                </StatsOverviewBox>
                <StatsOverviewBox title="Losing Trades" isDark={isDark}>
                  <StatRow label="Total Losers" value={losingTrades.length.toString()} isDark={isDark} />
                  <StatRow label="Total Loss" value={formatCurrency(totalLoss)} color="text-accent-red" isDark={isDark} />
                  <StatRow label="Average Loss" value={losingTrades.length > 0 ? formatCurrency(totalLoss / losingTrades.length) : "$0.00"} color="text-accent-red" isDark={isDark} />
                </StatsOverviewBox>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                <RadarChart title="Profit By Session" data={radarProfitData.map(Math.round)} isDark={isDark} />
                <RadarChart title="Win Rate By Session" data={radarWinRateData.map(Math.round)} isDark={isDark} />
                <RadarChart title="Trades By Session" data={radarTradesData.map(Math.round)} isDark={isDark} />
                <RadarChart title="Avg Profitable RR" data={radarAvgRRData.map(Math.round)} isDark={isDark} isPercentage={false} />
              </div>

              {/* Bar Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* P&L By Time */}
                <div className={cn(
                  "rounded-xl border p-6 flex flex-col min-h-[440px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <h2 className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Performance Matrix</h2>
                      <p className={cn("text-base font-serif italic leading-none", isDark ? "text-white" : "text-black")}>P&L By Time Interval</p>
                    </div>
                    <div className={cn("flex rounded-lg p-0.5 border shadow-inner", isDark ? "bg-black border-white/5" : "bg-neutral-100 border-neutral-200")}>
                      <button 
                        onClick={() => setTimeBin("30m")}
                        className={cn("px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-md transition-all", timeBin === "30m" ? (isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm") : (isDark ? "text-white/40 hover:text-white" : "text-neutral-500 hover:text-black"))}
                      >
                        30m
                      </button>
                      <button 
                        onClick={() => setTimeBin("1h")}
                        className={cn("px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-md transition-all", timeBin === "1h" ? (isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm") : (isDark ? "text-white/40 hover:text-white" : "text-neutral-500 hover:text-black"))}
                      >
                        1h
                      </button>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      {(() => {
                        const maxPnL = Math.max(...pnlByTimeData.map(d => Math.abs(d.pnl)), 100);
                        return [1, 0.75, 0.5, 0.25, 0].map((ratio, i) => (
                          <span key={i} className={ratio === 0 ? "text-neutral-400" : ""}>
                            {formatCurrency(maxPnL * ratio, true)}
                          </span>
                        ));
                      })()}
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-end px-3 pt-6 gap-[4px] rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50"
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-3 gap-[4px] pointer-events-none">
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
                      {(() => {
                        const maxPnL = Math.max(...pnlByTimeData.map(d => Math.abs(d.pnl)), 100);
                        return pnlByTimeData.map((d, i) => {
                          const height = (Math.abs(d.pnl) / maxPnL) * 100;
                          return (
                            <div 
                              key={`pl-time-bar-${i}`}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredBar({ 
                                  label: `P&L - ${d.label}`, 
                                  value: formatCurrency(d.pnl), 
                                  x: rect.left + rect.width / 2, 
                                  y: rect.top 
                                });
                              }}
                              onMouseLeave={() => setHoveredBar(null)}
                              className={cn(
                                "flex-1 transition-all duration-300 relative group cursor-crosshair z-10 rounded-t-[2px]",
                                d.pnl >= 0 
                                  ? "bg-gradient-to-t from-accent-green/20 to-accent-green hover:from-accent-green/40 hover:to-accent-green" 
                                  : "bg-gradient-to-t from-accent-red/20 to-accent-red hover:from-accent-red/40 hover:to-accent-red"
                              )}
                              style={{ height: `${height}%` }}
                            />
                          );
                        });
                      })()}
                    </div>
                  </div>
                  {/* X-Axis Labels */}
                  <div className="flex ml-24 mt-8 h-8 items-start">
                    <div className="flex-grow flex justify-between px-3">
                      {(timeBin === "30m" ? ["00:00", "06:00", "12:00", "18:00", "23:30"] : ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:00"]).map((time, i) => (
                        <span key={`pl-label-${i}`} className="text-[9px] font-mono font-black text-neutral-600 uppercase tracking-widest">{time}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* P&L By Day */}
                <div className={cn(
                  "rounded-xl border p-6 flex flex-col min-h-[440px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <h2 className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Performance Matrix</h2>
                      <p className={cn("text-base font-serif italic leading-none", isDark ? "text-white" : "text-black")}>P&L By Day of Week</p>
                    </div>
                    <div className={cn("flex rounded-lg p-0.5 border shadow-inner", isDark ? "bg-black border-white/5" : "bg-neutral-100 border-neutral-200")}>
                      <button 
                        onClick={() => setDayView("separate")}
                        className={cn("px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-md transition-all", dayView === "separate" ? (isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm") : (isDark ? "text-white/40 hover:text-white" : "text-neutral-500 hover:text-black"))}
                      >
                        Separate
                      </button>
                      <button 
                        onClick={() => setDayView("total")}
                        className={cn("px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-md transition-all", dayView === "total" ? (isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm") : (isDark ? "text-white/40 hover:text-white" : "text-neutral-500 hover:text-black"))}
                      >
                        Total
                      </button>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      {(() => {
                        if (dayView === "total") {
                          const maxPnL = Math.max(...pnlByDayData.map(d => Math.abs(d.pnl)), 100);
                          return [1, 0.75, 0.5, 0.25, 0].map((ratio, i) => (
                            <span key={i} className={ratio === 0 ? "text-neutral-400" : ""}>
                              {formatCurrency(maxPnL * ratio, true)}
                            </span>
                          ));
                        } else {
                          const maxVal = Math.max(...pnlByDayData.map(d => Math.max(d.winPnL, Math.abs(d.lossPnL))), 100);
                          return [maxVal, maxVal / 2, 0, -maxVal / 2, -maxVal].map((val, i) => (
                            <span key={i} className={val === 0 ? "text-neutral-400" : ""}>
                              {formatCurrency(val, true)}
                            </span>
                          ));
                        }
                      })()}
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-center justify-around px-4 pt-6 rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50",
                      dayView === "total" ? "items-end" : ""
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-4 justify-around pointer-events-none">
                        {pnlByDayData.map((_, i) => (
                          <div key={i} className={cn("flex-1 border-r h-full last:border-r-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-t w-full first:border-t-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>

                      {(() => {
                        if (dayView === "total") {
                          const maxPnL = Math.max(...pnlByDayData.map(d => Math.abs(d.pnl)), 100);
                          return pnlByDayData.map((d, i) => {
                            const height = (Math.abs(d.pnl) / maxPnL) * 100;
                            return (
                              <div 
                                key={`pl-day-bar-${i}`}
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoveredBar({ 
                                    label: `P&L - ${d.label}`, 
                                    value: formatCurrency(d.pnl), 
                                    x: rect.left + rect.width / 2, 
                                    y: rect.top 
                                  });
                                }}
                                onMouseLeave={() => setHoveredBar(null)}
                                className={cn(
                                  "w-full max-w-[48px] transition-all duration-300 rounded-t-[2px] z-10 mx-1 relative group cursor-crosshair",
                                  d.pnl >= 0 
                                    ? "bg-gradient-to-t from-accent-green/20 to-accent-green hover:from-accent-green/40 hover:to-accent-green" 
                                    : "bg-gradient-to-t from-accent-red/20 to-accent-red hover:from-accent-red/40 hover:to-accent-red"
                                )}
                                style={{ height: `${height}%` }}
                              />
                            );
                          });
                        } else {
                          const maxVal = Math.max(...pnlByDayData.map(d => Math.max(d.winPnL, Math.abs(d.lossPnL))), 100);
                          return pnlByDayData.map((d, i) => {
                            const winHeight = (d.winPnL / maxVal) * 50;
                            const lossHeight = (Math.abs(d.lossPnL) / maxVal) * 50;
                            return (
                              <div key={`pl-day-sep-${i}`} className="w-full max-w-[48px] h-full flex flex-col items-center justify-center relative z-10 mx-1">
                                <div 
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHoveredBar({ 
                                      label: `Profit - ${d.label}`, 
                                      value: formatCurrency(d.winPnL), 
                                      x: rect.left + rect.width / 2, 
                                      y: rect.top 
                                    });
                                  }}
                                  onMouseLeave={() => setHoveredBar(null)}
                                  className="w-full bg-gradient-to-t from-accent-green/20 to-accent-green hover:from-accent-green/40 hover:to-accent-green rounded-t-[2px] transition-all cursor-crosshair"
                                  style={{ height: `${winHeight}%`, position: 'absolute', bottom: '50%' }}
                                />
                                <div 
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHoveredBar({ 
                                      label: `Loss - ${d.label}`, 
                                      value: formatCurrency(d.lossPnL), 
                                      x: rect.left + rect.width / 2, 
                                      y: rect.bottom 
                                    });
                                  }}
                                  onMouseLeave={() => setHoveredBar(null)}
                                  className="w-full bg-gradient-to-b from-accent-red/20 to-accent-red hover:from-accent-red/40 hover:to-accent-red rounded-b-[2px] transition-all cursor-crosshair"
                                  style={{ height: `${lossHeight}%`, position: 'absolute', top: '50%' }}
                                />
                              </div>
                            );
                          });
                        }
                      })()}
                    </div>
                  </div>
                  <div className="flex ml-24 mt-8 h-8 items-center justify-around px-4">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <span key={day} className="text-[9px] font-mono font-black text-neutral-600 uppercase tracking-widest">{day}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bar Chart Tooltip Portal */}
              {hoveredBar && (
                <div 
                  className={cn(
                    "fixed z-[100] p-2 rounded-lg pointer-events-none backdrop-blur-md shadow-2xl min-w-[100px] border transition-all duration-200",
                    isDark ? "bg-black/95 border-white/10" : "bg-white/95 border-neutral-200"
                  )}
                  style={{ 
                    left: hoveredBar.x, 
                    top: hoveredBar.y,
                    transform: 'translate(-50%, -120%)'
                  }}
                >
                  <p className={cn("text-[8px] font-bold uppercase mb-1", isDark ? "text-white/40" : "text-neutral-500")}>{hoveredBar.label}</p>
                  <p className={cn("text-sm font-black", hoveredBar.value.startsWith('-') ? "text-accent-red" : "text-accent-green")}>
                    {hoveredBar.value}
                  </p>
                </div>
              )}

              {/* Scatter Plot & Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className={cn("p-8 rounded-xl border transition-all duration-500 flex flex-col min-h-[520px]", isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm")}>
                  <div className="flex justify-between items-center mb-12">
                    <div className="space-y-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Performance Matrix</h2>
                      <p className={cn("text-xl font-serif italic leading-none", isDark ? "text-white" : "text-black")}>Profit By Time Held</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-accent-green">
                        <span className="w-2 h-2 rounded-full bg-accent-green"></span>
                        Win
                      </span>
                      <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-accent-red">
                        <span className="w-2 h-2 rounded-full bg-accent-red"></span>
                        Loss
                      </span>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    {/* Y-Axis Labels */}
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>$2.0k</span>
                      <span>$1.0k</span>
                      <span className="text-neutral-400">$0.0</span>
                      <span>-$1.0k</span>
                      <span>-$2.0k</span>
                    </div>

                    <div className={cn("relative flex-grow border-l border-b px-2 pb-2 transition-all duration-300", isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50")}>
                      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
                        <div className={cn("border-r border-t", isDark ? "border-white/5" : "border-neutral-100")}></div>
                        <div className={cn("border-r border-t", isDark ? "border-white/5" : "border-neutral-100")}></div>
                        <div className={cn("border-r border-t", isDark ? "border-white/5" : "border-neutral-100")}></div>
                        <div className={cn("border-t", isDark ? "border-white/5" : "border-neutral-100")}></div>
                      </div>
                      <div className="relative w-full h-full">
                        {scatterPoints.map((point) => (
                          <div 
                            key={point.id}
                            onMouseEnter={() => setHoveredScatterPoint(point)}
                            onMouseLeave={() => setHoveredScatterPoint(null)}
                            className={cn(
                              "absolute rounded-full transition-all cursor-pointer hover:scale-150 z-10",
                              point.type === 'win' ? "bg-accent-green shadow-[0_0_8px_#00FF41]" : "bg-accent-red shadow-[0_0_8px_#ff0000]",
                              "w-2 h-2"
                            )} 
                            style={{ left: point.x, top: point.y }}
                          ></div>
                        ))}

                        {hoveredScatterPoint && (
                          <div 
                            className={cn(
                              "absolute z-20 p-2 rounded-lg pointer-events-none backdrop-blur-md shadow-2xl min-w-[100px] border transition-all duration-300",
                              isDark ? "bg-black/95 border-white/10" : "bg-white/95 border-neutral-200"
                            )}
                            style={{ 
                              left: hoveredScatterPoint.x, 
                              top: hoveredScatterPoint.y,
                              transform: 'translate(-50%, -120%)'
                            }}
                          >
                            <p className={cn("text-[8px] font-bold uppercase mb-1", isDark ? "text-white/40" : "text-neutral-500")}>Time Held - {hoveredScatterPoint.time}</p>
                            <p className={cn("text-sm font-black", hoveredScatterPoint.type === 'win' ? "text-accent-green" : "text-accent-red")}>
                              {hoveredScatterPoint.profit}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className={cn("absolute -bottom-6 left-0 right-0 flex justify-between text-[8px] font-bold uppercase", isDark ? "text-white/40" : "text-neutral-500")}>
                        <span>0m</span>
                        <span>1h</span>
                        <span>2h</span>
                        <span>3h</span>
                        <span>4h+</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trade Distribution By Day */}
                <div className={cn(
                  "rounded-2xl border p-8 flex flex-col min-h-[520px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Volume Analysis</h2>
                      <p className={cn("text-xl font-serif italic leading-none", isDark ? "text-white" : "text-black")}>By Day of Week</p>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      {(() => {
                        const maxTrades = Math.max(...tradeDistData.map(d => d.count), 10);
                        return [1, 0.75, 0.5, 0.25, 0].map((ratio, i) => (
                          <span key={i} className={ratio === 0 ? "text-neutral-400" : ""}>
                            {(maxTrades * ratio).toFixed(1)}
                          </span>
                        ));
                      })()}
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-end justify-around px-4 pt-6 rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50"
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-4 justify-around pointer-events-none">
                        {tradeDistData.map((_, i) => (
                          <div key={i} className={cn("flex-1 border-r h-full last:border-r-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-t w-full first:border-t-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>

                      {(() => {
                        const maxTrades = Math.max(...tradeDistData.map(d => d.count), 10);
                        return tradeDistData.map((d, i) => {
                          const height = (d.count / maxTrades) * 100;
                          return (
                            <div 
                              key={`dist-day-bar-${i}`}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredBar({ 
                                  label: `Trades - ${d.label}`, 
                                  value: `${d.count} Trades`, 
                                  x: rect.left + rect.width / 2, 
                                  y: rect.top 
                                });
                              }}
                              onMouseLeave={() => setHoveredBar(null)}
                              className="w-full max-w-[48px] bg-gradient-to-t from-[#00BCD4]/20 to-[#00BCD4] hover:from-[#00BCD4]/40 hover:to-[#00BCD4] transition-all duration-300 rounded-t-[2px] z-10 mx-1 relative group cursor-crosshair"
                              style={{ height: `${height}%` }}
                            />
                          );
                        });
                      })()}
                    </div>
                  </div>
                  <div className="flex ml-24 mt-8 h-8 items-center justify-around px-4">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <span key={day} className="text-[9px] font-mono font-black text-neutral-600 uppercase tracking-widest">{day}</span>
                    ))}
                  </div>
                </div>
              </div>

          {/* Monthly Calendar Section */}
          <MonthlyCalendar isDark={isDark} trades={trades} onDayClick={handleDayClick} />

          {/* Monthly Profit Table */}
          <div className={cn("p-8 rounded-xl border transition-all duration-300", isDark ? "bg-white/5 border-white/10" : "bg-white border-neutral-200 shadow-sm")}>
            <div className="flex items-center justify-between mb-8">
              <h5 className={cn("text-sm font-bold uppercase tracking-widest", isDark ? "text-white" : "text-black")}>Percentage Profit by Month</h5>
              <div className={cn("flex rounded-xl p-1 border transition-all duration-300", isDark ? "bg-black border-white/10" : "bg-neutral-100 border-neutral-200")}>
                <button 
                  onClick={() => setViewMode("percent")}
                  className={cn("px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all", viewMode === "percent" ? (isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm") : (isDark ? "text-white/40 hover:text-white" : "text-neutral-500 hover:text-black"))}
                >
                  Percent
                </button>
                <button 
                  onClick={() => setViewMode("profit")}
                  className={cn("px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all", viewMode === "profit" ? (isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm") : (isDark ? "text-white/40 hover:text-white" : "text-neutral-500 hover:text-black"))}
                >
                  Profit
                </button>
                <button 
                  onClick={() => setViewMode("all")}
                  className={cn("px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all", viewMode === "all" ? (isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm") : (isDark ? "text-white/40 hover:text-white" : "text-neutral-500 hover:text-black"))}
                >
                  All
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-2">
                <thead>
                  <tr className={cn("text-[10px] font-bold uppercase tracking-widest", isDark ? "text-white/40" : "text-neutral-500")}>
                    <th className="py-2 px-4 text-left">Year</th>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => <th key={`header-${m}`}>{m}</th>)}
                    <th className="text-right">YTD</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyStats.map((yearStat) => (
                    <tr key={yearStat.year} className="group">
                      <td className={cn("py-4 px-4 font-sans font-black text-base", isDark ? "text-white" : "text-black")}>{yearStat.year}</td>
                      {yearStat.months.map((month, mIdx) => {
                        const percent = ((month.profit / initialBalance) * 100).toFixed(2) + "%";
                        const profitStr = (month.profit >= 0 ? "+" : "-") + "$" + (Math.abs(month.profit) / 1000).toFixed(1) + "k";
                        return (
                          <MonthlyCell 
                            key={`${yearStat.year}-${mIdx}`}
                            percent={month.count > 0 ? percent : "—"} 
                            profit={month.count > 0 ? profitStr : "—"} 
                            trades={month.count} 
                            viewMode={viewMode} 
                            isDark={isDark} 
                          />
                        );
                      })}
                      <td className={cn("py-4 px-4 text-right font-black text-base", yearStat.ytdProfit >= 0 ? "text-accent-green" : "text-accent-red")}>
                        {((yearStat.ytdProfit / initialBalance) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Calendar */}
          <div className={cn("p-8 rounded-xl border transition-all duration-300", isDark ? "bg-white/5 border-white/10" : "bg-white border-neutral-200 shadow-sm")}>
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
              <h5 className={cn("text-sm font-bold uppercase tracking-widest", isDark ? "text-white" : "text-black")}>
                {calendarYear} PERFORMANCE CALENDAR
              </h5>
              <div className="flex gap-4 items-center">
                <div className={cn("flex gap-4 items-center border-r pr-4 transition-all duration-300", isDark ? "border-white/10" : "border-neutral-200")}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-accent-red rounded-full"></div>
                    <span className={cn("text-[9px] uppercase font-bold tracking-wider", isDark ? "text-white/40" : "text-neutral-500")}>Loss</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-accent-green rounded-full shadow-[0_0_8px_rgba(0,255,65,0.6)]"></div>
                    <span className={cn("text-[9px] uppercase font-bold tracking-wider", isDark ? "text-white/40" : "text-neutral-500")}>Win</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setCalendarYear(prev => prev - 1)}
                    className={cn("hover:bg-accent-green hover:text-black transition-all p-1.5 rounded-lg flex items-center justify-center border", isDark ? "bg-white/5 border-white/10 text-white" : "bg-neutral-100 border-neutral-200 text-black")}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setCalendarYear(prev => prev + 1)}
                    className={cn("hover:bg-accent-green hover:text-black transition-all p-1.5 rounded-lg flex items-center justify-center border", isDark ? "bg-white/5 border-white/10 text-white" : "bg-neutral-100 border-neutral-200 text-black")}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-6">
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, mIdx) => {
                const daysInMonth = new Date(calendarYear, mIdx + 1, 0).getDate();
                const firstDay = new Date(calendarYear, mIdx, 1).getDay();
                
                return (
                  <div key={`cal-month-${month}`} className="flex flex-col">
                    <h6 className={cn("text-[10px] font-black mb-3 uppercase tracking-widest", isDark ? "text-white/60" : "text-neutral-600")}>{month}</h6>
                    <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <span key={`cal-header-${month}-${i}`} className={cn("text-[7px] font-bold text-center", isDark ? "text-white/20" : "text-neutral-300")}>{d}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5">
                      {[...Array(firstDay)].map((_, i) => (
                        <div key={`cal-empty-${month}-${i}`} className="aspect-square"></div>
                      ))}
                      {[...Array(daysInMonth)].map((_, dIdx) => {
                        const dayNum = dIdx + 1;
                        const dateStr = `${calendarYear}-${(mIdx + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                        const pnl = annualDailyPnL[dateStr];
                        const hasData = pnl !== undefined;
                        
                        let content = "";
                        let bgColor = isDark ? "bg-white/5 border border-white/5" : "bg-neutral-50 border border-neutral-100";
                        let textColor = isDark ? "text-white/20" : "text-neutral-300";
                        let shadow = "";

                        if (hasData) {
                          if (pnl > 0) {
                            content = `+${((pnl / initialBalance) * 100).toFixed(1)}%`;
                            bgColor = "bg-accent-green/20 border-accent-green/30 hover:bg-accent-green hover:border-accent-green";
                            shadow = "hover:shadow-[0_0_12px_rgba(0,255,65,0.3)]";
                            textColor = "text-accent-green group-hover:text-black";
                          } else if (pnl < 0) {
                            content = `${((pnl / initialBalance) * 100).toFixed(1)}%`;
                            bgColor = "bg-accent-red/20 border-accent-red/30 hover:bg-accent-red hover:border-accent-red";
                            textColor = "text-accent-red group-hover:text-white";
                          } else {
                            content = "0%";
                            bgColor = isDark ? "bg-white/20" : "bg-neutral-200";
                            textColor = isDark ? "text-white" : "text-black";
                          }
                        }

                        return (
                          <div 
                            key={`cal-day-${calendarYear}-${month}-${dayNum}`} 
                            onClick={() => handleDayClick(dateStr)}
                            className={cn(
                              "aspect-square rounded-md flex flex-col justify-between p-0.5 relative hover:scale-110 transition-transform cursor-pointer group",
                              bgColor, shadow
                            )}
                          >
                            <span className={cn("text-[5px] font-bold leading-none", textColor)}>{dayNum}</span>
                            {content && <span className={cn("text-[5px] font-black text-center truncate", textColor)}>{content}</span>}
                            
                            {/* Tooltip */}
                            <div className={cn(
                              "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 backdrop-blur-md border rounded text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50",
                              isDark ? "bg-black/90 border-white/10 text-white" : "bg-white/90 border-neutral-200 text-black"
                            )}>
                              {hasData ? `PnL: ${formatCurrency(pnl)}` : "No Data"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <DayTradeLogModal 
        isOpen={isDayLogModalOpen}
        onClose={() => setIsDayLogModalOpen(false)}
        date={selectedLogDate}
        trades={selectedLogTrades}
        isDark={isDark}
      />
    </div>

        {/* Footer */}
        <footer className={cn("px-8 pb-12 mt-auto transition-colors duration-300", isDark ? "bg-black" : "bg-neutral-50")}>
          <div className={cn("flex flex-col md:flex-row justify-between items-center py-8 border-t transition-all duration-300", isDark ? "border-white/10" : "border-neutral-200")}>
            <p className={cn("text-[10px] font-bold uppercase tracking-[0.3em]", isDark ? "text-white/40" : "text-neutral-500")}>© 2025 SOVEREIGN ANALYST OPS. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a className={cn("text-[10px] font-bold uppercase tracking-[0.2em] transition-colors", isDark ? "text-white/40 hover:text-accent-green" : "text-neutral-500 hover:text-black")} href="#">Privacy Protocol</a>
              <a className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-green transition-colors" href="#">API Status: Optimal</a>
            </div>
          </div>
        </footer>
      </div>
  );
}


function TopNavItem({ label, active = false, onClick }: { label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-3 py-1 text-sm font-bold transition-all rounded-lg",
        active 
          ? "text-accent-green border-b-2 border-accent-green" 
          : "text-white/60 hover:bg-white/5 hover:text-accent-green"
      )}
    >
      {label}
    </button>
  );
}

function MetricCard({ label, value, trend, icon, isDark }: { label: string, value: string, trend: string, icon: ReactNode, isDark: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={cn(
        "p-8 standard-card relative overflow-hidden group border transition-all duration-300",
        isDark ? "bg-white/5 border-white/10" : "bg-white border-neutral-200 shadow-sm"
      )}
    >
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <div className={isDark ? "text-white" : "text-black"}>{icon}</div>
      </div>
      <p className={cn("text-[10px] font-bold uppercase tracking-[0.2em] mb-2", isDark ? "text-white/40" : "text-neutral-500")}>{label}</p>
      <h3 className={cn("text-4xl font-black tracking-tighter", isDark ? "text-white" : "text-black")}>{value}</h3>
      <div className="mt-6 flex items-center gap-2 text-xs font-bold text-accent-green">
        <TrendingUp size={14} />
        <span>{trend}</span>
      </div>
    </motion.div>
  );
}

function StatsOverviewBox({ title, dateRange, children, isDark }: { title: string, dateRange?: string, children: ReactNode, isDark: boolean }) {
  return (
    <div className={cn(
      "p-8 standard-card border transition-all duration-300 relative",
      isDark ? "bg-white/5 border-white/10" : "bg-white border-neutral-200 shadow-sm"
    )}>
      <div className="flex justify-between items-start mb-8">
        <h5 className={cn("text-sm font-bold uppercase tracking-widest", isDark ? "text-white" : "text-black")}>{title}</h5>
        {dateRange && (
          <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-40 text-right", isDark ? "text-white" : "text-black")}>
            {dateRange}
          </span>
        )}
      </div>
      <div className="space-y-5">
        {children}
      </div>
    </div>
  );
}

function StatRow({ label, value, color, isDark }: { label: string, value: string, color?: string, isDark: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className={cn("text-xs font-medium", isDark ? "text-white/40" : "text-neutral-500")}>{label}</span>
      <span className={cn("text-sm font-bold", color || (isDark ? "text-white" : "text-black"))}>{value}</span>
    </div>
  );
}

function RadarChart({ title, data = [50, 50, 50], isDark, isPercentage = true }: { title: string, data?: number[], isDark: boolean, isPercentage?: boolean }) {
  const chartData = [
    { session: "Asia", value: data[2] },
    { session: "New York", value: data[1] },
    { session: "London", value: data[0] },
  ];

  const labels = ["LONDON", "NEW YORK", "ASIA"];

  return (
    <div 
      className={cn(
        "p-6 rounded-2xl flex flex-col items-center group/radar transition-all border overflow-hidden relative", 
        isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 shadow-sm hover:border-neutral-300"
      )}
    >
      <h5 className={cn("text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-center w-full truncate opacity-60", isDark ? "text-white" : "text-black")}>{title}</h5>
      
      <div className="w-full h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
            <PolarAngleAxis 
              dataKey="session" 
              tick={{ fill: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontSize: 8, fontWeight: 'bold' }}
            />
            <Radar
              name={title}
              dataKey="value"
              stroke="#00f5ff"
              fill="#00f5ff"
              fillOpacity={0.6}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderRadius: '8px',
                fontSize: '10px'
              }}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 w-full mt-6 pt-4 border-t border-white/5 gap-1">
        {labels.map((l, i) => (
          <div key={`label-${i}`} className="flex flex-col items-center min-w-0">
            <span className={cn("text-[7px] font-bold uppercase mb-0.5 truncate w-full text-center opacity-40", isDark ? "text-white" : "text-black")}>{l}</span>
            <span className={cn("text-[10px] font-black truncate", isDark ? "text-white" : "text-black")}>
              {isPercentage ? `${data[i]}%` : (data[i] / 20).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MonthlyCell: React.FC<{ 
  percent: string, 
  profit: string, 
  trades: number, 
  viewMode: "percent" | "profit" | "all", 
  isDark: boolean 
}> = ({ percent, profit, trades, viewMode, isDark }) => {
  return (
    <td className={cn(
      "p-4 rounded-xl border text-center transition-all duration-300 hover:bg-accent-green/20",
      isDark ? "bg-accent-green/5 border-accent-green/20" : "bg-white border-neutral-200 shadow-sm"
    )}>
      <div className="flex flex-col gap-0.5">
        {(viewMode === "percent" || viewMode === "all") && <span className="font-bold text-sm text-accent-green">{percent}</span>}
        {(viewMode === "profit" || viewMode === "all") && <span className="font-semibold text-[10px] text-accent-green/80">{profit}</span>}
      </div>
      <div className={cn("text-[8px] mt-1.5 font-bold uppercase", isDark ? "text-white/40" : "text-neutral-500")}>{trades} Trades</div>
    </td>
  );
};
