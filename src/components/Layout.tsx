import React, { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { cn } from "../lib/utils";
import { getGeminiStats, DAILY_LIMIT } from "../services/geminiService";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  view: string;
  onNavigate: (view: any) => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openTradeModal: () => void;
  headerTitle: string;
}

export function Layout({ 
  children, 
  view, 
  onNavigate, 
  isDark, 
  setIsDark, 
  isCollapsed, 
  setIsCollapsed, 
  onLogout,
  searchQuery,
  setSearchQuery,
  openTradeModal,
  headerTitle
}: LayoutProps) {
  const [stats, setStats] = useState(getGeminiStats());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setStats(getGeminiStats());
    window.addEventListener('gemini-stats-updated', handleUpdate as EventListener);
    return () => window.removeEventListener('gemini-stats-updated', handleUpdate as EventListener);
  }, []);

  // Close mobile sidebar on navigation
  const handleNavigate = (newView: any) => {
    onNavigate(newView);
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className={cn("flex min-h-screen font-sans transition-colors duration-300 overflow-hidden", isDark ? "bg-black text-white" : "bg-white text-black")}>
      {/* Swipe Trigger Area (Invisible) */}
      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        onDragEnd={(_, info) => {
          if (info.offset.x > 50 || info.velocity.x > 500) {
            setIsMobileSidebarOpen(true);
          }
        }}
        className="fixed inset-y-0 left-0 w-8 z-[60] md:hidden cursor-grab active:cursor-grabbing"
      />

      <Sidebar 
        view={view}
        onNavigate={handleNavigate}
        isDark={isDark}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onLogout={onLogout}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <main 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300", 
          isCollapsed ? "md:ml-[60px]" : "md:ml-[180px]", 
          isDark ? "bg-black" : "bg-neutral-50"
        )}
      >
        <Header 
          title={headerTitle}
          isDark={isDark}
          setIsDark={setIsDark}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          openTradeModal={openTradeModal}
          isCollapsed={isCollapsed}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        <div className="flex-1 pb-4 md:pb-0">
          {children}
        </div>
      </main>

      {/* BottomNav removed as per user request */}
    </div>
  );
}
