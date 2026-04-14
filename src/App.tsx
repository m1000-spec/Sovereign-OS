import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Trades from "./components/Trades";
import Analytics from "./components/Analytics";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import DailyJournal from "./components/DailyJournal";
import Annotations from "./components/Annotations";
import GeminiPage from "./components/GeminiPage";
import LoginPage from "./components/LoginPage";
import { TradeModal } from "./components/TradeModal";
import { supabase } from "./lib/supabase";
import { Trade, TagGroup } from "./types";
import { useTradeStore } from "./store/useTradeStore";

import { Layout } from "./components/Layout";
import { askGemini } from "./services/geminiService";

// Expose askGemini to window for the user to call easily from console
if (typeof window !== 'undefined') {
  (window as any).askGemini = askGemini;
}

export default function App() {
  const fetchTrades = useTradeStore(state => state.fetchTrades);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);
  const [view, setView] = useState<"dashboard" | "trades" | "analytics" | "reports" | "settings" | "daily-journal" | "annotations" | "gemini">("dashboard");
  const [isDark, setIsDark] = useState(true);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);
  const [accountSize, setAccountSize] = useState("100,000.00");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
      setSupabaseConfigured(false);
    }
  }, []);

  // Shared state for settings and annotations
  const [instruments, setInstruments] = useState([
    { id: 1, name: "NQ", color: "#00FF41" },
    { id: 2, name: "ES", color: "rgba(0, 255, 65, 0.4)" },
    { id: 3, name: "BTC", color: "#ff0000" },
    { id: 4, name: "GOLD", color: "#FFD700" }
  ]);
  const [setups, setSetups] = useState([
    "Continuation",
    "Reversal",
    "Judas swing"
  ]);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([
    {
      id: "1",
      title: "General Tags",
      tags: [
        { id: "g1", label: "Liquidity Sweep", color: "amber" },
        { id: "g2", label: "CHoCH", color: "cyan" },
        { id: "g3", label: "BoS", color: "turquoise" },
        { id: "g4", label: "Order Block Tap", color: "indigo" },
        { id: "g5", label: "FVG Mitigation", color: "green" },
        { id: "g6", label: "Premium Zone Entry", color: "blue" },
      ]
    },
    {
      id: "2",
      title: "Exit Tags",
      tags: [
        { id: "e1", label: "TP Hit", color: "green", bold: true },
        { id: "e2", label: "SL Hit", color: "red", bold: true },
        { id: "e3", label: "Break-even", color: "zinc" },
        { id: "e4", label: "Liquidity Target", color: "turquoise" },
        { id: "e5", label: "Time Stop", color: "zinc" },
        { id: "e6", label: "News Exit", color: "red" },
      ]
    },
    {
      id: "3",
      title: "Process Tags",
      tags: [
        { id: "p1", label: "Patience", color: "zinc" },
        { id: "p2", label: "Checked All Boxes", color: "amber" },
      ]
    }
  ]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const savedSession = localStorage.getItem("sovereign_session");
        
        if (session?.user || savedSession === "active") {
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse shadow-[0_0_8px_#ff0000]" />
      </div>
    );
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem("sovereign_session", "active");
    setView("dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("sovereign_session");
  };

  const handleEditTrade = (trade: Trade) => {
    setTradeToEdit(trade);
    setIsTradeModalOpen(true);
  };

  const openTradeModal = () => {
    setTradeToEdit(null);
    setIsTradeModalOpen(true);
  };

  const commonProps = {
    onNavigate: setView,
    isDark,
    setIsDark,
    openTradeModal,
    onEditTrade: handleEditTrade,
    onLogout: handleLogout,
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
    setSearchQuery
  };

  const getHeaderTitle = () => {
    switch (view) {
      case "dashboard": return "Dashboard";
      case "trades": return "Trades";
      case "analytics": return "Analytics";
      case "reports": return "Reports";
      case "settings": return "Settings";
      case "daily-journal": return "Daily Journal";
      case "annotations": return "Annotations";
      case "gemini": return "Gemini";
      default: return "Dashboard";
    }
  };

  const renderView = () => {
    if (!isLoggedIn) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    return (
      <Layout
        view={view}
        onNavigate={setView}
        isDark={isDark}
        setIsDark={setIsDark}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openTradeModal={openTradeModal}
        headerTitle={getHeaderTitle()}
      >
        {!supabaseConfigured && (
          <div className="fixed top-0 left-0 right-0 z-[200] bg-red-600 text-white px-4 py-2 text-center text-xs font-bold uppercase tracking-widest animate-pulse">
            Supabase is not connected. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Secrets panel.
          </div>
        )}
        {(() => {
          switch (view) {
            case "dashboard": return <Dashboard {...commonProps} />;
            case "trades": return <Trades {...commonProps} />;
            case "analytics": return <Analytics {...commonProps} />;
            case "reports": return <Reports {...commonProps} />;
            case "settings": return <Settings {...commonProps} />;
            case "daily-journal": return <DailyJournal {...commonProps} />;
            case "annotations": return <Annotations {...commonProps} />;
            case "gemini": return <GeminiPage isDark={isDark} />;
            default: return <Dashboard {...commonProps} />;
          }
        })()}
      </Layout>
    );
  };

  return (
    <>
      {renderView()}
      <TradeModal 
        isOpen={isTradeModalOpen} 
        onClose={() => {
          setIsTradeModalOpen(false);
          setTradeToEdit(null);
        }} 
        isDark={isDark} 
        tradeToEdit={tradeToEdit}
        instruments={instruments}
        setups={setups}
        tagGroups={tagGroups}
      />
    </>
  );
}
