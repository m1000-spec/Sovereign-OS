import { useState, ReactNode } from "react";
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
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface TradesProps {
  onNavigate: (view: "dashboard" | "trades" | "analytics" | "reports" | "settings" | "daily-journal" | "landing" | "annotations") => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  openTradeModal: () => void;
}

export default function Trades({ onNavigate, isDark, setIsDark, openTradeModal }: TradesProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
              <p className="text-[10px] mt-1 uppercase tracking-[0.2em] font-bold text-[#00FF41]">
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
              active 
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
              <LayoutDashboard size={18} className={cn("transition-transform duration-300", isCollapsed && "rotate-180")} />
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
        {/* Header */}
        <header className={cn(
          "fixed top-0 right-0 z-50 flex justify-between items-center px-8 h-20 border-b backdrop-blur-md transition-all duration-300",
          isCollapsed ? "left-0 md:left-20" : "left-0 md:left-56",
          isDark ? "border-white/10 bg-black/80" : "border-neutral-200 bg-white/80"
        )}>
          <div className="flex items-center gap-4">
            <h2 className={cn("text-[10px] font-bold uppercase tracking-[0.3em] opacity-70", isDark ? "text-white" : "text-black")}>Trades</h2>
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

        {/* Trades Content */}
        <div className="pt-24 px-4 md:px-8 pb-24 w-full space-y-12">
          {/* Title Section */}
          <div className="flex flex-col md:flex-row justify-end items-end gap-10 mb-4">
            <div className="flex gap-3">
              <div className={cn("px-5 py-2.5 border rounded-xl flex items-center gap-3", isDark ? "bg-white/5 border-white/10" : "bg-neutral-100 border-neutral-200")}>
                <div className={cn("w-2 h-2 rounded-full animate-pulse", isDark ? "bg-accent-green" : "bg-green-500")}></div>
                <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-60", isDark ? "text-white" : "text-black")}>Live Market</span>
              </div>
              <div className={cn("px-5 py-2.5 border rounded-xl", isDark ? "bg-white/5 border-white/10" : "bg-neutral-100 border-neutral-200")}>
                <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-60", isDark ? "text-white" : "text-black")}>Oct 24, 2024</span>
              </div>
            </div>
          </div>



          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-4">
            <StatCard label="Win Rate" value="68.4%" trend="+2.1%" isDark={isDark} />
            <StatCard label="Total PnL" value="+$12,450" isSuccess isDark={isDark} />
            <StatCard label="Avg R:R" value="1:2.8" subValue="OPTIMAL" isDark={isDark} />
            <StatCard label="Trade Count" value="142" icon={<BarChart3 size={20} />} isDark={isDark} borderAccent />
          </div>

          {/* Journal Archive Table */}
          <div className={cn("standard-card overflow-hidden", isDark ? "bg-black/40" : "bg-white shadow-sm")}>
            <div className={cn("px-10 py-8 border-b flex justify-between items-center", isDark ? "bg-white/5 border-white/5" : "bg-neutral-50 border-neutral-100")}>
              <span className={cn("text-xs font-bold tracking-[0.4em] uppercase", isDark ? "text-white/40" : "text-neutral-500")}>
                Journal Archive
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <TradeTh label="Instrument" isDark={isDark} />
                    <TradeTh label="Date & Time" center isDark={isDark} />
                    <TradeTh label="Dur." center isDark={isDark} />
                    <TradeTh label="Side" center isDark={isDark} />
                    <TradeTh label="Setup" center isDark={isDark} />
                    <TradeTh label="TF" center isDark={isDark} />
                    <TradeTh label="R:R" right isDark={isDark} />
                    <TradeTh label="P/L" right isDark={isDark} />
                  </tr>
                </thead>
                <tbody className={cn("divide-y", isDark ? "divide-white/5" : "divide-neutral-100")}>
                  <TradeRow 
                    instrument="BTC/USDT" 
                    category="Cryptocurrency" 
                    date="Oct 24, 2024" 
                    time="14:30:12 UTC" 
                    duration="2h 15m" 
                    side="Win" 
                    setup="Bullish Breakout" 
                    tf="15M" 
                    rr="1:2.5" 
                    pnl="+$1,420.00" 
                    isDark={isDark} 
                  />
                  <TradeRow 
                    instrument="AAPL" 
                    category="Equities" 
                    date="Oct 23, 2024" 
                    time="09:15:00 EST" 
                    duration="45m" 
                    side="Loss" 
                    setup="Mean Reversion" 
                    tf="1H" 
                    rr="1:1.8" 
                    pnl="-$450.00" 
                    isDark={isDark} 
                  />
                  <TradeRow 
                    instrument="XAU/USD" 
                    category="Commodities" 
                    date="Oct 22, 2024" 
                    time="18:45:30 UTC" 
                    duration="1d 4h" 
                    side="Win" 
                    setup="Supply Tap" 
                    tf="4H" 
                    rr="1:5.2" 
                    pnl="+$8,900.00" 
                    isDark={isDark} 
                  />
                </tbody>
              </table>
            </div>
            <div className={cn("px-8 py-6 border-t flex justify-between items-center", isDark ? "bg-white/5 border-white/5" : "bg-neutral-50 border-neutral-100")}>
              <div className={cn("text-[10px] font-bold tracking-widest uppercase", isDark ? "text-white/40" : "text-neutral-500")}>
                Showing 3 of 1,482 entries
              </div>
              <div className="flex gap-2">
                <PaginationButton icon={<ChevronLeft size={16} />} isDark={isDark} />
                <PaginationButton label="1" active isDark={isDark} />
                <PaginationButton label="2" isDark={isDark} />
                <PaginationButton label="3" isDark={isDark} />
                <PaginationButton icon={<ChevronRight size={16} />} isDark={isDark} />
              </div>
            </div>
          </div>

          {/* Performance Narrative & Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-6">
              <h3 className={cn("text-xs font-bold tracking-[0.4em] uppercase ml-4", isDark ? "text-white/40" : "text-neutral-500")}>
                Performance Narrative
              </h3>
              <div className={cn("p-12 standard-card relative overflow-hidden", isDark ? "bg-white/5" : "bg-white shadow-sm")}>
                <div className={cn("absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl", isDark ? "bg-accent-green/5" : "bg-black/5")} />
                <p className={cn("text-2xl font-medium leading-relaxed mb-10 relative z-10", isDark ? "text-white/90" : "text-black")}>
                  "The transition from October to November shows a marked increase in discipline. High-timeframe supply taps are delivering the highest R:R results. Note the emotional fatigue on short-duration AAPL trades—consider tightening the criteria for equity scalp setups."
                </p>
                <div className="flex items-center gap-6 relative z-10">
                  <div className={cn("flex items-center gap-3 px-5 py-2.5 rounded-xl border text-xs font-bold", isDark ? "bg-white/5 border-white/10 text-white/60" : "bg-neutral-100 border-neutral-200 text-neutral-600")}>
                    <Sparkles size={16} className="text-accent-green" />
                    JARVIS_ADVISORY
                  </div>
                  <div className={cn("flex items-center gap-3 px-5 py-2.5 rounded-xl border text-xs font-bold uppercase", isDark ? "bg-white/5 border-white/10 text-white/60" : "bg-neutral-100 border-neutral-200 text-neutral-600")}>
                    Risk: Moderate
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className={cn("text-xs font-bold tracking-[0.4em] uppercase mb-4 ml-4", isDark ? "text-white/40" : "text-neutral-500")}>
                Distribution
              </h3>
              <div className={cn("p-12 standard-card h-full flex flex-col justify-center", isDark ? "bg-white/5" : "bg-white shadow-sm")}>
                <div className="space-y-10">
                  <DistributionItem label="Crypto" value={62} isDark={isDark} />
                  <DistributionItem label="Forex" value={24} isDark={isDark} />
                  <DistributionItem label="Indices" value={14} isDark={isDark} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={openTradeModal}
        className={cn(
          "fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center transition-transform group z-[100] shadow-[0_10px_40px_rgba(0,255,65,0.4)]",
          isDark ? "bg-accent-green text-black hover:shadow-[0_0_20px_rgba(0,255,65,0.4)]" : "bg-black text-white"
        )}
      >
        <Edit3 size={24} />
        <span className="absolute right-16 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest text-white uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
          Quick Journal
        </span>
      </motion.button>
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

function StatCard({ label, value, trend, subValue, icon, isSuccess = false, isDark, borderAccent = false }: { label: string, value: string, trend?: string, subValue?: string, icon?: ReactNode, isSuccess?: boolean, isDark: boolean, borderAccent?: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={cn(
        "p-8 standard-card relative overflow-hidden group border transition-all duration-300",
        isDark ? "bg-white/3 border-white/10" : "bg-white border-neutral-200 shadow-sm",
      )}
    >
      <p className={cn("text-[10px] font-bold tracking-[0.2em] uppercase mb-4", isDark ? "text-white/40" : "text-neutral-500")}>
        {label}
      </p>
      <div className="flex items-end justify-between">
        <span className={cn("text-4xl font-black tracking-tighter", isSuccess ? (isDark ? "text-accent-green" : "text-green-600") : (isDark ? "text-white" : "text-black"))}>
          {value}
        </span>
        {trend && (
          <div className={cn("text-xs flex items-center gap-1 font-bold", isDark ? "text-accent-green" : "text-green-600")}>
            <TrendingUp size={14} />
            {trend}
          </div>
        )}
        {subValue && (
          <span className={cn("text-[10px] font-bold tracking-widest", isDark ? "text-white/40" : "text-neutral-400")}>
            {subValue}
          </span>
        )}
        {icon && <div className={isDark ? "text-white/40" : "text-neutral-300"}>{icon}</div>}
      </div>
    </motion.div>
  );
}

function TradeTh({ label, center, right, isDark }: { label: string, center?: boolean, right?: boolean, isDark: boolean }) {
  return (
    <th className={cn(
      "px-4 py-5 text-[10px] font-bold tracking-widest uppercase",
      isDark ? "text-white/40" : "text-neutral-500",
      center ? "text-center" : right ? "text-right" : "text-left",
      label === "Instrument" && "px-8"
    )}>
      {label}
    </th>
  );
}

function TradeRow({ instrument, category, date, time, duration, side, setup, tf, rr, pnl, isDark }: { instrument: string, category: string, date: string, time: string, duration: string, side: "Win" | "Loss", setup: string, tf: string, rr: string, pnl: string, isDark: boolean }) {
  const isWin = side === "Win";
  return (
    <tr className={cn("group transition-all duration-300", isDark ? "hover:bg-white/5" : "hover:bg-neutral-50")}>
      <td className="px-8 py-6">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", isDark ? "bg-neutral-900 border-white/10" : "bg-neutral-100 border-neutral-200")}>
            <div className={cn("w-4 h-4 rounded-full", isWin ? "bg-accent-green/20" : "bg-red-500/20")}>
              <div className={cn("w-full h-full rounded-full animate-pulse", isWin ? "bg-accent-green" : "bg-red-500")} />
            </div>
          </div>
          <div>
            <p className={cn("text-sm font-bold tracking-tight", isDark ? "text-white" : "text-black")}>{instrument}</p>
            <p className={cn("text-[10px] uppercase", isDark ? "text-white/40" : "text-neutral-500")}>{category}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-6 text-center">
        <p className={cn("text-xs", isDark ? "text-white" : "text-black")}>{date}</p>
        <p className={cn("text-[10px] font-medium uppercase tracking-tighter", isDark ? "text-white/40" : "text-neutral-500")}>{time}</p>
      </td>
      <td className="px-4 py-6 text-center">
        <span className={cn("text-xs tracking-wider", isDark ? "text-white/40" : "text-neutral-500")}>{duration}</span>
      </td>
      <td className="px-4 py-6 text-center">
        <span className={cn(
          "inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase",
          isWin ? (isDark ? "bg-accent-green/10 text-accent-green" : "bg-green-100 text-green-700") : "bg-red-500/10 text-red-500"
        )}>
          {side}
        </span>
      </td>
      <td className="px-4 py-6 text-center">
        <span className={cn("text-xs", isDark ? "text-white/80" : "text-neutral-700")}>{setup}</span>
      </td>
      <td className="px-4 py-6 text-center">
        <span className={cn("text-[10px] font-bold px-2 py-1 rounded", isDark ? "bg-white/5 text-white/40" : "bg-neutral-100 text-neutral-600")}>
          {tf}
        </span>
      </td>
      <td className="px-4 py-6 text-right">
        <span className={cn("text-xs font-bold", isDark ? "text-white" : "text-black")}>{rr}</span>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex flex-col items-end">
          <span className={cn("text-sm font-bold", isWin ? (isDark ? "text-accent-green" : "text-green-600") : "text-red-500")}>
            {pnl}
          </span>
          <div className={cn("w-12 h-1 rounded-full mt-1 overflow-hidden", isWin ? (isDark ? "bg-accent-green/20" : "bg-green-100") : "bg-red-500/20")}>
            <div className={cn("h-full", isWin ? (isDark ? "bg-accent-green shadow-[0_0_5px_#00FF41] w-full" : "bg-green-600 w-full") : "bg-red-500 w-1/3")} />
          </div>
        </div>
      </td>
    </tr>
  );
}

function PaginationButton({ label, icon, active, isDark }: { label?: string, icon?: ReactNode, active?: boolean, isDark: boolean }) {
  return (
    <button className={cn(
      "w-8 h-8 flex items-center justify-center rounded-lg border transition-all text-[10px] font-bold",
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
      <div className="flex justify-between text-[10px] font-bold uppercase mb-2 tracking-wider">
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
    <div className="space-y-2">
      <label className={cn(
        "text-[10px] font-bold tracking-widest uppercase ml-2",
        accent ? (isDark ? "text-accent-green" : "text-black") : (isDark ? "text-white/40" : "text-neutral-500")
      )}>
        {label}
      </label>
      {children}
    </div>
  );
}
