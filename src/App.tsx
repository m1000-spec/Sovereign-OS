import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import Trades from "./components/Trades";
import Analytics from "./components/Analytics";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import DailyJournal from "./components/DailyJournal";
import Annotations from "./components/Annotations";
import { TradeModal } from "./components/TradeModal";

export default function App() {
  const [view, setView] = useState<"landing" | "dashboard" | "trades" | "analytics" | "reports" | "settings" | "daily-journal" | "annotations">("landing");
  const [isDark, setIsDark] = useState(true);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  const commonProps = {
    onNavigate: setView,
    isDark,
    setIsDark,
    openTradeModal: () => setIsTradeModalOpen(true)
  };

  const renderView = () => {
    switch (view) {
      case "dashboard": return <Dashboard {...commonProps} />;
      case "trades": return <Trades {...commonProps} />;
      case "analytics": return <Analytics {...commonProps} />;
      case "reports": return <Reports {...commonProps} />;
      case "settings": return <Settings {...commonProps} />;
      case "daily-journal": return <DailyJournal {...commonProps} />;
      case "annotations": return <Annotations {...commonProps} />;
      default: return (
        <div className="min-h-screen bg-black text-white selection:bg-accent-red selection:text-white">
          <Navbar onLaunch={() => setView("dashboard")} />
          <main>
            <Hero onAccess={() => setView("dashboard")} />
            <Features />
          </main>
          <Footer />
        </div>
      );
    }
  };

  return (
    <>
      {renderView()}
      <TradeModal 
        isOpen={isTradeModalOpen} 
        onClose={() => setIsTradeModalOpen(false)} 
        isDark={isDark} 
      />
    </>
  );
}
