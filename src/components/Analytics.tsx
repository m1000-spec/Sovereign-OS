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
  Plus
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
  PolarRadiusAxis
} from 'recharts';
import { cn } from "@/src/lib/utils";
import MonthlyCalendar from "./MonthlyCalendar";

interface AnalyticsProps {
  onNavigate: (view: "dashboard" | "trades" | "analytics" | "reports" | "settings" | "daily-journal" | "landing" | "annotations") => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  openTradeModal: () => void;
}

export default function Analytics({ onNavigate, isDark, setIsDark, openTradeModal }: AnalyticsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [calendarYear, setCalendarYear] = useState(2025);
  const [viewMode, setViewMode] = useState<"percent" | "profit" | "all">("all");
  const [equityToggle, setEquityToggle] = useState<"equity" | "date">("date");
  const [hoveredScatterPoint, setHoveredScatterPoint] = useState<{ id: number, x: string, y: string, time: string, profit: string, type: 'win' | 'loss' } | null>(null);

  const equityData = [
    { trade: 0, value: 100000, date: "23/01/2024" },
    { trade: 12, value: 105000, date: "05/02/2024" },
    { trade: 25, value: 98500, date: "15/02/2024" },
    { trade: 40, value: 110000, date: "10/03/2024" },
    { trade: 55, value: 115000, date: "22/04/2024" },
    { trade: 68, value: 112000, date: "01/05/2024" },
    { trade: 82, value: 125000, date: "10/05/2024" },
    { trade: 95, value: 135000, date: "15/06/2024" },
    { trade: 110, value: 145000, date: "23/07/2024" },
    { trade: 125, value: 140000, date: "05/08/2024" },
    { trade: 140, value: 165000, date: "15/08/2024" },
    { trade: 155, value: 170000, date: "10/09/2024" },
    { trade: 170, value: 180000, date: "21/10/2024" },
    { trade: 185, value: 175000, date: "15/11/2024" },
    { trade: 200, value: 195000, date: "12/12/2024" },
    { trade: 215, value: 190000, date: "05/01/2025" },
    { trade: 225, value: 215000, date: "16/01/2025" },
    { trade: 230, value: 210000, date: "15/02/2025" },
    { trade: 232, value: 225000, date: "17/04/2025" },
    { trade: 234, value: 220000, date: "15/06/2025" },
    { trade: 236, value: 226776, date: "01/08/2025" },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const scatterPoints = [
    { id: 1, x: '20%', y: '30%', time: '24m', profit: '$145', type: 'win' as const },
    { id: 2, x: '45%', y: '15%', time: '56m', profit: '$320', type: 'win' as const },
    { id: 3, x: '70%', y: '40%', time: '1h 45m', profit: '$85', type: 'win' as const },
    { id: 4, x: '15%', y: '75%', time: '12m', profit: '-$110', type: 'loss' as const },
    { id: 5, x: '30%', y: '85%', time: '38m', profit: '-$190', type: 'loss' as const },
    { id: 6, x: '85%', y: '25%', time: '2h 15m', profit: '$210', type: 'win' as const },
    { id: 7, x: '55%', y: '60%', time: '1h 12m', profit: '$45', type: 'win' as const },
  ];

  useEffect(() => {
    // No manual dark mode activation here, handled by isDark prop
  }, []);

  return (
    <div className={cn("flex min-h-screen font-sans transition-colors duration-300", isDark ? "bg-black text-white selection:bg-accent-green selection:text-black" : "bg-white text-black selection:bg-black selection:text-white")}>
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 80 : 224 }}
        className={cn(
          "hidden md:flex flex-col h-screen fixed left-0 border-r z-40 transition-colors duration-300 overflow-hidden",
          isDark ? "bg-black border-white/10" : "bg-white border-neutral-200"
        )}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="mb-8 px-2 overflow-hidden">
            <h1 className={cn(
              "font-black italic tracking-tighter transition-all duration-300 leading-none", 
              isDark ? "text-white" : "text-black",
              isCollapsed ? "text-lg" : "text-xl"
            )}>
              {isCollapsed ? "SA" : "Sovereign Analyst"}
            </h1>
            {!isCollapsed && (
              <p className="text-[10px] mt-1 uppercase tracking-[0.2em] font-bold text-accent-green">
                Premium Tier
              </p>
            )}
          </div>

          <nav className="flex-1 space-y-2">
            <NavItem 
              icon={<LayoutDashboard size={18} />} 
              label="Dashboard" 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate("dashboard")}
              isDark={isDark} 
            />
            <NavItem 
              icon={<FileText size={18} />} 
              label="Daily Journal" 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate("daily-journal")}
              isDark={isDark} 
            />
            <NavItem 
              icon={<ArrowLeftRight size={18} />} 
              label="Trades" 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate("trades")}
              isDark={isDark} 
            />
            <NavItem 
              icon={<BarChart3 size={18} />} 
              label="Analytics" 
              active 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate("analytics")}
              isDark={isDark} 
            />
            <NavItem 
              icon={<ClipboardList size={18} />} 
              label="Reports" 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate("reports")}
              isDark={isDark} 
            />
            <NavItem 
              icon={<Tag size={18} />} 
              label="Annotations" 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate("annotations")}
              isDark={isDark} 
            />
          </nav>

          <div className="mt-auto space-y-2">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "w-full flex items-center justify-center py-3 transition-all duration-200 group rounded-xl",
                isDark ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-neutral-500 hover:text-black hover:bg-neutral-100"
              )}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <ChevronLeft size={18} className={cn("transition-transform duration-300", isCollapsed && "rotate-180")} />
            </button>

            <NavItem 
              icon={<Settings size={18} />} 
              label="Settings" 
              isCollapsed={isCollapsed}
              isDark={isDark} 
              onClick={() => onNavigate("settings")}
            />
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={cn("flex-1 flex flex-col transition-all duration-300", isCollapsed ? "md:ml-20" : "md:ml-56", isDark ? "bg-black" : "bg-neutral-50")}>
        {/* Top Header */}
        <header className={cn(
          "fixed top-0 right-0 z-50 flex justify-between items-center px-8 h-20 border-b backdrop-blur-md transition-all duration-300",
          isCollapsed ? "left-0 md:left-20" : "left-0 md:left-56",
          isDark ? "border-white/10 bg-black/80" : "border-neutral-200 bg-white/80"
        )}>
          <div className="flex items-center gap-4">
            <h2 className={cn("text-[10px] font-bold uppercase tracking-[0.3em] opacity-70", isDark ? "text-white" : "text-black")}>Analytics</h2>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDark(!isDark)}
              className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-neutral-100 text-black hover:bg-neutral-200"
              )}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openTradeModal}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all",
                isDark ? "bg-accent-green text-black hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]" : "bg-black text-white hover:bg-neutral-800 shadow-lg"
              )}
            >
              New Trade
            </motion.button>
          </div>
        </header>

        {/* Analytics Dashboard */}
        <div className="pt-24 px-4 md:px-8 pb-24 space-y-12 w-full">
          {/* Page Title Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-end gap-10 mb-12">
            <div className={cn("px-6 py-3 rounded-xl flex items-center gap-3 border backdrop-blur-sm", isDark ? "bg-white/5 border-white/10" : "bg-neutral-100 border-neutral-200")}>
              <Calendar size={16} className={isDark ? "text-accent-green" : "text-green-600"} />
              <span className={cn("text-[10px] font-bold uppercase tracking-[0.2em] opacity-60", isDark ? "text-white" : "text-black")}>Jan 01 — Aug 15, 2025</span>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <MetricCard 
              label="Account Balance" 
              value="$226,776.19" 
              trend="+$126,776.19 (126.78%)" 
              icon={<Wallet size={48} />}
              isDark={isDark}
            />
            <MetricCard 
              label="Win Rate" 
              value="62.39%" 
              trend="136W / 82L / 0BE" 
              icon={<Percent size={48} />}
              isDark={isDark}
            />
            <MetricCard 
              label="Sharpe Ratio" 
              value="7.63" 
              trend="Excellent Performance" 
              icon={<Activity size={48} />}
              isDark={isDark}
            />
            <MetricCard 
              label="Profit Factor" 
              value="3.50" 
              trend="$544.10 Avg Profit" 
              icon={<DollarSign size={48} />}
              isDark={isDark}
            />
          </div>

          {/* Equity Curve */}
          <div className={cn("p-8 rounded-xl border transition-all duration-300 h-[530px] flex flex-col", isDark ? "bg-white/5 border-white/10" : "bg-white border-neutral-200 shadow-sm")}>
            <div className="flex items-center justify-between mb-8">
              <h4 className={cn("text-xl font-sans font-bold uppercase tracking-tight", isDark ? "text-white" : "text-black")}>P&L By Time (Equity Curve)</h4>
              <div className="flex gap-4 items-center">
                <span className="flex items-center gap-2 text-xs font-bold text-accent-green">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-green shadow-[0_0_10px_#00FF41]"></span>
                  Cumulative P&L
                </span>
                <div className={cn("flex rounded-xl p-1 border transition-all duration-300", isDark ? "bg-black border-white/10" : "bg-neutral-100 border-neutral-200")}>
                  <button 
                    onClick={() => setEquityToggle("equity")}
                    className={cn("px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all", equityToggle === "equity" ? (isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm") : (isDark ? "text-white/40 hover:text-white" : "text-neutral-500 hover:text-black"))}
                  >
                    Equity
                  </button>
                  <button 
                    onClick={() => setEquityToggle("date")}
                    className={cn("px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all", equityToggle === "date" ? (isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm") : (isDark ? "text-white/40 hover:text-white" : "text-neutral-500 hover:text-black"))}
                  >
                    Date
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={equityData}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <StatsOverviewBox title="Overview" dateRange="Jan 01 — Aug 15, 2025" isDark={isDark}>
              <StatRow label="Total Trades" value="236" isDark={isDark} />
              <StatRow label="Missed Trades" value="15" isDark={isDark} />
              <StatRow label="Average RR" value="1.54" isDark={isDark} />
              <StatRow label="Average Trade Duration" value="1h 3m" isDark={isDark} />
              <StatRow label="Win Rate" value="49.32%" isDark={isDark} />
              <StatRow label="Average Profit/Loss" value="$244.23" isDark={isDark} />
            </StatsOverviewBox>
            <StatsOverviewBox title="Winning Trades" dateRange="Jan 01 — Aug 15, 2025" isDark={isDark}>
              <StatRow label="Total Winners" value="116" isDark={isDark} />
              <StatRow label="Average Trade Duration" value="1h 34m" isDark={isDark} />
              <StatRow label="Average Win Streak" value="2.06" isDark={isDark} />
              <StatRow label="Max Win Streak" value="6" isDark={isDark} />
              <StatRow label="Average Win" value="1.11%" color="text-accent-green" isDark={isDark} />
              <StatRow label="Best Win" value="2.49%" color="text-accent-green" isDark={isDark} />
            </StatsOverviewBox>
            <StatsOverviewBox title="Losing Trades" dateRange="Jan 01 — Aug 15, 2025" isDark={isDark}>
              <StatRow label="Total Losers" value="120" isDark={isDark} />
              <StatRow label="Average Trade Duration" value="34m" isDark={isDark} />
              <StatRow label="Average Loss Streak" value="2.11" isDark={isDark} />
              <StatRow label="Max Loss Streak" value="9" isDark={isDark} />
              <StatRow label="Average Loss" value="-0.59%" color="text-accent-red" isDark={isDark} />
              <StatRow label="Worst Loss" value="-1.19%" color="text-accent-red" isDark={isDark} />
            </StatsOverviewBox>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 items-start">
            <RadarChart title="Profit By Session" data={[70, 85, 40]} isDark={isDark} />
            <RadarChart title="Win Rate By Session" data={[60, 75, 55]} isDark={isDark} />
            <RadarChart title="Trades By Session" data={[80, 65, 90]} isDark={isDark} />
            <RadarChart title="Avg Profitable RR" data={[50, 90, 60]} isDark={isDark} />
          </div>

          {/* Bar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className={cn("p-6 rounded-xl border transition-all duration-300", isDark ? "bg-white/5 border-white/10" : "bg-white border-neutral-200 shadow-sm")}>
              <div className="flex justify-between items-center mb-6">
                <h5 className={cn("text-sm font-bold uppercase tracking-widest", isDark ? "text-white" : "text-black")}>P&L By Time (30m Interval)</h5>
                <div className={cn("flex rounded-xl p-0.5 border transition-all duration-300", isDark ? "bg-black border-white/10" : "bg-neutral-100 border-neutral-200")}>
                  <button className={cn("px-2 py-1 text-[8px] font-bold uppercase rounded-lg transition-all", isDark ? "text-white/40" : "text-neutral-500")}>30m</button>
                  <button className={cn("px-2 py-1 text-[8px] font-bold uppercase rounded-lg transition-all", isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm")}>1h</button>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-48 px-2">
                {[25, 45, 15, 35, 75, 95, 85, 50, 20, 50].map((h, i) => (
                  <div 
                    key={`bar-time-${i}`} 
                    className={cn(
                      "flex-1 transition-colors rounded-none",
                      i === 3 || i === 9 
                        ? "bg-accent-red/40 hover:bg-accent-red" 
                        : "bg-accent-green/20 hover:bg-accent-green"
                    )} 
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
              <div className={cn("flex justify-between mt-4 text-[9px] font-bold uppercase tracking-tighter", isDark ? "text-white/40" : "text-neutral-500")}>
                <span>08:00</span>
                <span>10:00</span>
                <span>12:00</span>
                <span>14:00</span>
                <span>16:00</span>
                <span>18:00</span>
                <span>20:00</span>
              </div>
            </div>

            <div className={cn("p-6 rounded-xl border transition-all duration-300", isDark ? "bg-white/5 border-white/10" : "bg-white border-neutral-200 shadow-sm")}>
              <div className="flex justify-between items-center mb-6">
                <h5 className={cn("text-sm font-bold uppercase tracking-widest", isDark ? "text-white" : "text-black")}>P&L By Day</h5>
                <div className={cn("flex rounded-xl p-0.5 border transition-all duration-300", isDark ? "bg-black border-white/10" : "bg-neutral-100 border-neutral-200")}>
                  <button className={cn("px-2 py-1 text-[8px] font-bold uppercase rounded-lg transition-all", isDark ? "text-white/40" : "text-neutral-500")}>Separate</button>
                  <button className={cn("px-2 py-1 text-[8px] font-bold uppercase rounded-lg transition-all", isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm")}>Total</button>
                </div>
              </div>
              <div className="flex items-end gap-4 h-48 px-6">
                {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day, i) => {
                  const heights = [65, 80, 70, 95, 75];
                  return (
                    <div key={`bar-day-${day}`} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div 
                        className="w-full rounded-none transition-colors cursor-pointer bg-accent-green/80 hover:bg-accent-green shadow-[0_0_15px_rgba(0,255,65,0.2)]"
                        style={{ height: `${heights[i]}%` }}
                      ></div>
                      <span className={cn("text-[9px] font-bold", isDark ? "text-white/40" : "text-neutral-500")}>{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Scatter Plot & Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className={cn("p-6 rounded-xl border transition-all duration-300", isDark ? "bg-white/5 border-white/10" : "bg-white border-neutral-200 shadow-sm")}>
              <div className="flex justify-between items-center mb-6">
                <h5 className={cn("text-sm font-bold uppercase tracking-widest", isDark ? "text-white" : "text-black")}>Profit By Time Held</h5>
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
              <div className={cn("h-64 w-full relative border-l border-b px-2 pb-2 transition-all duration-300", isDark ? "border-white/10" : "border-neutral-200")}>
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
                        point.id === 2 ? "w-2.5 h-2.5" : point.id === 3 ? "w-1.5 h-1.5" : "w-2 h-2"
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
                  <span>1h 4m</span>
                  <span>2h 8m</span>
                  <span>2h 40m</span>
                </div>
                <div className={cn("absolute -left-8 top-1/2 -rotate-90 text-[8px] font-bold uppercase whitespace-nowrap", isDark ? "text-white/40" : "text-neutral-500")}>Profit ($)</div>
              </div>
            </div>

            <div className={cn("p-6 rounded-xl border transition-all duration-300", isDark ? "bg-white/5 border-white/10" : "bg-white border-neutral-200 shadow-sm")}>
              <div className="flex justify-between items-center mb-6">
                <h5 className={cn("text-sm font-bold uppercase tracking-widest", isDark ? "text-white" : "text-black")}>Trade Distribution by Day</h5>
              </div>
              <div className={cn("flex items-end gap-3 h-64 px-2 border-b transition-all duration-300", isDark ? "border-white/10" : "border-neutral-200")}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
                  const heights = [5, 70, 85, 75, 82, 92, 5];
                  const isLow = i === 0 || i === 6;
                  return (
                    <div key={`dist-day-${day}`} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div 
                        className={cn(
                          "w-full rounded-none transition-colors",
                          isLow 
                            ? "bg-accent-red/20 border-t-2 border-accent-red" 
                            : "bg-[#00BCD4]/80 hover:bg-[#00BCD4]"
                        )} 
                        style={{ height: `${heights[i]}%` }}
                      ></div>
                      <span className={cn("text-[9px] font-bold mt-2", isDark ? "text-white/40" : "text-neutral-500")}>{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Monthly Calendar Section */}
          <MonthlyCalendar isDark={isDark} />

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
                  <tr className="group">
                    <td className={cn("py-4 px-4 font-sans font-black text-lg", isDark ? "text-white" : "text-black")}>2025</td>
                    <MonthlyCell percent="+6.64%" profit="+$15.1k" trades={13} viewMode={viewMode} isDark={isDark} />
                    <MonthlyCell percent="+3.63%" profit="+$8.2k" trades={12} viewMode={viewMode} isDark={isDark} />
                    <MonthlyCell percent="+4.59%" profit="+$10.4k" trades={11} viewMode={viewMode} isDark={isDark} />
                    <MonthlyCell percent="+9.60%" profit="+$21.8k" trades={9} viewMode={viewMode} isDark={isDark} />
                    <MonthlyCell percent="+9.59%" profit="+$21.7k" trades={13} viewMode={viewMode} isDark={isDark} />
                    <MonthlyCell percent="+5.03%" profit="+$11.4k" trades={11} viewMode={viewMode} isDark={isDark} />
                    <MonthlyCell percent="+7.81%" profit="+$17.7k" trades={14} viewMode={viewMode} isDark={isDark} />
                    <MonthlyCell percent="+2.07%" profit="+$4.7k" trades={8} viewMode={viewMode} isDark={isDark} />
                    {[...Array(4)].map((_, i) => (
                      <td key={`empty-${i}`} className={cn("p-4 rounded-xl border text-center opacity-30 text-xs transition-all duration-300", isDark ? "bg-white/5 border-white/5 text-white/40" : "bg-neutral-50 border-neutral-100 text-neutral-400")}>—</td>
                    ))}
                    <td className="py-4 px-4 text-right text-accent-green font-black text-lg">48.95%</td>
                  </tr>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, mIdx) => (
                <div key={`cal-month-${month}`} className="flex flex-col">
                  <h6 className={cn("text-[11px] font-black mb-4 uppercase tracking-widest", isDark ? "text-white/60" : "text-neutral-600")}>{month}</h6>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <span key={`cal-header-${month}-${i}`} className={cn("text-[8px] font-bold text-center", isDark ? "text-white/20" : "text-neutral-300")}>{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {[...Array(31)].map((_, dIdx) => {
                      const dayNum = dIdx + 1;
                      const seed = (calendarYear * 1000) + (mIdx * 40) + dayNum;
                      const r = (Math.sin(seed) + 1) / 2;
                      const hasData = (calendarYear === 2024) || (calendarYear === 2025 && mIdx <= 7);
                      
                      let content = "";
                      let bgColor = isDark ? "bg-white/5 border border-white/5" : "bg-neutral-50 border border-neutral-100";
                      let textColor = isDark ? "text-white/20" : "text-neutral-300";
                      let shadow = "";

                      if (hasData) {
                        if (r > 0.8) {
                          content = `+${(r * 3.5 + 0.5).toFixed(1)}%`;
                          bgColor = "bg-accent-green/20 border-accent-green/30 hover:bg-accent-green hover:border-accent-green";
                          shadow = "hover:shadow-[0_0_12px_rgba(0,255,65,0.3)]";
                          textColor = "text-accent-green group-hover:text-black";
                        } else if (r > 0.65) {
                          content = `-${(r * 2.5 + 0.2).toFixed(1)}%`;
                          bgColor = "bg-accent-red/20 border-accent-red/30 hover:bg-accent-red hover:border-accent-red";
                          textColor = "text-accent-red group-hover:text-white";
                        }
                      }

                      return (
                        <div 
                          key={`cal-day-${calendarYear}-${month}-${dayNum}`} 
                          className={cn(
                            "aspect-square rounded-xl flex flex-col justify-between p-1 relative hover:scale-110 transition-transform cursor-pointer group",
                            bgColor, shadow
                          )}
                        >
                          <span className={cn("text-[7px] font-bold leading-none", textColor)}>{dayNum}</span>
                          {content && <span className={cn("text-[7px] font-black text-center truncate", textColor)}>{content}</span>}
                          
                          {/* Tooltip */}
                          <div className={cn(
                            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 backdrop-blur-md border rounded text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50",
                            isDark ? "bg-black/90 border-white/10 text-white" : "bg-white/90 border-neutral-200 text-black"
                          )}>
                            {content ? `PnL: ${content}` : "No Data"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick, isDark, isCollapsed }: { icon: ReactNode, label: string, active?: boolean, onClick?: () => void, isDark: boolean, isCollapsed?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center transition-all duration-200 group rounded-xl overflow-hidden whitespace-nowrap",
        isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3",
        active 
          ? (isDark ? "bg-white/10 text-accent-green" : "bg-neutral-100 text-black font-bold")
          : (isDark ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-neutral-500 hover:text-black hover:bg-neutral-100")
      )}
    >
      <span className={cn(
        "transition-colors shrink-0",
        active ? "text-accent-green" : "group-hover:text-accent-green"
      )}>
        {icon}
      </span>
      {!isCollapsed && <span className="text-sm font-medium tracking-tight">{label}</span>}
    </button>
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
      <div className={cn("mt-6 flex items-center gap-2 text-xs font-bold", isDark ? "text-accent-green" : "text-green-600")}>
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

function RadarChart({ title, data = [50, 50, 50], isDark }: { title: string, data?: number[], isDark: boolean }) {
  const radarData = [
    { subject: 'Ldn', A: data[0], fullMark: 100 },
    { subject: 'Ny', A: data[1], fullMark: 100 },
    { subject: 'Other', A: data[2], fullMark: 100 },
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
      
      <div className="relative w-full aspect-square max-h-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid 
              stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} 
              gridType="polygon"
            />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", fontSize: 10, fontWeight: 'bold' }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false} 
              axisLine={false} 
            />
            <Radar
              name={title}
              dataKey="A"
              stroke="#00f5ff"
              fill="#00f5ff"
              fillOpacity={0.3}
              dot={{ r: 3, fill: '#00f5ff', fillOpacity: 1 }}
              activeDot={{ r: 5, fill: '#00f5ff', stroke: 'white', strokeWidth: 2 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderRadius: '8px',
                backdropFilter: 'blur(8px)',
                border: '1px solid',
                fontSize: '10px'
              }}
              itemStyle={{ color: '#00f5ff', fontWeight: 'bold' }}
              labelStyle={{ color: isDark ? 'white' : 'black', fontWeight: 'bold', marginBottom: '4px' }}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 w-full mt-6 pt-4 border-t border-white/5 gap-1">
        {labels.map((l, i) => (
          <div key={`label-${i}`} className="flex flex-col items-center min-w-0">
            <span className={cn("text-[7px] font-bold uppercase mb-0.5 truncate w-full text-center opacity-40", isDark ? "text-white" : "text-black")}>{l}</span>
            <span className={cn("text-[10px] font-black truncate", isDark ? "text-white" : "text-black")}>{data[i]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyCell({ percent, profit, trades, viewMode, isDark }: { percent: string, profit: string, trades: number, viewMode: "percent" | "profit" | "all", isDark: boolean }) {
  return (
    <td className={cn(
      "p-4 rounded-xl border text-center transition-all duration-300 hover:bg-accent-green/20",
      isDark ? "bg-accent-green/5 border-accent-green/20" : "bg-white border-neutral-200 shadow-sm"
    )}>
      <div className="flex flex-col gap-0.5">
        {(viewMode === "percent" || viewMode === "all") && <span className={cn("font-bold text-sm", isDark ? "text-accent-green" : "text-green-600")}>{percent}</span>}
        {(viewMode === "profit" || viewMode === "all") && <span className={cn("font-semibold text-[10px]", isDark ? "text-accent-green/80" : "text-green-700")}>{profit}</span>}
      </div>
      <div className={cn("text-[8px] mt-1.5 font-bold uppercase", isDark ? "text-white/40" : "text-neutral-500")}>{trades} Trades</div>
    </td>
  );
}
