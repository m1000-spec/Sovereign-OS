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
  Moon
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

interface ReportsProps {
  onNavigate: (view: "dashboard" | "trades" | "analytics" | "reports" | "settings" | "daily-journal" | "landing" | "annotations") => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  openTradeModal: () => void;
}

export default function Reports({ onNavigate, isDark, setIsDark, openTradeModal }: ReportsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Time");
  const [timeInterval, setTimeInterval] = useState("1hr");
  const [hoveredBar, setHoveredBar] = useState<{ type: 'pl' | 'dist', index: number, value: string, time: string } | null>(null);

  // Simulated data multiplier based on time interval
  const getMultiplier = () => {
    switch(timeInterval) {
      case "1hr": return 1;
      case "30m": return 0.7;
      case "15M": return 0.4;
      case "10m": return 0.3;
      case "5m": return 0.15;
      default: return 1;
    }
  };

  const multiplier = getMultiplier();

  const dayData = {
    pl: [0, 55, 95, 75, 50, 35, 0], // Sun-Sat
    dist: [0, 90, 72, 82, 74, 70, 0], // Sun-Sat
    summary: [
      { label: "Best Day", value: "Tuesday", subValue: "$35,043.78", color: "text-[#00FF41]" },
      { label: "Worst Day", value: "Friday", subValue: "$13,001.04", color: "text-[#E01E37]" },
      { label: "Most Trades", value: "Monday", subValue: "54 Trades", color: "text-[#00E5FF]" },
      { label: "Least Trades", value: "Tuesday", subValue: "43 Trades", color: "text-[#00E5FF]" },
    ],
    overview: [
      { day: "Monday", trades: 54, profit: "$20,031.81", winRate: "52%", wlb: "28W-26L" },
      { day: "Tuesday", trades: 43, profit: "$35,043.78", winRate: "72%", wlb: "31W-12L" },
      { day: "Wednesday", trades: 49, profit: "$26,721.35", winRate: "55%", wlb: "27W-22L" },
      { day: "Thursday", trades: 44, profit: "$17,928.35", winRate: "55%", wlb: "24W-20L" },
      { day: "Friday", trades: 40, profit: "$13,001.04", winRate: "50%", wlb: "20W-20L" },
    ]
  };

  const monthData = {
    pl: [45, 45, 60, 25, 100, 85, 82, 30, 2, 10, 22, 28], // Jan-Dec
    dist: [85, 95, 65, 80, 75, 82, 72, 35, 45, 50, 40, 45], // Jan-Dec
    summary: [
      { label: "Best Month", value: "May", subValue: "$15,796.32", color: "text-[#00FF41]" },
      { label: "Worst Month", value: "September", subValue: "$204.69", color: "text-[#E01E37]" },
      { label: "Most Trades", value: "February", subValue: "31 Trades", color: "text-[#00E5FF]" },
      { label: "Least Trades", value: "August", subValue: "12 Trades", color: "text-[#00E5FF]" },
    ],
    overview: [
      { month: "January", trades: 29, profit: "$7,468.22", winRate: "48%", wlb: "14W-15L" },
      { month: "February", trades: 31, profit: "$7,415.16", winRate: "48%", wlb: "15W-16L" },
      { month: "March", trades: 24, profit: "$9,821.45", winRate: "58%", wlb: "14W-10L" },
      { month: "April", trades: 28, profit: "$4,102.33", winRate: "42%", wlb: "12W-16L" },
      { month: "May", trades: 26, profit: "$15,796.32", winRate: "73%", wlb: "19W-7L" },
    ]
  };

  const symbolData = {
    pl: [85, 62, 45, 38, 55], 
    dist: [95, 72, 58, 44, 68], 
    summary: [
      { label: "Best Symbol", value: "GBPUSD", subValue: "$83,154.66", color: "text-[#00FF41]" },
      { label: "Worst Symbol", value: "EURUSD", subValue: "$12,450.21", color: "text-[#E01E37]" },
      { label: "Most Trades", value: "GBPUSD", subValue: "244 Trades", color: "text-[#00E5FF]" },
      { label: "Least Trades", value: "USDJPY", subValue: "42 Trades", color: "text-[#00E5FF]" },
    ],
    overview: [
      { symbol: "GBPUSD", trades: 244, profit: "$83,154.66", winRate: "54%", wlb: "131W-113L" },
      { symbol: "EURUSD", trades: 156, profit: "$42,154.66", winRate: "48%", wlb: "75W-81L" },
      { symbol: "NAS100", trades: 98, profit: "$28,721.35", winRate: "52%", wlb: "51W-47L" },
      { symbol: "XAUUSD", trades: 64, profit: "$15,928.35", winRate: "45%", wlb: "29W-35L" },
      { symbol: "USDJPY", trades: 42, profit: "$12,001.04", winRate: "50%", wlb: "21W-21L" },
    ]
  };

  const tagsData = {
    pl: [65, 45, 85, 35], 
    dist: [75, 85, 65, 95], 
    summary: [
      { label: "Best Tag", value: "Trend", subValue: "$42,154.66", color: "text-[#00FF41]" },
      { label: "Worst Tag", value: "Counter", subValue: "$12,154.66", color: "text-[#E01E37]" },
      { label: "Most Trades", value: "Trend", subValue: "156 Trades", color: "text-[#00E5FF]" },
      { label: "Least Trades", value: "Range", subValue: "45 Trades", color: "text-[#00E5FF]" },
    ],
    overview: [
      { tag: "Trend", trades: 156, profit: "$42,154.66", winRate: "62%", wlb: "97W-59L" },
      { tag: "Counter", trades: 88, profit: "$12,154.66", winRate: "45%", wlb: "40W-48L" },
      { tag: "Scalp", trades: 124, profit: "$28,154.66", winRate: "55%", wlb: "68W-56L" },
      { tag: "Range", trades: 45, profit: "$8,154.66", winRate: "40%", wlb: "18W-27L" },
    ]
  };

  const setupsData = {
    pl: [95, 75, 55, 42], 
    dist: [85, 65, 95, 58], 
    summary: [
      { label: "Best Setup", value: "Breakout", subValue: "$56,154.66", color: "text-[#00FF41]" },
      { label: "Worst Setup", value: "Reversal", subValue: "$23,154.66", color: "text-[#E01E37]" },
      { label: "Most Trades", value: "Breakout", subValue: "188 Trades", color: "text-[#00E5FF]" },
      { label: "Least Trades", value: "Pullback", subValue: "76 Trades", color: "text-[#00E5FF]" },
    ],
    overview: [
      { setup: "Breakout", trades: 188, profit: "$56,154.66", winRate: "58%", wlb: "109W-79L" },
      { setup: "Pullback", trades: 76, profit: "$32,154.66", winRate: "52%", wlb: "40W-36L" },
      { setup: "Reversal", trades: 94, profit: "$23,154.66", winRate: "48%", wlb: "45W-49L" },
      { setup: "Trend", trades: 112, profit: "$41,154.66", winRate: "60%", wlb: "67W-45L" },
    ]
  };

  const overviewData = [
    { time: "07:00", trades: 27, profit: "$16275.60", winRate: "59%", wlb: "16W-11L" },
    { time: "08:00", trades: 26, profit: "$21344.47", winRate: "73%", wlb: "19W-7L" },
    { time: "09:00", trades: 23, profit: "$8689.15", winRate: "57%", wlb: "13W-10L" },
    { time: "10:00", trades: 23, profit: "$14687.76", winRate: "52%", wlb: "12W-11L" },
    { time: "11:00", trades: 35, profit: "$13288.04", winRate: "60%", wlb: "21W-14L" },
    { time: "12:00", trades: 29, profit: "$3570.40", winRate: "45%", wlb: "13W-16L" },
    { time: "13:00", trades: 22, profit: "$1102.77", winRate: "50%", wlb: "11W-11L" },
    { time: "14:00", trades: 26, profit: "$16891.70", winRate: "62%", wlb: "16W-10L" },
    { time: "15:00", trades: 19, profit: "$16496.42", winRate: "74%", wlb: "14W-5L" },
    { time: "16:00", trades: 23, profit: "$10083.58", winRate: "48%", wlb: "11W-12L" },
  ];

  useEffect(() => {
    // Global theme management is handled in App.tsx
  }, []);

  return (
    <div className={cn(
      "flex min-h-screen font-body selection:bg-accent-green selection:text-black transition-colors duration-500",
      isDark ? "bg-black text-white" : "bg-white text-black"
    )}>
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
              isCollapsed={isCollapsed}
              onClick={() => onNavigate("analytics")}
              isDark={isDark} 
            />
            <NavItem 
              icon={<ClipboardList size={18} />} 
              label="Reports" 
              active 
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
      <main className={cn("flex-1 flex flex-col transition-all duration-300", isCollapsed ? "md:ml-20" : "md:ml-56", isDark ? "bg-black" : "bg-white")}>
        <header className={cn(
          "fixed top-0 right-0 z-50 flex justify-between items-center px-8 h-20 border-b backdrop-blur-md transition-all duration-300",
          isCollapsed ? "left-0 md:left-20" : "left-0 md:left-56",
          isDark ? "border-white/10 bg-black/80" : "border-neutral-200 bg-white/80"
        )}>
          <div className="flex items-center gap-4">
            <h2 className={cn("text-[10px] font-bold uppercase tracking-[0.3em] opacity-70", isDark ? "text-white" : "text-black")}>Reports</h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDark(!isDark)}
              className={cn(
                "p-2 rounded-xl transition-all",
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

        <div className="w-full space-y-8 pt-24 px-4 md:px-8 pb-24">
          {/* Title Section */}
          <div className="flex flex-col md:flex-row justify-end items-end gap-10 mb-8">
            <div className="flex gap-3">
              <div className={cn("px-6 py-3 border rounded-xl flex items-center gap-3 backdrop-blur-sm", isDark ? "bg-white/5 border-white/10" : "bg-neutral-100 border-neutral-200")}>
                <div className={cn("w-2 h-2 rounded-full animate-pulse", isDark ? "bg-accent-green" : "bg-green-500")}></div>
                <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-60", isDark ? "text-white" : "text-black")}>Live Market</span>
              </div>
              <div className={cn("px-6 py-3 border rounded-xl backdrop-blur-sm", isDark ? "bg-white/5 border-white/10" : "bg-neutral-100 border-neutral-200")}>
                <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-60", isDark ? "text-white" : "text-black")}>Oct 24, 2024</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <div className="flex flex-wrap items-center gap-3">
              {["Time", "Day", "Month", "Symbol", "Tags", "Setups"].map((filter) => (
                <motion.button 
                  key={filter}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "px-6 py-2.5 text-[10px] font-bold rounded-xl uppercase tracking-widest transition-all border",
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
                  "appearance-none border py-3 pl-6 pr-14 rounded-xl text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-accent-green cursor-pointer transition-all",
                  isDark ? "bg-[#111111] border-[#222222] text-white hover:border-[#444444]" : "bg-white border-neutral-200 text-black hover:border-neutral-300 hover:shadow-sm"
                )}
              >
                <option value="1hr">1hr</option>
                <option value="30m">30m</option>
                <option value="15M">15M</option>
                <option value="10m">10m</option>
                <option value="5m">5m</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-[#888888]">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {activeFilter === "Time" ? (
              <>
                {/* P&L By Time */}
                <div className={cn(
                  "rounded-2xl border p-8 flex flex-col min-h-[520px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Performance Matrix</h2>
                      <p className={cn("text-xl font-serif italic leading-none", isDark ? "text-white" : "text-black")}>P&L By Time Interval</p>
                    </div>
                    <div className={cn("flex rounded-xl p-1 border shadow-inner", isDark ? "bg-black border-white/5" : "bg-neutral-100 border-neutral-200")}>
                      <button className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-neutral-500 rounded-lg hover:text-white transition-colors">Separate</button>
                      <button className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-[#00FF41] text-black rounded-lg shadow-lg font-black">Total</button>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>${(22.0 * multiplier).toFixed(1)}k</span>
                      <span>${(16.5 * multiplier).toFixed(1)}k</span>
                      <span>${(11.0 * multiplier).toFixed(1)}k</span>
                      <span>${(5.5 * multiplier).toFixed(1)}k</span>
                      <span className="text-neutral-400">$0.0</span>
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-end px-3 pt-6 gap-[4px] rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50"
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-3 gap-[4px] pointer-events-none">
                        {[...Array(24)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-r h-full last:border-r-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-t w-full first:border-t-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      
                      {/* Bars */}
                      {[0, 0, 0, 0, 0, 0, 0, 75, 95, 45, 65, 55, 25, 15, 75, 65, 45, 0, 0, 0, 0, 0, 0, 0].map((h, i) => (
                        <div 
                          key={`pl-bar-${i}`}
                          onMouseEnter={() => setHoveredBar({ type: 'pl', index: i, value: `$${(h * 220 * multiplier).toFixed(2)}`, time: `${i.toString().padStart(2, '0')}:00` })}
                          onMouseLeave={() => setHoveredBar(null)}
                          className="flex-1 bg-gradient-to-t from-[#00FF41]/20 to-[#00FF41] hover:from-[#00FF41]/40 hover:to-[#00FF41] rounded-t-[2px] transition-all duration-300 relative group cursor-crosshair z-10"
                          style={{ height: `${h}%` }}
                        >
                          {hoveredBar?.type === 'pl' && hoveredBar.index === i && (
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
                  {/* X-Axis Labels */}
                  <div className="flex ml-24 mt-8 h-8 items-start">
                    <div className="flex-grow flex justify-between px-3">
                      {["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"].map((time, i) => (
                        <span key={`pl-label-${i}`} className="text-[9px] font-mono font-black text-neutral-600 uppercase tracking-widest">{time}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Trade Distribution By Time */}
                <div className={cn(
                  "rounded-2xl border p-8 flex flex-col min-h-[520px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Volume Analysis</h2>
                      <p className={cn("text-xl font-serif italic leading-none", isDark ? "text-white" : "text-black")}>Trade Distribution</p>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>{(36.0 * multiplier).toFixed(1)}</span>
                      <span>{(27.0 * multiplier).toFixed(1)}</span>
                      <span>{(18.0 * multiplier).toFixed(1)}</span>
                      <span>{(9.0 * multiplier).toFixed(1)}</span>
                      <span className="text-neutral-400">0.0</span>
                    </div>
                    <div className={cn(
                      "relative flex-grow border-l border-b flex items-end px-3 pt-6 gap-[4px] rounded-br-sm",
                      isDark ? "border-white/10 bg-white/[0.01]" : "border-neutral-200 bg-neutral-50/50"
                    )}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 flex px-3 gap-[4px] pointer-events-none">
                        {[...Array(24)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-r h-full last:border-r-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex-1 border-t w-full first:border-t-0", isDark ? "border-white/[0.03]" : "border-neutral-200/30")} />
                        ))}
                      </div>

                      {/* Bars */}
                      {[0, 0, 0, 0, 0, 0, 0, 75, 70, 60, 60, 95, 80, 65, 75, 55, 65, 0, 0, 0, 0, 0, 0, 0].map((h, i) => (
                        <div 
                          key={`dist-bar-${i}`}
                          onMouseEnter={() => setHoveredBar({ type: 'dist', index: i, value: Math.round(h * 0.36 * multiplier).toString(), time: `${i.toString().padStart(2, '0')}:00` })}
                          onMouseLeave={() => setHoveredBar(null)}
                          className="flex-1 bg-gradient-to-t from-[#00BCD4]/20 to-[#00BCD4] hover:from-[#00BCD4]/40 hover:to-[#00BCD4] rounded-t-[2px] transition-all duration-300 relative group cursor-crosshair z-10"
                          style={{ height: `${h}%` }}
                        >
                          {hoveredBar?.type === 'dist' && hoveredBar.index === i && (
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
                  {/* X-Axis Labels */}
                  <div className="flex ml-24 mt-8 h-8 items-start">
                    <div className="flex-grow flex justify-between px-3">
                      {["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"].map((time, i) => (
                        <span key={`dist-label-${i}`} className="text-[9px] font-mono font-black text-neutral-600 uppercase tracking-widest">{time}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : activeFilter === "Day" ? (
              <>
                {/* P&L By Day */}
                <div className={cn(
                  "rounded-2xl border p-8 flex flex-col min-h-[520px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Performance Matrix</h2>
                      <p className={cn("text-xl font-serif italic leading-none", isDark ? "text-white" : "text-black")}>P&L By Day of Week</p>
                    </div>
                    <div className={cn("flex rounded-xl p-1 border shadow-inner", isDark ? "bg-black border-white/5" : "bg-neutral-100 border-neutral-200")}>
                      <button className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-neutral-500 rounded-lg hover:text-white transition-colors">Separate</button>
                      <button className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-[#00FF41] text-black rounded-lg shadow-lg font-black">Total</button>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>$36.0k</span>
                      <span>$27.0k</span>
                      <span>$18.0k</span>
                      <span>$9.0k</span>
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
                          onMouseEnter={() => setHoveredBar({ type: 'pl', index: i, value: `$${(h * 360).toFixed(2)}`, time: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i] })}
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
                      <span>60.0</span>
                      <span>45.0</span>
                      <span>30.0</span>
                      <span>15.0</span>
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
                          onMouseEnter={() => setHoveredBar({ type: 'dist', index: i, value: Math.round(h * 0.6).toString(), time: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i] })}
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
                  "rounded-2xl border p-8 flex flex-col min-h-[520px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Performance Matrix</h2>
                      <p className={cn("text-xl font-serif italic leading-none", isDark ? "text-white" : "text-black")}>P&L By Month</p>
                    </div>
                    <div className={cn("flex rounded-xl p-1 border shadow-inner", isDark ? "bg-black border-white/5" : "bg-neutral-100 border-neutral-200")}>
                      <button className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-neutral-500 rounded-lg hover:text-white transition-colors">Separate</button>
                      <button className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-[#00FF41] text-black rounded-lg shadow-lg font-black">Total</button>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>$120.0k</span>
                      <span>$90.0k</span>
                      <span>$60.0k</span>
                      <span>$30.0k</span>
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
                          onMouseEnter={() => setHoveredBar({ type: 'pl', index: i, value: `$${(h * 1200).toFixed(2)}`, time: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i] })}
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
                  "rounded-2xl border p-8 flex flex-col min-h-[520px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Volume Analysis</h2>
                      <p className={cn("text-xl font-serif italic leading-none", isDark ? "text-white" : "text-black")}>By Month</p>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>200.0</span>
                      <span>150.0</span>
                      <span>100.0</span>
                      <span>50.0</span>
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
                          onMouseEnter={() => setHoveredBar({ type: 'dist', index: i, value: Math.round(h * 2).toString(), time: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i] })}
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
                  "rounded-2xl border p-8 flex flex-col min-h-[520px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Performance Matrix</h2>
                      <p className={cn("text-xl font-serif italic leading-none", isDark ? "text-white" : "text-black")}>P&L By Symbol</p>
                    </div>
                    <div className={cn("flex rounded-xl p-1 border shadow-inner", isDark ? "bg-black border-white/5" : "bg-neutral-100 border-neutral-200")}>
                      <button className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-neutral-500 rounded-lg hover:text-white transition-colors">Separate</button>
                      <button className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-[#00FF41] text-black rounded-lg shadow-lg font-black">Total</button>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>$50.0k</span>
                      <span>$37.5k</span>
                      <span>$25.0k</span>
                      <span>$12.5k</span>
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
                          onMouseEnter={() => setHoveredBar({ type: 'pl', index: i, value: `$${(h * 500).toFixed(2)}`, time: symbolData.overview[i]?.symbol || "N/A" })}
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
                  "rounded-2xl border p-8 flex flex-col min-h-[520px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Volume Analysis</h2>
                      <p className={cn("text-xl font-serif italic leading-none", isDark ? "text-white" : "text-black")}>By Symbol</p>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>100.0</span>
                      <span>75.0</span>
                      <span>50.0</span>
                      <span>25.0</span>
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
                          onMouseEnter={() => setHoveredBar({ type: 'dist', index: i, value: Math.round(h).toString(), time: symbolData.overview[i]?.symbol || "N/A" })}
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
                  "rounded-2xl border p-8 flex flex-col min-h-[520px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Performance Matrix</h2>
                      <p className={cn("text-xl font-serif italic leading-none", isDark ? "text-white" : "text-black")}>P&L By Tags</p>
                    </div>
                    <div className={cn("flex rounded-xl p-1 border shadow-inner", isDark ? "bg-black border-white/5" : "bg-neutral-100 border-neutral-200")}>
                      <button className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-neutral-500 rounded-lg hover:text-white transition-colors">Separate</button>
                      <button className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-[#00FF41] text-black rounded-lg shadow-lg font-black">Total</button>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>$40.0k</span>
                      <span>$30.0k</span>
                      <span>$20.0k</span>
                      <span>$10.0k</span>
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
                          onMouseEnter={() => setHoveredBar({ type: 'pl', index: i, value: `$${(h * 400).toFixed(2)}`, time: tagsData.overview[i]?.tag || "N/A" })}
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
                  "rounded-2xl border p-8 flex flex-col min-h-[520px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Volume Analysis</h2>
                      <p className={cn("text-xl font-serif italic leading-none", isDark ? "text-white" : "text-black")}>By Tags</p>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>80.0</span>
                      <span>60.0</span>
                      <span>40.0</span>
                      <span>20.0</span>
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
                          onMouseEnter={() => setHoveredBar({ type: 'dist', index: i, value: Math.round(h * 0.8).toString(), time: tagsData.overview[i]?.tag || "N/A" })}
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
                  "rounded-2xl border p-8 flex flex-col min-h-[520px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Performance Matrix</h2>
                      <p className={cn("text-xl font-serif italic leading-none", isDark ? "text-white" : "text-black")}>P&L By Setups</p>
                    </div>
                    <div className={cn("flex rounded-xl p-1 border shadow-inner", isDark ? "bg-black border-white/5" : "bg-neutral-100 border-neutral-200")}>
                      <button className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-neutral-500 rounded-lg hover:text-white transition-colors">Separate</button>
                      <button className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-[#00FF41] text-black rounded-lg shadow-lg font-black">Total</button>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>$45.0k</span>
                      <span>$33.7k</span>
                      <span>$22.5k</span>
                      <span>$11.2k</span>
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
                          onMouseEnter={() => setHoveredBar({ type: 'pl', index: i, value: `$${(h * 450).toFixed(2)}`, time: setupsData.overview[i]?.setup || "N/A" })}
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
                  "rounded-2xl border p-8 flex flex-col min-h-[520px] group transition-all duration-500",
                  isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
                )}>
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 font-mono">Volume Analysis</h2>
                      <p className={cn("text-xl font-serif italic leading-none", isDark ? "text-white" : "text-black")}>By Setups</p>
                    </div>
                  </div>
                  <div className="relative flex-grow flex">
                    <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pr-8 w-24 text-right z-10 py-2">
                      <span>90.0</span>
                      <span>67.5</span>
                      <span>45.0</span>
                      <span>22.5</span>
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
                          onMouseEnter={() => setHoveredBar({ type: 'dist', index: i, value: Math.round(h * 0.9).toString(), time: setupsData.overview[i]?.setup || "N/A" })}
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
              <>
                <SummaryCard label="Peak Performance" value="09:00" subValue="+$20,450" subColor="text-[#00FF41]" subBg={isDark ? "bg-[#00FF41]/10" : "bg-green-50"} isDark={isDark} />
                <SummaryCard label="Drawdown Zone" value="14:00" subValue="-$3,120" subColor="text-[#E01E37]" subBg={isDark ? "bg-[#E01E37]/10" : "bg-red-50"} isDark={isDark} />
                <SummaryCard label="High Volume" value="07:00" subValue="30 TRADES" subColor="text-neutral-400" subBg={isDark ? "bg-white/5" : "bg-neutral-100"} isDark={isDark} />
                <SummaryCard label="Low Volume" value="08:00" subValue="16 TRADES" subColor="text-neutral-400" subBg={isDark ? "bg-white/5" : "bg-neutral-100"} isDark={isDark} />
              </>
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
              "border rounded-2xl overflow-hidden group transition-colors",
              isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/10" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
            )}>
              <table className="w-full text-left border-collapse">
                <thead className={cn("border-b", isDark ? "bg-white/[0.02] border-white/5" : "bg-neutral-50 border-neutral-200")}>
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 font-serif italic">{activeFilter === "Day" ? "Day" : activeFilter === "Month" ? "Month" : activeFilter === "Symbol" ? "Symbol" : activeFilter === "Tags" ? "Tag" : activeFilter === "Setups" ? "Setup" : "Time"}</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 text-center font-serif italic">Total Trades</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 text-center font-serif italic">Net Profits</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 text-center font-serif italic">Win Rate</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 text-right font-serif italic">W-L-BE</th>
                  </tr>
                </thead>
                <tbody className={cn("divide-y", isDark ? "divide-white/5" : "divide-neutral-200")}>
                  {(activeFilter === "Day" ? dayData.overview : activeFilter === "Month" ? monthData.overview : activeFilter === "Symbol" ? symbolData.overview : activeFilter === "Tags" ? tagsData.overview : activeFilter === "Setups" ? setupsData.overview : overviewData).map((row: any, i) => (
                    <tr key={i} className={cn("transition-colors group/row", isDark ? "hover:bg-white/[0.03]" : "hover:bg-neutral-50")}>
                      <td className={cn("px-8 py-4 text-xs font-bold transition-colors", isDark ? "text-neutral-400 group-hover/row:text-white" : "text-neutral-600 group-hover/row:text-black")}>{activeFilter === "Day" ? row.day : activeFilter === "Month" ? row.month : activeFilter === "Symbol" ? row.symbol : activeFilter === "Tags" ? row.tag : activeFilter === "Setups" ? row.setup : row.time}</td>
                      <td className={cn("px-8 py-4 text-xs font-mono font-black text-center", isDark ? "text-neutral-300" : "text-neutral-600")}>{row.trades}</td>
                      <td className={cn("px-8 py-4 text-xs font-mono font-black text-center", isDark ? "text-[#00FF41]" : "text-green-600")}>{row.profit}</td>
                      <td className="px-8 py-4 text-xs font-bold text-center">
                        <div className="flex items-center justify-center gap-4">
                          <div className={cn("w-24 h-2 rounded-full overflow-hidden shadow-inner", isDark ? "bg-white/5" : "bg-neutral-100")}>
                            <div className="h-full bg-gradient-to-r from-[#00FF41]/40 to-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.3)]" style={{ width: row.winRate }}></div>
                          </div>
                          <span className={cn("text-[10px] font-mono font-black", isDark ? "text-neutral-300" : "text-neutral-600")}>{row.winRate}</span>
                        </div>
                      </td>
                      <td className={cn("px-8 py-4 text-xs font-mono font-black text-right transition-colors", isDark ? "text-neutral-500 group-hover/row:text-neutral-300" : "text-neutral-400 group-hover/row:text-neutral-600")}>{row.wlb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={openTradeModal}
          className={cn(
            "fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-50 transition-colors",
            isDark ? "bg-accent-green text-black hover:bg-accent-green-vibrant" : "bg-black text-white hover:bg-neutral-800"
          )}
        >
          <TrendingUp size={24} />
        </motion.button>
      </main>

      <style>{`
      `}</style>
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

function SummaryCard({ label, value, subValue, subColor, subBg, isDark }: { label: string, value: string, subValue: string, subColor: string, subBg: string, isDark: boolean, key?: any }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn(
        "border rounded-2xl p-8 flex flex-col justify-between h-40 transition-all duration-500 group relative overflow-hidden",
        isDark ? "bg-[#0a0a0a] border-white/5 hover:border-white/20" : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
      )}
    >
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full blur-3xl transition-colors duration-700",
        isDark ? "bg-white/[0.01] group-hover:bg-accent-green/5" : "bg-neutral-100 group-hover:bg-green-50"
      )} />
      
      <span className={cn("text-[10px] font-bold uppercase tracking-[0.3em] relative z-10 font-mono", isDark ? "text-neutral-500" : "text-neutral-400")}>{label}</span>
      <div className="flex justify-between items-end relative z-10">
        <span className={cn("text-4xl font-black tracking-tighter transition-colors duration-500 font-mono", isDark ? "text-white group-hover:text-accent-green" : "text-black group-hover:text-green-600")}>{value}</span>
        <div className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-2xl backdrop-blur-md border", subColor, subBg, isDark ? "border-white/5" : "border-neutral-200")}>
          {subValue}
        </div>
      </div>
    </motion.div>
  );
}
