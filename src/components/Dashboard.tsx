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
  Bell
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import MonthlyCalendar from "./MonthlyCalendar";

interface DashboardProps {
  onNavigate: (view: "dashboard" | "trades" | "analytics" | "reports" | "settings" | "daily-journal" | "landing" | "annotations") => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  openTradeModal: () => void;
}

export default function Dashboard({ onNavigate, isDark, setIsDark, openTradeModal }: DashboardProps) {
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
              active 
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
            <h2 className={cn("text-[10px] font-bold uppercase tracking-[0.3em] opacity-70", isDark ? "text-white" : "text-black")}>Dashboard</h2>
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

        {/* Dashboard Content */}
        <div className="pt-24 px-4 md:px-8 pb-24 space-y-6 w-full">
          {/* Top Buttons */}
          <div className="flex justify-end gap-3">
            <div className={cn("px-4 py-2.5 border rounded-xl flex items-center gap-3", isDark ? "bg-[#0A0A0A] border-white/10" : "bg-neutral-100 border-neutral-200")}>
              <div className="w-2 h-2 rounded-full bg-accent-green" />
              <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-60", isDark ? "text-white" : "text-black")}>Live Market</span>
            </div>
            <div className={cn("px-4 py-2.5 border rounded-xl flex items-center", isDark ? "bg-[#0A0A0A] border-white/10" : "bg-neutral-100 border-neutral-200")}>
              <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-60", isDark ? "text-white" : "text-black")}>Oct 24, 2024</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Profit Card */}
            <div className="md:col-span-8">
              <ProfitCard isDark={isDark} />
            </div>

            {/* Right Column: Win Rate + Session Status */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <WinRateCard isDark={isDark} />
              <SessionStatusCard isDark={isDark} />
            </div>

            {/* Bottom: Recent Activity Table */}
            <div className="md:col-span-12">
              <RecentActivityCard isDark={isDark} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={cn("font-body text-xs uppercase tracking-widest w-full py-12 border-t mt-auto transition-colors duration-300", isDark ? "bg-black border-white/10" : "bg-neutral-50 border-neutral-200")}>
          <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <span className={cn("font-black text-lg tracking-tighter", isDark ? "text-white" : "text-black")}>LOGOIPSUM</span>
              <p className={cn("text-[10px]", isDark ? "text-white/40" : "text-neutral-500")}>© 2024 LOGOIPSUM. Editorial Precision for the Modern Trader.</p>
            </div>
            <div className="flex gap-8">
              <FooterLink label="Privacy" isDark={isDark} />
              <FooterLink label="Terms" isDark={isDark} />
              <FooterLink label="Support" isDark={isDark} />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function ProfitCard({ isDark }: { isDark: boolean }) {
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
          <span className={cn("text-[10px] font-bold uppercase tracking-[0.2em] opacity-40", isDark ? "text-white" : "text-black")}>Total Net Profit</span>
          <div className="flex items-baseline gap-3 mt-2">
            <h2 className={cn("text-5xl font-black tracking-tighter", isDark ? "text-white" : "text-black")}>$142,890.42</h2>
            <span className={cn("font-bold text-sm", isDark ? "text-accent-green" : "text-green-600")}>+12.4%</span>
          </div>
        </div>
        <div className="flex gap-1">
          {['1D', '1W', '1M', 'ALL'].map((tf) => (
            <motion.button 
              key={tf} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
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

function WinRateCard({ isDark }: { isDark: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "p-6 standard-card flex flex-col items-center text-center gap-4 h-[353px] border transition-all duration-300", 
        isDark ? "bg-[#0A0A0A] border-white/10" : "bg-white border-neutral-200 shadow-sm"
      )}
    >
      <span className={cn("text-[10px] font-bold uppercase tracking-[0.2em] opacity-40", isDark ? "text-white" : "text-black")}>Win rate</span>
      <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle className={cn("fill-transparent stroke-[8]", isDark ? "stroke-white/5" : "stroke-neutral-100")} cx="50" cy="50" r="42"></circle>
          <circle 
            className={cn("fill-transparent stroke-[8] transition-all duration-1000", isDark ? "stroke-accent-green" : "stroke-black")} 
            cx="50" cy="50" r="42" 
            strokeDasharray="263.9" 
            strokeDashoffset={263.9 * (1 - 0.68)}
            strokeLinecap="round"
          ></circle>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-2xl font-black tracking-tighter", isDark ? "text-white" : "text-black")}>68%</span>
          <span className={cn("text-[7px] uppercase font-bold tracking-[0.2em] text-accent-green")}>Optimized</span>
        </div>
      </div>
      <div className={cn("grid grid-cols-2 w-full gap-4 pt-4 border-t mt-auto", isDark ? "border-white/10" : "border-neutral-100")}>
        <div className="min-w-0">
          <p className={cn("text-[8px] uppercase tracking-[0.2em] mb-1 font-bold opacity-40 truncate", isDark ? "text-white" : "text-black")}>Total Trades</p>
          <p className={cn("text-base font-bold truncate", isDark ? "text-white" : "text-black")}>1,204</p>
        </div>
        <div className="min-w-0">
          <p className={cn("text-[8px] uppercase tracking-[0.2em] mb-1 font-bold opacity-40 truncate", isDark ? "text-white" : "text-black")}>Profit Factor</p>
          <p className={cn("text-base font-bold truncate", isDark ? "text-white" : "text-black")}>2.41</p>
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
        "p-5 standard-card flex flex-col gap-3 h-[153px] border transition-all duration-300 overflow-hidden", 
        isDark ? "bg-[#0A0A0A] border-white/10" : "bg-white border-neutral-200 shadow-sm"
      )}
    >
      <span className={cn("text-[10px] font-bold uppercase tracking-[0.2em] opacity-40", isDark ? "text-white" : "text-black")}>Session Status</span>
      <div className="space-y-1.5">
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

function RecentActivityCard({ isDark }: { isDark: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={cn(
        "standard-card overflow-hidden border transition-all duration-300", 
        isDark ? "bg-[#0A0A0A] border-white/10" : "bg-white border-neutral-200 shadow-sm"
      )}
    >
      <div className={cn("p-8 border-b flex justify-between items-center", isDark ? "border-white/10" : "border-neutral-100")}>
        <h3 className={cn("text-xl font-black tracking-tight", isDark ? "text-white" : "text-black")}>RECENT ACTIVITY</h3>
        <motion.button 
          whileHover={{ x: 5 }}
          className={cn("text-[10px] font-bold uppercase tracking-[0.2em] text-accent-green hover:opacity-70 transition-opacity")}
        >
          View Ledger
        </motion.button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className={cn("border-b", isDark ? "bg-white/[0.02] border-white/5" : "bg-neutral-50 border-neutral-100")}>
            <tr>
              <TableHead label="Asset" isDark={isDark} />
              <TableHead label="Type" isDark={isDark} />
              <TableHead label="Entry" isDark={isDark} />
              <TableHead label="Result" isDark={isDark} />
              <TableHead label="PnL" isDark={isDark} />
            </tr>
          </thead>
          <tbody className={cn("divide-y", isDark ? "divide-white/5" : "divide-neutral-100")}>
            <TableRow asset="BTC" name="Bitcoin" type="Long" entry="$62,100" result="Win" pnl="+$1,450.00" isDark={isDark} />
            <TableRow asset="ETH" name="Ethereum" type="Short" entry="$2,510" result="Loss" pnl="-$420.00" isDark={isDark} />
            <TableRow asset="SOL" name="Solana" type="Long" entry="$138.40" result="Win" pnl="+$890.12" isDark={isDark} />
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function NavItem({ icon, label, active = false, onClick, isDark, isCollapsed }: { icon: ReactNode, label: string, active?: boolean, onClick?: () => void, isDark: boolean, isCollapsed?: boolean }) {
  return (
    <motion.button 
      onClick={onClick}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full flex items-center transition-all duration-300 group rounded-xl overflow-hidden whitespace-nowrap",
        isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3",
        active 
          ? (isDark ? "bg-white/10 text-accent-green" : "bg-neutral-100 text-black font-bold shadow-sm")
          : (isDark ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-neutral-500 hover:text-black hover:bg-neutral-100")
      )}
    >
      <span className={cn(
        "transition-colors duration-300 shrink-0",
        active ? "text-accent-green" : "group-hover:text-accent-green"
      )}>
        {icon}
      </span>
      {!isCollapsed && <span className="text-sm font-medium tracking-tight">{label}</span>}
    </motion.button>
  );
}

function TableHead({ label, isDark }: { label: string, isDark: boolean }) {
  return (
    <th className={cn("px-8 py-4 text-[10px] font-bold uppercase tracking-widest", isDark ? "text-white/40" : "text-neutral-500")}>
      {label}
    </th>
  );
}

function TableRow({ asset, name, type, entry, result, pnl, isDark }: { asset: string, name: string, type: string, entry: string, result: string, pnl: string, isDark: boolean }) {
  const isWin = result === "Win";
  return (
    <tr className={cn("transition-colors cursor-pointer group", isDark ? "hover:bg-white/[0.03]" : "hover:bg-neutral-50")}>
      <td className="px-8 py-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isDark ? "bg-white/5" : "bg-neutral-100")}>
            <span className={cn("text-[10px] font-black", isDark ? "text-accent-green" : "text-black")}>{asset}</span>
          </div>
          <span className="font-bold text-xs tracking-tight">{name}</span>
        </div>
      </td>
      <td className={cn("px-8 py-4 text-xs font-bold", type === "Long" ? (isDark ? "text-accent-green" : "text-green-600") : "text-red-500")}>
        {type}
      </td>
      <td className="px-8 py-4 text-xs font-mono opacity-40">{entry}</td>
      <td className="px-8 py-4">
        <span className={cn(
          "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
          isWin 
            ? (isDark ? "bg-green-500/10 text-accent-green" : "bg-green-500/10 text-green-600")
            : "bg-red-500/10 text-red-500"
        )}>
          {result}
        </span>
      </td>
      <td className={cn("px-8 py-4 font-black text-sm tracking-tight", isWin ? (isDark ? "text-accent-green" : "text-green-600") : "text-red-500")}>
        {pnl}
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
