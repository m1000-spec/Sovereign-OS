import { Search, Sun, Moon, Menu } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface HeaderProps {
  title: string;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openTradeModal: () => void;
  isCollapsed: boolean;
  onMenuClick?: () => void;
}

export const Header = ({ title, isDark, setIsDark, searchQuery, setSearchQuery, openTradeModal, isCollapsed, onMenuClick }: HeaderProps) => {
  return (
    <header className={cn(
      "fixed top-0 right-0 z-50 flex justify-between items-center px-5 h-14 border-b backdrop-blur-md transition-all duration-300 no-print",
      isCollapsed ? "left-0 md:left-[60px]" : "left-0 md:left-[180px]",
      isDark ? "border-white/10 bg-black/80" : "border-neutral-200 bg-white/80"
    )}>
      <div className="flex items-center gap-5 flex-1">
        <button 
          onClick={onMenuClick}
          className={cn(
            "md:hidden p-1.5 rounded-lg transition-all duration-300",
            isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-neutral-100 text-black hover:bg-neutral-200"
          )}
        >
          <Menu size={16} />
        </button>

        <h2 className={cn("text-[8px] font-bold uppercase tracking-[0.3em] opacity-70 shrink-0", isDark ? "text-white" : "text-black")}>
          {title}
        </h2>
        
        <div className="relative max-w-sm w-full hidden sm:block">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3", isDark ? "text-white/20" : "text-neutral-400")} />
          <input 
            type="text"
            placeholder="Search instrument, tags, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-8 pr-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all outline-none border",
              isDark 
                ? "bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-accent-green/50 focus:bg-white/10" 
                : "bg-neutral-100 border-neutral-200 text-black placeholder:text-neutral-400 focus:border-black/20 focus:bg-white"
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button 
          onClick={() => setIsDark(!isDark)}
          className={cn(
            "p-1.5 rounded-lg transition-all duration-300",
            isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-neutral-100 text-black hover:bg-neutral-200"
          )}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openTradeModal}
          className={cn(
            "px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest text-[8px] transition-all",
            isDark ? "bg-accent-green text-black hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]" : "bg-black text-white hover:bg-neutral-800 shadow-lg"
          )}
        >
          New Trade
        </motion.button>
      </div>
    </header>
  );
};
