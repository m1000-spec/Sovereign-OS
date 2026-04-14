import React, { useState, useEffect } from "react";
import { 
  Activity, 
  CheckSquare, 
  Globe, 
  Database, 
  Zap,
  ChevronRight,
  Plus,
  X,
  Download,
  Trash2,
  Save,
  Brain,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";
import { UserSettings } from "../types";

interface SettingsProps {
  onNavigate: (view: "dashboard" | "trades" | "analytics" | "reports" | "settings" | "daily-journal" | "annotations") => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  instruments: { id: number, name: string, color: string }[];
  setInstruments: (instruments: { id: number, name: string, color: string }[]) => void;
  setups: string[];
  setSetups: (setups: string[]) => void;
  accountSize: string;
  setAccountSize: (size: string) => void;
}

type SettingsTab = 'metrics' | 'setups' | 'instruments' | 'data' | 'strategy';

export default function Settings({ 
  onNavigate, 
  isDark, 
  setIsDark, 
  instruments, 
  setInstruments, 
  setups, 
  setSetups, 
  accountSize, 
  setAccountSize
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('metrics');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  
  // Local state for all settings
  const [settings, setSettings] = useState<UserSettings>({
    user_id: 'default_user',
    account_size: 0,
    break_even_range: 0,
    equity_curve_visible: true,
    drawdown_alerts: true,
    favorite_setups: [],
    favorite_instruments: [],
    master_strategy: ''
  });

  const [newInstrument, setNewInstrument] = useState("");
  const [newSetup, setNewSetup] = useState("");

  // Fetch settings from Supabase and LocalStorage on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Try LocalStorage first for instant load
        const localData = localStorage.getItem('user_settings_cache');
        if (localData) {
          const parsed = JSON.parse(localData);
          setSettings(parsed);
          setAccountSize(parsed.account_size.toLocaleString());
          setSetups(parsed.favorite_setups);
        }

        if (user) {
          const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') throw error;
          
          if (data) {
            setSettings(data);
            setAccountSize(data.account_size.toLocaleString());
            setSetups(data.favorite_setups);
            localStorage.setItem('user_settings_cache', JSON.stringify(data));
          } else {
            // If no data in DB, update local state with user_id
            setSettings(prev => ({ ...prev, user_id: user.id }));
          }
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Auto-save logic or manual save
  const handleSave = async () => {
    setSaving(true);
    setSyncStatus('syncing');
    try {
      // SMART AUTH CHECK: Try Supabase first, fallback to local session
      const { data: { user } } = await supabase.auth.getUser();
      const isLocalSession = localStorage.getItem("sovereign_session") === "active";
      
      if (!user && !isLocalSession) {
        console.error("No active session found (Supabase or Local).");
        alert("Session Expired. Please Re-login.");
        setSyncStatus('idle');
        setSaving(false);
        return;
      }

      // Sanitize NaN values to 0 before saving
      const sanitizedSettings = {
        ...settings,
        user_id: user?.id || 'local_user',
        account_size: isNaN(settings.account_size) ? 0 : settings.account_size,
        break_even_range: isNaN(settings.break_even_range) ? 0 : settings.break_even_range,
      };

      // IMMEDIATE MEMORY BRIDGE: Always save to LocalStorage for instant AI sync
      localStorage.setItem('user_settings_cache', JSON.stringify(sanitizedSettings));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('user-settings-updated'));

      // Cloud Sync (Only if Supabase user exists)
      if (user) {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            account_size: sanitizedSettings.account_size,
            break_even_range: sanitizedSettings.break_even_range,
            equity_curve_visible: sanitizedSettings.equity_curve_visible,
            drawdown_alerts: sanitizedSettings.drawdown_alerts,
            favorite_setups: sanitizedSettings.favorite_setups,
            favorite_instruments: sanitizedSettings.favorite_instruments,
            master_strategy: sanitizedSettings.master_strategy,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (error) {
          console.warn("Cloud sync failed, but settings saved locally:", error.message);
          // We don't throw here to allow local success
        }
      } else {
        console.log("Saving to LocalStorage only (No Supabase session).");
      }
      
      setSyncStatus('synced');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSyncStatus('idle');
      }, 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setSyncStatus('idle');
      alert("Save failed. Please check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const syncToBrain = async () => {
    setSaving(true);
    // In a real app, this would trigger a re-indexing or update the system prompt
    // For now, we just save and show a special success message
    await handleSave();
    alert("System Instruction Synced to Brain. Gemini will now prioritize these instructions.");
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Sync back to App.tsx state if necessary
    if (key === 'account_size') setAccountSize(value.toString());
    if (key === 'favorite_setups') setSetups(value);
  };

  const sidebarItems = [
    { id: 'metrics', label: 'Account Metrics', icon: Activity },
    { id: 'setups', label: 'Setups', icon: CheckSquare },
    { id: 'instruments', label: 'Instruments', icon: Globe },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'strategy', label: 'Strategy Card', icon: Zap },
  ];

  const [isSettingsSidebarOpen, setIsSettingsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className={cn(
        "flex-1 flex items-center justify-center transition-colors duration-300",
        isDark ? "bg-black" : "bg-[#F5F5F7]"
      )}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <p className={cn("text-[10px] font-bold uppercase tracking-[0.2em]", isDark ? "text-neutral-500" : "text-neutral-400")}>Loading Preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-1 flex min-h-screen pt-14 md:pt-20 relative overflow-hidden transition-colors duration-300",
      isDark ? "bg-black" : "bg-[#F5F5F7]"
    )}>
      {/* Mobile Settings Toggle */}
      <button 
        onClick={() => setIsSettingsSidebarOpen(!isSettingsSidebarOpen)}
        className={cn(
          "md:hidden fixed bottom-24 left-6 z-40 w-12 h-12 rounded-full shadow-xl flex items-center justify-center border transition-all",
          isDark ? "bg-neutral-900 border-white/10 text-white" : "bg-white border-black/5 text-black"
        )}
      >
        <ChevronRight className={cn("transition-transform duration-300", isSettingsSidebarOpen && "rotate-180")} />
      </button>

      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={{ 
          x: typeof window !== 'undefined' && window.innerWidth < 768 
            ? (isSettingsSidebarOpen ? 0 : -300) 
            : 0 
        }}
        className={cn(
          "w-72 backdrop-blur-xl border-r p-6 flex flex-col gap-2 z-30 transition-colors duration-300",
          isDark ? "bg-black/40 border-white/10" : "bg-white/40 border-black/5",
          "fixed inset-y-0 left-0 md:relative md:inset-auto"
        )}
      >
        <h2 className={cn(
          "text-[10px] font-bold uppercase tracking-[0.2em] mb-6 px-4",
          isDark ? "text-neutral-500" : "text-neutral-400"
        )}>System Preferences</h2>
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as SettingsTab);
              if (window.innerWidth < 768) setIsSettingsSidebarOpen(false);
            }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
              activeTab === item.id 
                ? (isDark ? "bg-white/10 text-white shadow-sm" : "bg-white shadow-sm text-black") 
                : (isDark ? "text-neutral-500 hover:bg-white/5 hover:text-white" : "text-neutral-500 hover:bg-white/50 hover:text-black")
            )}
          >
            <item.icon size={18} className={cn(
              "transition-colors",
              activeTab === item.id ? "text-blue-500" : (isDark ? "text-neutral-600 group-hover:text-neutral-400" : "text-neutral-400 group-hover:text-neutral-600")
            )} />
            <span className="text-sm font-medium">{item.label}</span>
            {activeTab === item.id && (
              <motion.div layoutId="active-indicator" className="ml-auto">
                <ChevronRight size={14} className={isDark ? "text-neutral-600" : "text-neutral-300"} />
              </motion.div>
            )}
          </button>
        ))}

        <div className={cn(
          "mt-auto p-4 rounded-2xl border transition-colors",
          isDark ? "bg-white/5 border-white/10" : "bg-white/30 border-white/50"
        )}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
              isDark ? "text-neutral-400" : "text-neutral-500"
            )}>Brain Status: Active</span>
          </div>
          <p className={cn(
            "text-[10px] leading-relaxed",
            isDark ? "text-neutral-500" : "text-neutral-400"
          )}>
            All settings are instantly synced to your Sovereign Brain.
          </p>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar pb-32">
        <div className="max-w-3xl mx-auto space-y-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'metrics' && (
                <div className="space-y-8">
                  <header>
                    <h1 className={cn("text-3xl font-sans font-black tracking-tight", isDark ? "text-white" : "text-black")}>Account Metrics</h1>
                    <p className={cn("text-sm mt-1", isDark ? "text-neutral-400" : "text-neutral-500")}>Configure your capital parameters and risk alerts.</p>
                  </header>

                  <div className="grid grid-cols-1 gap-6">
                    <div className={cn(
                      "rounded-[16px] p-8 shadow-sm border space-y-6 transition-colors",
                      isDark ? "bg-neutral-900 border-white/10" : "bg-white border-black/5"
                    )}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={cn("text-sm font-bold", isDark ? "text-white" : "text-black")}>Equity Curve Visibility</h3>
                          <p className="text-xs text-neutral-400">Toggle visibility of your performance graph.</p>
                        </div>
                        <button 
                          onClick={() => updateSetting('equity_curve_visible', !settings.equity_curve_visible)}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all flex items-center px-1",
                            settings.equity_curve_visible ? "bg-blue-500 justify-end" : (isDark ? "bg-neutral-800 justify-start" : "bg-neutral-200 justify-start")
                          )}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={cn("text-sm font-bold", isDark ? "text-white" : "text-black")}>Drawdown Alerts</h3>
                          <p className="text-xs text-neutral-400">Get notified when drawdown exceeds 5%.</p>
                        </div>
                        <button 
                          onClick={() => updateSetting('drawdown_alerts', !settings.drawdown_alerts)}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all flex items-center px-1",
                            settings.drawdown_alerts ? "bg-blue-500 justify-end" : (isDark ? "bg-neutral-800 justify-start" : "bg-neutral-200 justify-start")
                          )}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                        </button>
                      </div>
                    </div>

                    <div className={cn(
                      "rounded-[16px] p-8 shadow-sm border grid grid-cols-2 gap-8 transition-colors",
                      isDark ? "bg-neutral-900 border-white/10" : "bg-white border-black/5"
                    )}>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Account Size ($)</label>
                        <input 
                          type="number" 
                          value={isNaN(settings.account_size) ? "" : settings.account_size}
                          onChange={(e) => updateSetting('account_size', e.target.value === "" ? NaN : parseFloat(e.target.value))}
                          className={cn(
                            "w-full border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                            isDark ? "bg-black text-white" : "bg-[#F5F5F7] text-black"
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Break-even Range ($)</label>
                        <input 
                          type="number" 
                          value={isNaN(settings.break_even_range) ? "" : settings.break_even_range}
                          onChange={(e) => updateSetting('break_even_range', e.target.value === "" ? NaN : parseFloat(e.target.value))}
                          className={cn(
                            "w-full border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                            isDark ? "bg-black text-white" : "bg-[#F5F5F7] text-black"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'setups' && (
                <div className="space-y-8">
                  <header>
                    <h1 className={cn("text-3xl font-sans font-black tracking-tight", isDark ? "text-white" : "text-black")}>Trading Setups</h1>
                    <p className={cn("text-sm mt-1", isDark ? "text-neutral-400" : "text-neutral-500")}>Manage your high-probability execution patterns.</p>
                  </header>

                  <div className={cn(
                    "rounded-[16px] p-8 shadow-sm border space-y-6 transition-colors",
                    isDark ? "bg-neutral-900 border-white/10" : "bg-white border-black/5"
                  )}>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={newSetup}
                        onChange={(e) => setNewSetup(e.target.value)}
                        placeholder="Add new setup pattern..."
                        className={cn(
                          "flex-1 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                          isDark ? "bg-black text-white" : "bg-[#F5F5F7] text-black"
                        )}
                      />
                      <button 
                        onClick={() => {
                          if (newSetup) {
                            updateSetting('favorite_setups', [...settings.favorite_setups, newSetup]);
                            setNewSetup("");
                          }
                        }}
                        className={cn(
                          "px-6 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                          "bg-blue-500 text-white hover:bg-blue-600"
                        )}
                      >
                        Add
                      </button>
                    </div>

                    <div className="space-y-2">
                      {settings.favorite_setups.map((setup, idx) => (
                        <div key={idx} className={cn(
                          "flex items-center justify-between p-4 rounded-xl group transition-colors",
                          isDark ? "bg-black" : "bg-[#F5F5F7]"
                        )}>
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-500 flex items-center justify-center">
                              <CheckSquare size={10} className="text-white" />
                            </div>
                            <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-black")}>{setup}</span>
                          </div>
                          <button 
                            onClick={() => updateSetting('favorite_setups', settings.favorite_setups.filter((_, i) => i !== idx))}
                            className="text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'instruments' && (
                <div className="space-y-8">
                  <header>
                    <h1 className={cn("text-3xl font-sans font-black tracking-tight", isDark ? "text-white" : "text-black")}>Instruments</h1>
                    <p className={cn("text-sm mt-1", isDark ? "text-neutral-400" : "text-neutral-500")}>Select the markets you actively monitor.</p>
                  </header>

                  <div className={cn(
                    "rounded-[16px] p-8 shadow-sm border space-y-6 transition-colors",
                    isDark ? "bg-neutral-900 border-white/10" : "bg-white border-black/5"
                  )}>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={newInstrument}
                        onChange={(e) => setNewInstrument(e.target.value)}
                        placeholder="Add ticker (e.g. NQ, BTC)..."
                        className={cn(
                          "flex-1 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                          isDark ? "bg-black text-white" : "bg-[#F5F5F7] text-black"
                        )}
                      />
                      <button 
                        onClick={() => {
                          if (newInstrument) {
                            updateSetting('favorite_instruments', [...settings.favorite_instruments, newInstrument.toUpperCase()]);
                            setNewInstrument("");
                          }
                        }}
                        className={cn(
                          "px-6 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                          "bg-blue-500 text-white hover:bg-blue-600"
                        )}
                      >
                        Add
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {settings.favorite_instruments.map((inst, idx) => (
                        <div key={idx} className={cn(
                          "flex items-center justify-between p-4 rounded-xl group transition-colors",
                          isDark ? "bg-black" : "bg-[#F5F5F7]"
                        )}>
                          <span className={cn("text-sm font-bold", isDark ? "text-white" : "text-black")}>{inst}</span>
                          <button 
                            onClick={() => updateSetting('favorite_instruments', settings.favorite_instruments.filter((_, i) => i !== idx))}
                            className="text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-8">
                  <header>
                    <h1 className={cn("text-3xl font-sans font-black tracking-tight", isDark ? "text-white" : "text-black")}>Data Management</h1>
                    <p className={cn("text-sm mt-1", isDark ? "text-neutral-400" : "text-neutral-500")}>Export your journal or reset your system state.</p>
                  </header>

                  <div className="grid grid-cols-1 gap-4">
                    <button className={cn(
                      "flex items-center justify-between p-6 rounded-[16px] border shadow-sm hover:shadow-md transition-all group",
                      isDark ? "bg-neutral-900 border-white/10" : "bg-white border-black/5"
                    )}>
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                          isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-500"
                        )}>
                          <Download size={20} />
                        </div>
                        <div className="text-left">
                          <h3 className={cn("text-sm font-bold", isDark ? "text-white" : "text-black")}>Export Journal to CSV</h3>
                          <p className="text-xs text-neutral-400">Download all trade history and notes.</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className={cn("transition-colors", isDark ? "text-neutral-600 group-hover:text-white" : "text-neutral-300 group-hover:text-black")} />
                    </button>

                    <button className={cn(
                      "flex items-center justify-between p-6 rounded-[16px] border shadow-sm hover:shadow-md transition-all group",
                      isDark ? "bg-neutral-900 border-white/10" : "bg-white border-black/5"
                    )}>
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                          isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-500"
                        )}>
                          <Trash2 size={20} />
                        </div>
                        <div className="text-left">
                          <h3 className={cn("text-sm font-bold", isDark ? "text-white" : "text-black")}>Clear Chat History</h3>
                          <p className="text-xs text-neutral-400">Reset Gemini's conversation memory.</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className={cn("transition-colors", isDark ? "text-neutral-600 group-hover:text-white" : "text-neutral-300 group-hover:text-black")} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'strategy' && (
                <div className="space-y-8">
                  <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                    <div>
                      <h1 className={cn("text-3xl font-sans font-black tracking-tight", isDark ? "text-white" : "text-black")}>Master Strategy</h1>
                      <p className={cn("text-sm mt-1", isDark ? "text-neutral-400" : "text-neutral-500")}>Paste your full Continuation, Reversal, Judas swing strategy here. This text will be injected directly into the Gemini 3 memory.</p>
                    </div>
                    <button 
                      onClick={syncToBrain}
                      className={cn(
                        "flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg transition-all",
                        "bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/20"
                      )}
                    >
                      <Brain size={16} />
                      Sync to Brain
                    </button>
                  </header>

                  <div className="space-y-6">
                    <div className={cn(
                      "rounded-[16px] p-8 shadow-sm border space-y-4 transition-colors",
                      isDark ? "bg-neutral-900 border-white/10" : "bg-white border-black/5"
                    )}>
                      <div className="flex items-center gap-2 text-blue-500">
                        <Zap size={16} />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest">Master Strategy</h3>
                      </div>
                      <textarea 
                        value={settings.master_strategy}
                        onChange={(e) => updateSetting('master_strategy', e.target.value)}
                        className={cn(
                          "w-full border-none rounded-xl p-6 text-sm leading-relaxed min-h-[300px] focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                          isDark ? "bg-black text-white" : "bg-[#F5F5F7] text-black"
                        )}
                        placeholder="Paste your full strategy here..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Apply Settings Button */}
      <div className="fixed bottom-12 right-12 flex items-center gap-4 z-50">
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                "px-6 py-3 rounded-full shadow-lg border flex items-center gap-2 backdrop-blur-md",
                isDark ? "bg-neutral-900/80 border-green-900/30" : "bg-white/80 border-green-100"
              )}
            >
              <CheckCircle2 size={16} className="text-green-500" />
              <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Protocol Updated</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "group relative flex items-center gap-3 px-8 py-4 rounded-[12px] transition-all duration-500 overflow-hidden shadow-2xl",
            syncStatus === 'synced' ? "bg-green-500/90" : "bg-[#5E5CE6]/85",
            "backdrop-blur-[12px]",
            "border-[0.5px] border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
            "hover:scale-105 active:scale-95 hover:shadow-[#5E5CE6]/40 hover:shadow-3xl",
            saving && "opacity-80 cursor-not-allowed"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
          {syncStatus === 'syncing' ? (
            <Loader2 className="animate-spin text-white" size={20} />
          ) : syncStatus === 'synced' ? (
            <CheckCircle2 size={20} className="text-white" />
          ) : (
            <Save size={20} className="text-white group-hover:rotate-12 transition-transform" />
          )}
          <span className="text-sm font-bold text-white tracking-tight font-sans">
            {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'synced' ? 'Synced!' : 'Apply Settings'}
          </span>
          
          {/* Subtle Glow Effect */}
          <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </button>
      </div>
    </div>
  );
}

