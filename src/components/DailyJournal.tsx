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
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface DailyJournalProps {
  onNavigate: (view: "dashboard" | "trades" | "analytics" | "reports" | "settings" | "daily-journal" | "landing" | "annotations") => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  openTradeModal: () => void;
}

export default function DailyJournal({ onNavigate, isDark, setIsDark, openTradeModal }: DailyJournalProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpandedAll, setIsExpandedAll] = useState(true);
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({
    "2025-08-01": true,
    "2025-07-31": true,
    "2025-07-30": true
  });
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)); // July 2025

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleAll = () => {
    const newState = !isExpandedAll;
    setIsExpandedAll(newState);
    setExpandedEntries({
      "2025-08-01": newState,
      "2025-07-31": newState,
      "2025-07-30": newState
    });
  };

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
    
    const days = [];
    // Padding
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`pad-${i}`} className="aspect-square" />);
    }
    
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const isTradingDay = Math.random() > 0.7;
      const pnl = (Math.random() * 3 - 1).toFixed(1);
      const isPositive = parseFloat(pnl) >= 0;
      
      days.push(
        <div 
          key={day} 
          className={cn(
            "aspect-square flex items-center justify-center text-xs transition-all cursor-pointer rounded-xl",
            isTradingDay 
              ? cn(isDark ? "bg-white/5" : "bg-neutral-100", "text-[10px] font-bold", isPositive ? "text-accent-green" : "text-accent-red")
              : (isDark ? "text-white/20 hover:bg-white/5" : "text-neutral-300 hover:bg-neutral-100")
          )}
        >
          {isTradingDay ? (isPositive ? `+${pnl}` : pnl) : day}
        </div>
      );
    }
    return days;
  };

  return (
    <div className={cn("flex min-h-screen font-sans transition-colors duration-300", isDark ? "bg-black text-white" : "bg-white text-black")}>
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
              active 
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

      {/* Main Content Area */}
      <main className={cn("flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300", isCollapsed ? "md:ml-20" : "md:ml-56", isDark ? "bg-black" : "bg-neutral-50")}>
        <header className={cn(
          "fixed top-0 right-0 z-50 flex justify-between items-center px-8 h-20 border-b backdrop-blur-md transition-all duration-300",
          isCollapsed ? "left-0 md:left-20" : "left-0 md:left-56",
          isDark ? "border-white/10 bg-black/80" : "border-neutral-200 bg-white/80"
        )}>
          <div className="flex items-center gap-4">
            <h2 className={cn("text-[10px] font-bold uppercase tracking-[0.3em] opacity-70", isDark ? "text-white" : "text-black")}>Journal Archive</h2>
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

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="pt-24 px-4 md:px-8 pb-24 w-full">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Left Column: Journal Entries */}
              <div className="flex-1 space-y-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <p className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-white/40" : "text-neutral-500")}>
                      You have taken 0 trades so far this week
                    </p>
                  </div>
                  <button 
                    onClick={toggleAll}
                    className={cn(
                      "standard-button px-8 py-3 font-bold gap-3 rounded-xl border backdrop-blur-sm transition-all active:scale-95",
                      isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-neutral-100 border-neutral-200 text-black hover:bg-neutral-200"
                    )}
                  >
                    {isExpandedAll ? <ChevronsDownUp size={18} /> : <ChevronsUpDown size={18} />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {isExpandedAll ? "Collapse All" : "Expand All"}
                    </span>
                  </button>
                </div>

                <div className="space-y-12">
                  {/* Entry 1: Friday, 1 August 2025 */}
                  <JournalEntryBlock 
                    id="2025-08-01"
                    date="Friday, 1 August 2025"
                    isExpanded={expandedEntries["2025-08-01"]}
                    onToggle={() => toggleEntry("2025-08-01")}
                    isDark={isDark}
                    stats={{
                      totalTrades: "1",
                      grossPnl: "+$639.41",
                      pnlClass: "text-accent-green",
                      winners: "1",
                      losers: "0",
                      profitFactor: "MAX"
                    }}
                    trades={[
                      { time: "10:47 AM", instrument: "NAS100", side: "Buy", pnl: "+$639.41", pnlClass: "text-accent-green" }
                    ]}
                    chartPoint={{ x: 400, y: 45, color: "#00FF41", time: "10:47 AM", result: "+$639.41" }}
                  />

                  {/* Entry 2: Thursday, 31 July 2025 */}
                  <JournalEntryBlock 
                    id="2025-07-31"
                    date="Thursday, 31 July 2025"
                    isExpanded={expandedEntries["2025-07-31"]}
                    onToggle={() => toggleEntry("2025-07-31")}
                    isDark={isDark}
                    stats={{
                      totalTrades: "2",
                      grossPnl: "-$1,240.50",
                      pnlClass: "text-accent-red",
                      winners: "0",
                      losers: "2",
                      profitFactor: "0.00"
                    }}
                    trades={[
                      { time: "09:30 AM", instrument: "NAS100", side: "Sell", pnl: "-$840.50", pnlClass: "text-accent-red" },
                      { time: "02:15 PM", instrument: "GOLD", side: "Buy", pnl: "-$400.00", pnlClass: "text-accent-red" }
                    ]}
                    chartPoint={{ x: 200, y: 180, color: "#FF4D4D", time: "09:30 AM", result: "-$840.50" }}
                  />

                  {/* Entry 3: Wednesday, 30 July 2025 */}
                  <JournalEntryBlock 
                    id="2025-07-30"
                    date="Wednesday, 30 July 2025"
                    isExpanded={expandedEntries["2025-07-30"]}
                    onToggle={() => toggleEntry("2025-07-30")}
                    isDark={isDark}
                    stats={{
                      totalTrades: "3",
                      grossPnl: "+$2,150.20",
                      pnlClass: "text-accent-green",
                      winners: "2",
                      losers: "1",
                      profitFactor: "3.45"
                    }}
                    trades={[
                      { time: "08:15 AM", instrument: "NAS100", side: "Buy", pnl: "+$1,500.00", pnlClass: "text-accent-green" },
                      { time: "11:45 AM", instrument: "ES", side: "Sell", pnl: "-$350.00", pnlClass: "text-accent-red" },
                      { time: "03:30 PM", instrument: "NAS100", side: "Buy", pnl: "+$1,000.20", pnlClass: "text-accent-green" }
                    ]}
                    chartPoint={{ x: 600, y: 30, color: "#00FF41", time: "08:15 AM", result: "+$1,500.00" }}
                  />
                </div>
              </div>

              {/* Right Column: Calendar */}
              <div className="w-full lg:w-80 space-y-12">
                <div className={cn(
                  "border rounded-2xl p-8 space-y-12 transition-all",
                  isDark ? "bg-black border-white/10" : "bg-white border-neutral-200 shadow-sm"
                )}>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className={cn("font-black text-sm uppercase tracking-tight", isDark ? "text-white" : "text-black")}>
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </h3>
                      <div className="flex gap-2">
                        <ChevronUp 
                          size={20} 
                          className={cn("cursor-pointer transition-colors", isDark ? "text-white/20 hover:text-white" : "text-neutral-300 hover:text-black")} 
                          onClick={prevMonth}
                        />
                        <ChevronDown 
                          size={20} 
                          className={cn("cursor-pointer transition-colors", isDark ? "text-white/20 hover:text-white" : "text-neutral-300 hover:text-black")} 
                          onClick={nextMonth}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className={cn("text-[10px] font-bold mb-2 uppercase tracking-widest", isDark ? "text-white/20" : "text-neutral-400")}>{day}</div>
                      ))}
                      {renderCalendarDays()}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className={cn("text-[10px] font-bold uppercase tracking-widest mb-6", isDark ? "text-white/40" : "text-neutral-500")}>Monthly Performance</h4>
                      <div className="space-y-4">
                        <MonthlyStatRow label="Total Return" value="+5.6%" valueClass="text-accent-green" isDark={isDark} />
                        <MonthlyStatRow label="Win Rate" value="64%" isDark={isDark} />
                        <MonthlyStatRow label="Trading Days" value="12/21" isDark={isDark} />
                      </div>
                    </div>
                    <div className={cn("pt-8 border-t", isDark ? "border-white/10" : "border-neutral-100")}>
                      <button className={cn(
                        "standard-button w-full font-bold py-3 rounded-xl transition-all active:scale-95",
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

function StatRow({ label, value, isDark, valueClass = "text-white" }: { label: string, value: string, isDark: boolean, valueClass?: string }) {
  return (
    <div className={cn("flex justify-between items-end border-b pb-3", isDark ? "border-white/5" : "border-neutral-100")}>
      <span className={cn("text-[10px] font-bold uppercase tracking-widest", isDark ? "text-white/40" : "text-neutral-500")}>{label}</span>
      <span className={cn("text-xl font-black tracking-tight", valueClass || (isDark ? "text-white" : "text-black"))}>{value}</span>
    </div>
  );
}

function MonthlyStatRow({ label, value, isDark, valueClass = "text-white" }: { label: string, value: string, isDark: boolean, valueClass?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className={cn("text-[10px] font-bold uppercase tracking-widest", isDark ? "text-white/30" : "text-neutral-400")}>{label}</span>
      <span className={cn("text-xs font-bold", valueClass || (isDark ? "text-white" : "text-black"))}>{value}</span>
    </div>
  );
}

function JournalEntryBlock({ 
  date, 
  isExpanded, 
  onToggle, 
  isDark,
  stats, 
  trades, 
  chartPoint 
}: { 
  id: string,
  date: string, 
  isExpanded: boolean, 
  onToggle: () => void,
  isDark: boolean,
  stats: any,
  trades: any[],
  chartPoint: any
}) {
  return (
    <div className={cn(
      "standard-card overflow-hidden transition-all",
      isDark ? "bg-black border-white/10" : "bg-white border-neutral-200 shadow-sm"
    )}>
      <div 
        className={cn(
          "flex justify-between items-center px-8 py-6 cursor-pointer transition-all duration-300",
          isDark ? "hover:bg-white/5" : "hover:bg-neutral-50"
        )}
        onClick={onToggle}
      >
        <h3 className={cn("font-black text-sm uppercase tracking-[0.2em]", isDark ? "text-white" : "text-black")}>
          {date}
        </h3>
        <div className="flex items-center gap-6">
          <span className={cn("px-3 py-1 text-[10px] font-bold uppercase rounded-lg border", stats.pnlClass.includes('green') ? "bg-accent-green/10 border-accent-green/20" : "bg-accent-red/10 border-accent-red/20", stats.pnlClass)}>
            {stats.grossPnl}
          </span>
          <div className={cn("transition-transform duration-300", isExpanded ? "text-accent-green" : (isDark ? "text-white/20" : "text-neutral-300"))}>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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
            <div className={cn("lg:col-span-4 p-10 flex flex-col justify-center border-l", isDark ? "bg-black border-white/5" : "bg-neutral-50 border-neutral-200")}>
              <h4 className={cn("font-bold text-[10px] uppercase tracking-[0.3em] mb-10", isDark ? "text-white/40" : "text-neutral-500")}>Daily Statistics</h4>
              <div className="space-y-6">
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
                      <th className={cn("px-8 py-5 text-[10px] font-bold uppercase tracking-[0.3em]", isDark ? "text-white/40" : "text-neutral-500")}>Time</th>
                      <th className={cn("px-8 py-5 text-[10px] font-bold uppercase tracking-[0.3em]", isDark ? "text-white/40" : "text-neutral-500")}>Instrument</th>
                      <th className={cn("px-8 py-5 text-[10px] font-bold uppercase tracking-[0.3em] text-center", isDark ? "text-white/40" : "text-neutral-500")}>Side</th>
                      <th className={cn("px-8 py-5 text-[10px] font-bold uppercase tracking-[0.3em] text-right", isDark ? "text-white/40" : "text-neutral-500")}>PnL</th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y", isDark ? "divide-white/5" : "divide-neutral-100")}>
                    {trades.map((trade, idx) => (
                      <tr key={idx} className={cn("group transition-all duration-300", isDark ? "hover:bg-white/5" : "hover:bg-neutral-50")}>
                        <td className={cn("px-8 py-6 text-xs font-bold", isDark ? "text-white/60" : "text-neutral-600")}>{trade.time}</td>
                        <td className={cn("px-8 py-6 text-xs font-black uppercase tracking-tight", isDark ? "text-white" : "text-black")}>{trade.instrument}</td>
                        <td className="px-8 py-6 text-center">
                          <span className={cn(
                            "px-3 py-1 text-[10px] font-bold uppercase rounded-lg border",
                            trade.side === "Buy" ? "bg-accent-green/10 text-accent-green border-accent-green/20" : "bg-accent-red/10 text-accent-red border-accent-red/20"
                          )}>
                            {trade.side}
                          </span>
                        </td>
                        <td className={cn("px-8 py-6 text-xs font-black text-right", trade.pnlClass)}>{trade.pnl}</td>
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
