import React from "react";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BarChart3, 
  FileText, 
  ClipboardList,
  Sparkles,
  Plus
} from "lucide-react";
import { cn } from "../lib/utils";

interface BottomNavProps {
  view: string;
  onNavigate: (view: any) => void;
  isDark: boolean;
  openTradeModal: () => void;
}

export function BottomNav({ view, onNavigate, isDark, openTradeModal }: BottomNavProps) {
  const navItems = [
    { id: "dashboard", icon: <LayoutDashboard size={20} />, label: "Home" },
    { id: "trades", icon: <ArrowLeftRight size={20} />, label: "Trades" },
    { id: "analytics", icon: <BarChart3 size={20} />, label: "Stats" },
    { id: "reports", icon: <ClipboardList size={20} />, label: "Reports" },
  ];

  return (
    <div className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 z-50 border-t pb-safe flex items-center justify-around px-2 h-16 transition-colors duration-300 no-print",
      isDark ? "bg-black border-white/10" : "bg-white border-neutral-200"
    )}>
      {navItems.slice(0, 2).map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 transition-all duration-200 relative w-16",
            view === item.id 
              ? (isDark ? "text-accent-green" : "text-black") 
              : (isDark ? "text-neutral-500" : "text-neutral-400")
          )}
        >
          {item.icon}
          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          {view === item.id && (
            <div className={cn(
              "absolute -bottom-1 w-1 h-1 rounded-full",
              isDark ? "bg-accent-green" : "bg-black"
            )} />
          )}
        </button>
      ))}

      {/* Center Gemini Button */}
      <div className="relative -top-6">
        <button
          onClick={() => onNavigate("gemini")}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90",
            view === "gemini"
              ? (isDark ? "bg-accent-green text-black shadow-accent-green/20" : "bg-black text-white shadow-black/20")
              : (isDark ? "bg-accent-green/10 text-accent-green border border-accent-green/20" : "bg-neutral-100 text-neutral-600 border border-neutral-200")
          )}
        >
          <Sparkles size={24} className={cn(view === "gemini" && "animate-pulse")} />
        </button>
        {view === "gemini" && (
          <div className={cn(
            "absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
            isDark ? "bg-accent-green" : "bg-black"
          )} />
        )}
      </div>

      {navItems.slice(2).map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 transition-all duration-200 relative w-16",
            view === item.id 
              ? (isDark ? "text-accent-green" : "text-black") 
              : (isDark ? "text-neutral-500" : "text-neutral-400")
          )}
        >
          {item.icon}
          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          {view === item.id && (
            <div className={cn(
              "absolute -bottom-1 w-1 h-1 rounded-full",
              isDark ? "bg-accent-green" : "bg-black"
            )} />
          )}
        </button>
      ))}
    </div>
  );
}
