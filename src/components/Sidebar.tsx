import React, { ReactNode } from "react";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BarChart3, 
  FileText, 
  Settings, 
  ClipboardList,
  Tag,
  LogOut,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { Tooltip } from "./Tooltip";

interface NavItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  isDark: boolean;
  isCollapsed?: boolean;
}

function NavItem({ icon, label, active = false, onClick, isDark, isCollapsed }: NavItemProps) {
  const content = (
    <motion.button 
      onClick={onClick}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full flex items-center transition-all duration-300 group rounded-lg overflow-hidden whitespace-nowrap",
        isCollapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2",
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
      {!isCollapsed && <span className="text-[13px] font-medium tracking-tight">{label}</span>}
    </motion.button>
  );

  if (isCollapsed) {
    return (
      <Tooltip content={label} isDark={isDark} position="right">
        {content}
      </Tooltip>
    );
  }

  return content;
}

interface SidebarProps {
  view: string;
  onNavigate: (view: any) => void;
  isDark: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ 
  view, 
  onNavigate, 
  isDark, 
  isCollapsed, 
  setIsCollapsed, 
  onLogout,
  isMobileOpen = false,
  setIsMobileOpen
}: SidebarProps) {
  return (
    <>
      {/* Mobile Swipe Trigger (Edge) */}
      <div 
        className="fixed inset-y-0 left-0 w-4 z-[55] md:hidden"
        onMouseEnter={() => setIsMobileOpen?.(true)}
        onTouchStart={(e) => {
          // Optional: handle touch start for swipe detection
        }}
      />

      <motion.aside 
        initial={false}
        animate={{ 
          width: typeof window !== 'undefined' && window.innerWidth < 768 ? 280 : (isCollapsed ? 60 : 180),
          x: typeof window !== 'undefined' && window.innerWidth < 768 
            ? (isMobileOpen ? 0 : -280) 
            : 0
        }}
        drag={typeof window !== 'undefined' && window.innerWidth < 768 ? "x" : false}
        dragConstraints={{ left: -280, right: 0 }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (info.offset.x > 50 || info.velocity.x > 500) setIsMobileOpen?.(true);
          if (info.offset.x < -50 || info.velocity.x < -500) setIsMobileOpen?.(false);
        }}
        className={cn(
          "flex flex-col h-screen fixed left-0 border-r z-50 transition-colors duration-300 no-print",
          isDark ? "bg-black border-white/10" : "bg-white border-neutral-200",
          "md:flex" // Always flex on desktop
        )}
      >
        {/* Mobile Drag Handle (Invisible but grabbable at the edge) */}
        <div className="absolute top-0 left-full w-12 h-full md:hidden cursor-grab active:cursor-grabbing" />

        <div className="p-3 flex flex-col h-full">
        <div className="mb-4 px-2 overflow-hidden">
          <h1 className={cn(
            "font-black italic tracking-tighter transition-all duration-300 leading-none", 
            isDark ? "text-white" : "text-black",
            isCollapsed ? "text-sm" : "text-base"
          )}>
            {isCollapsed ? "SA" : "Sovereign Analyst"}
          </h1>
          {!isCollapsed && (
            <p className="text-[8px] mt-0.5 uppercase tracking-[0.2em] font-bold text-[#00FF41]">
              Premium Tier
            </p>
          )}
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={16} />} 
            label="Dashboard" 
            active={view === "dashboard"} 
            isCollapsed={isCollapsed}
            onClick={() => onNavigate("dashboard")}
            isDark={isDark} 
          />
          <NavItem 
            icon={<FileText size={16} />} 
            label="Daily Journal" 
            active={view === "daily-journal"}
            isCollapsed={isCollapsed}
            onClick={() => onNavigate("daily-journal")}
            isDark={isDark} 
          />
          <NavItem 
            icon={<ArrowLeftRight size={16} />} 
            label="Trades" 
            active={view === "trades"}
            isCollapsed={isCollapsed}
            onClick={() => onNavigate("trades")}
            isDark={isDark} 
          />
          <NavItem 
            icon={<BarChart3 size={16} />} 
            label="Analytics" 
            active={view === "analytics"}
            isCollapsed={isCollapsed}
            onClick={() => onNavigate("analytics")}
            isDark={isDark} 
          />
          <NavItem 
            icon={<ClipboardList size={16} />} 
            label="Reports" 
            active={view === "reports"}
            isCollapsed={isCollapsed}
            onClick={() => onNavigate("reports")}
            isDark={isDark} 
          />
          <NavItem 
            icon={<Tag size={16} />} 
            label="Annotations" 
            active={view === "annotations"}
            isCollapsed={isCollapsed}
            onClick={() => onNavigate("annotations")}
            isDark={isDark} 
          />
          <NavItem 
            icon={<Sparkles size={16} />} 
            label="Gemini" 
            active={view === "gemini"}
            isCollapsed={isCollapsed}
            onClick={() => onNavigate("gemini")}
            isDark={isDark} 
          />
        </nav>

        <div className="mt-auto space-y-1">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "w-full flex items-center justify-center py-2 transition-all duration-200 group rounded-lg",
              isDark ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-neutral-500 hover:text-black hover:bg-neutral-100"
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <LayoutDashboard size={16} className={cn("transition-transform duration-300", isCollapsed && "rotate-180")} />
          </button>

          <NavItem 
            icon={<Settings size={16} />} 
            label="Settings" 
            active={view === "settings"}
            isCollapsed={isCollapsed}
            isDark={isDark} 
            onClick={() => onNavigate("settings")}
          />
          
          <button 
            onClick={onLogout}
            className={cn(
              "w-full flex items-center transition-all duration-200 group rounded-lg overflow-hidden whitespace-nowrap",
              isCollapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2",
              isDark ? "text-red-500/60 hover:text-red-500 hover:bg-red-500/5" : "text-red-600/60 hover:text-red-600 hover:bg-red-50/50"
            )}
          >
            <LogOut size={16} className="shrink-0" />
            {!isCollapsed && <span className="text-[13px] font-medium tracking-tight">Logout</span>}
          </button>
        </div>
      </div>
    </motion.aside>
    </>
  );
}
