import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BarChart3, 
  FileText, 
  Settings as SettingsIcon, 
  Bell, 
  User,
  LogOut,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Download,
  Upload,
  Trash2,
  Database,
  Wallet,
  Coins,
  Target,
  Quote,
  Moon,
  Sun,
  BookOpen,
  Tag
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

interface SettingsProps {
  onNavigate: (view: "dashboard" | "trades" | "analytics" | "reports" | "settings" | "daily-journal" | "landing" | "annotations") => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  openTradeModal: () => void;
}

export default function Settings({ onNavigate, isDark, setIsDark, openTradeModal }: SettingsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [accountSize, setAccountSize] = useState("100,000.00");
  const [breakEvenRange, setBreakEvenRange] = useState("15.00");
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
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
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newInstrumentName, setNewInstrumentName] = useState("");
  const [isAddingInstrument, setIsAddingInstrument] = useState(false);
  const [newSetupName, setNewSetupName] = useState("");
  const [isAddingSetup, setIsAddingSetup] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleApplyChanges = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const addInstrument = () => {
    if (newInstrumentName.trim()) {
      setInstruments([...instruments, { 
        id: Date.now(), 
        name: newInstrumentName.trim().toUpperCase(), 
        color: "#" + Math.floor(Math.random()*16777215).toString(16) 
      }]);
      setNewInstrumentName("");
      setIsAddingInstrument(false);
    }
  };

  const removeInstrument = (id: number) => {
    setInstruments(instruments.filter(i => i.id !== id));
  };

  const addSetup = () => {
    if (newSetupName.trim()) {
      setSetups([...setups, newSetupName.trim()]);
      setNewSetupName("");
      setIsAddingSetup(false);
    }
  };

  const removeSetup = (index: number) => {
    setSetups(setups.filter((_, i) => i !== index));
  };

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
              icon={<FileText size={18} />} 
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
              icon={<SettingsIcon size={18} />} 
              label="Settings" 
              active
              isCollapsed={isCollapsed}
              isDark={isDark} 
              onClick={() => onNavigate("settings")}
            />
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isCollapsed ? "md:ml-20" : "md:ml-56"
      )}>
        {/* Header */}
        <header className={cn(
          "fixed top-0 right-0 z-50 flex justify-between items-center px-8 h-20 border-b backdrop-blur-md transition-all duration-300",
          isCollapsed ? "left-0 md:left-20" : "left-0 md:left-56",
          isDark ? "border-white/10 bg-black/80" : "border-neutral-200 bg-white/80"
        )}>
          <div className="flex items-center gap-4">
            <h2 className={cn("text-[10px] font-bold uppercase tracking-[0.3em] opacity-70", isDark ? "text-white" : "text-black")}>Settings</h2>
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

        <main className={cn(
          "flex-1 overflow-y-auto pt-24 pb-32 px-4 md:px-8 custom-scrollbar transition-colors duration-500",
          isDark ? "bg-black" : "bg-neutral-50"
        )}>
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Account Metrics Section */}
              <div className={cn(
                "p-8 rounded-3xl border transition-all duration-500",
                isDark ? "bg-[#0a0a0a] border-white/5" : "bg-white border-neutral-200 shadow-sm"
              )}>
                <h3 className={cn("text-[10px] font-bold uppercase tracking-[0.2em] mb-8 opacity-50", isDark ? "text-white" : "text-black")}>Account Metrics</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className={cn("text-[10px] font-bold uppercase tracking-widest opacity-40", isDark ? "text-white" : "text-black")}>Account Size ($)</label>
                    <input 
                      type="text" 
                      value={accountSize}
                      onChange={(e) => setAccountSize(e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-1",
                        isDark ? "bg-white/5 border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border-neutral-200 text-black focus:ring-black"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={cn("text-[10px] font-bold uppercase tracking-widest opacity-40", isDark ? "text-white" : "text-black")}>Break-even Range ($)</label>
                    <input 
                      type="text" 
                      value={breakEvenRange}
                      onChange={(e) => setBreakEvenRange(e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-1",
                        isDark ? "bg-white/5 border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border-neutral-200 text-black focus:ring-black"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Data Management Section */}
              <div className={cn(
                "p-8 rounded-3xl border transition-all duration-500",
                isDark ? "bg-[#0a0a0a] border-white/5" : "bg-white border-neutral-200 shadow-sm"
              )}>
                <h3 className={cn("text-[10px] font-bold uppercase tracking-[0.2em] mb-8 opacity-50", isDark ? "text-white" : "text-black")}>Data Management</h3>
                <div className="grid grid-cols-1 gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      "w-full py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                      isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-neutral-50 border-neutral-200 text-black hover:bg-neutral-100"
                    )}
                  >
                    Export Data (.csv)
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      "w-full py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                      isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-neutral-50 border-neutral-200 text-black hover:bg-neutral-100"
                    )}
                  >
                    Import Data (.csv)
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setIsConfirmingClear(true)}
                    className={cn(
                      "w-full py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                      isDark ? "bg-accent-red/10 border-accent-red/20 text-accent-red hover:bg-accent-red/20" : "bg-red-50 border-red-100 text-red-600 hover:bg-red-100"
                    )}
                  >
                    Clean All Data
                  </motion.button>
                </div>
              </div>

              {/* Setups Section */}
              <div className={cn(
                "p-8 rounded-3xl border transition-all duration-500",
                isDark ? "bg-[#0a0a0a] border-white/5" : "bg-white border-neutral-200 shadow-sm"
              )}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className={cn("text-[10px] font-bold uppercase tracking-[0.2em] opacity-50", isDark ? "text-white" : "text-black")}>Setups</h3>
                  <button 
                    onClick={() => setIsAddingSetup(!isAddingSetup)}
                    className={cn("p-1.5 rounded-lg transition-all", isDark ? "bg-accent-green/10 text-accent-green hover:bg-accent-green/20" : "bg-green-50 text-green-600 hover:bg-green-100")}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {isAddingSetup && (
                  <div className="mb-4 flex gap-2">
                    <input 
                      type="text" 
                      value={newSetupName}
                      onChange={(e) => setNewSetupName(e.target.value)}
                      placeholder="New Setup"
                      className={cn(
                        "flex-1 px-3 py-2 rounded-lg border text-xs focus:outline-none",
                        isDark ? "bg-black border-white/10 text-white" : "bg-white border-neutral-200 text-black"
                      )}
                    />
                    <button onClick={addSetup} className="px-3 py-2 bg-accent-green text-black rounded-lg text-[10px] font-bold uppercase">Add</button>
                  </div>
                )}
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {setups.map((setup, index) => (
                    <div key={index} className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                      isDark ? "bg-white/5 border-white/5 hover:border-white/10" : "bg-neutral-50 border-neutral-100 hover:border-neutral-200"
                    )}>
                      <span className="text-xs font-medium">{setup}</span>
                      <button onClick={() => removeSetup(index)} className="text-accent-red opacity-40 hover:opacity-100 transition-opacity">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instruments Section */}
              <div className={cn(
                "p-8 rounded-3xl border transition-all duration-500",
                isDark ? "bg-[#0a0a0a] border-white/5" : "bg-white border-neutral-200 shadow-sm"
              )}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className={cn("text-[10px] font-bold uppercase tracking-[0.2em] opacity-50", isDark ? "text-white" : "text-black")}>Instruments</h3>
                  <button 
                    onClick={() => setIsAddingInstrument(!isAddingInstrument)}
                    className={cn("p-1.5 rounded-lg transition-all", isDark ? "bg-accent-green/10 text-accent-green hover:bg-accent-green/20" : "bg-green-50 text-green-600 hover:bg-green-100")}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {isAddingInstrument && (
                  <div className="mb-4 flex gap-2">
                    <input 
                      type="text" 
                      value={newInstrumentName}
                      onChange={(e) => setNewInstrumentName(e.target.value)}
                      placeholder="New Instrument"
                      className={cn(
                        "flex-1 px-3 py-2 rounded-lg border text-xs focus:outline-none",
                        isDark ? "bg-black border-white/10 text-white" : "bg-white border-neutral-200 text-black"
                      )}
                    />
                    <button onClick={addInstrument} className="px-3 py-2 bg-accent-green text-black rounded-lg text-[10px] font-bold uppercase">Add</button>
                  </div>
                )}
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {instruments.map((inst) => (
                    <div key={inst.id} className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                      isDark ? "bg-white/5 border-white/5 hover:border-white/10" : "bg-neutral-50 border-neutral-100 hover:border-neutral-200"
                    )}>
                      <span className="text-xs font-medium">{inst.name}</span>
                      <button onClick={() => removeInstrument(inst.id)} className="text-accent-red opacity-40 hover:opacity-100 transition-opacity">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer Actions */}
        <footer className={cn(
          "fixed bottom-0 right-0 left-0 md:left-56 p-6 backdrop-blur-xl border-t flex justify-end z-40 transition-colors duration-500",
          isDark ? "bg-black/80 border-white/5" : "bg-white/80 border-neutral-200"
        )}>
          <div className="flex items-center gap-6">
            {showSuccess && (
              <motion.span 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[#00FF41] text-xs font-bold uppercase tracking-widest"
              >
                System Updated Successfully
              </motion.span>
            )}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate("dashboard")}
              className={cn(
                "px-8 py-3 text-sm font-bold transition-colors uppercase tracking-widest",
                isDark ? "text-neutral-500 hover:text-white" : "text-neutral-400 hover:text-black"
              )}
            >
              Discard
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleApplyChanges}
              disabled={isSaving}
              className={cn(
                "px-12 py-4 rounded-full font-black text-sm uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3",
                isDark 
                  ? "bg-[#00FF41] text-black shadow-[0_0_30px_rgba(0,255,65,0.3)] hover:shadow-[0_0_40px_rgba(0,255,65,0.5)]" 
                  : "bg-black text-white hover:bg-neutral-800 shadow-lg"
              )}
            >
              {isSaving ? "Processing..." : "Apply System Changes"}
            </motion.button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick, isDark, isCollapsed }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void, isDark: boolean, isCollapsed: boolean }) {
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
        "transition-colors",
        active ? "text-accent-green" : "group-hover:text-accent-green"
      )}>
        {icon}
      </span>
      {!isCollapsed && <span className="text-sm font-medium tracking-tight">{label}</span>}
    </button>
  );
}
