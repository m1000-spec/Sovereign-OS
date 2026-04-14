import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Mic, 
  MicOff, 
  Loader2, 
  RefreshCw, 
  Volume2, 
  Save, 
  Brain, 
  History, 
  Send, 
  Settings as SettingsIcon,
  User,
  Bot,
  ChevronDown,
  Sparkles,
  Zap,
  Square,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Phone,
  Plus,
  FileText,
  Image as ImageIcon,
  Paperclip,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { askGemini, getGeminiStats, DAILY_LIMIT } from "../services/geminiService";
import { useTradeStore } from "../store/useTradeStore";
import { supabase } from "../lib/supabase";
import { VoiceInterface } from "./VoiceInterface";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  verdict?: 'A+ Setup' | 'Good Setup' | 'No Trade';
  timestamp: Date;
}

interface GeminiPageProps {
  isDark: boolean;
}

const DEFAULT_STRATEGY = "Enter your trading strategy in the Bridge Configuration sidebar to begin.";

export default function GeminiPage({ isDark }: GeminiPageProps) {
  const [isListening, setIsListening] = useState(false);
  const [isLiveVoice, setIsLiveVoice] = useState(false);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const [isVoiceResponseEnabled, setIsVoiceResponseEnabled] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; type: string; data: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [transcript, setTranscript] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState(getGeminiStats());
  const [strategy, setStrategy] = useState(() => {
    const localData = localStorage.getItem('user_settings_cache');
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        return parsed.master_strategy || DEFAULT_STRATEGY;
      } catch (e) {
        return DEFAULT_STRATEGY;
      }
    }
    return DEFAULT_STRATEGY;
  });
  const [strategySummary, setStrategySummary] = useState("");
  const [isStrategyLoading, setIsStrategyLoading] = useState(true);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | Event) => {
      const localData = localStorage.getItem('user_settings_cache');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (parsed.master_strategy && parsed.master_strategy !== strategy) {
            setStrategy(parsed.master_strategy);
          }
        } catch (e) {
          console.error("Error parsing settings cache:", e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events from Settings.tsx
    window.addEventListener('user-settings-updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-settings-updated', handleStorageChange);
    };
  }, [strategy]);

  useEffect(() => {
    const fetchStrategy = async () => {
      setIsStrategyLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('user_settings')
            .select('master_strategy')
            .eq('user_id', user.id)
            .single();
          
          if (data && data.master_strategy) {
            setStrategy(data.master_strategy);
            const currentCache = JSON.parse(localStorage.getItem('user_settings_cache') || '{}');
            localStorage.setItem('user_settings_cache', JSON.stringify({
              ...currentCache,
              master_strategy: data.master_strategy
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching strategy:", err);
      } finally {
        setIsStrategyLoading(false);
      }
    };
    fetchStrategy();
  }, []);

  const [isSavingStrategy, setIsSavingStrategy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus] = useState<'Idle' | 'Listening' | 'Thinking' | 'Done'>('Idle');
  const [recentTradesMemory, setRecentTradesMemory] = useState("");

  const { trades } = useTradeStore();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const last20Trades = useMemo(() => trades.slice(0, 20), [trades]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const bridgeMemory = useMemo(() => {
    if (last20Trades.length === 0) return null;

    const sessions: Record<string, { wins: number; total: number }> = {};
    const setups: Record<string, { pnl: number; total: number }> = {};
    let ruleViolations = 0;

    last20Trades.forEach(t => {
      if (!sessions[t.session]) sessions[t.session] = { wins: 0, total: 0 };
      sessions[t.session].total++;
      if (t.pnl_amount > 0) sessions[t.session].wins++;

      const setupName = t.setup || "Unknown";
      if (!setups[setupName]) setups[setupName] = { pnl: 0, total: 0 };
      setups[setupName].pnl += t.pnl_amount;
      setups[setupName].total++;

      if (!t.rules_followed) ruleViolations++;
    });

    const bestSetup = Object.entries(setups).reduce((a, b) => a[1].pnl > b[1].pnl ? a : b)[0];
    const worstSetup = Object.entries(setups).reduce((a, b) => a[1].pnl < b[1].pnl ? a : b)[0];

    return {
      sessions: Object.entries(sessions).map(([name, data]) => ({
        name,
        winRate: (data.wins / data.total) * 100
      })),
      bestSetup,
      worstSetup,
      ruleViolations
    };
  }, [last20Trades]);

  useEffect(() => {
    const handleUpdate = () => setStats(getGeminiStats());
    window.addEventListener('gemini-stats-updated', handleUpdate as EventListener);
    return () => window.removeEventListener('gemini-stats-updated', handleUpdate as EventListener);
  }, []);

  useEffect(() => {
    const handleBridgeMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SOVEREIGN_BRIDGE_DATA') {
        const text = event.data.payload;
        if (text) {
          processInput(text);
        }
      }
    };

    window.addEventListener('message', handleBridgeMessage);
    return () => window.removeEventListener('message', handleBridgeMessage);
  }, []);

  const isLimitReached = stats.count >= DAILY_LIMIT;
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setManualInput(prev => prev + (prev ? " " : "") + text);
        setIsListening(false);
        setStatus('Idle');
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          alert("Microphone permission denied. Please enable it in your browser settings.");
          setError("Microphone access denied.");
        } else if (event.error === 'no-speech') {
          // Ignore no-speech errors as they are common and not critical
        } else if (event.error === 'network') {
          alert("Network error during speech recognition. Please check your connection.");
          setError("Network error.");
        } else {
          alert(`Speech recognition error: ${event.error}`);
          setError(`Speech error: ${event.error}`);
        }
        setIsListening(false);
        setStatus('Idle');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Only reset status if we were actually listening
        setStatus(prev => prev === 'Listening' ? 'Idle' : prev);
      };
    } else if (!SpeechRecognition) {
      setError("Speech recognition not supported.");
    }
  }, []);

  const fetchRecentTradesMemory = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('pnl_amount, notes')
        .order('trade_date', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data) {
        const memory = data.map((t, i) => `Trade ${i+1}: Result: ${t.pnl_amount > 0 ? 'Win' : 'Loss'} ($${t.pnl_amount}), Notes: ${t.notes || 'No notes'}`).join('\n');
        setRecentTradesMemory(memory);
      }
    } catch (err) {
      console.error("Error fetching trades memory:", err);
    }
  };

  useEffect(() => {
    fetchRecentTradesMemory();
  }, []);

  const extractVerdict = (text: string): Message['verdict'] => {
    const lower = text.toLowerCase();
    if (lower.includes('a+ setup')) return 'A+ Setup';
    if (lower.includes('good setup')) return 'Good Setup';
    if (lower.includes('no trade')) return 'No Trade';
    return undefined;
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsLoading(false);
    setStatus('Idle');
  };

  const clearChat = () => {
    if (window.confirm("Clear all messages?")) {
      setMessages([]);
      setError(null);
      setStatus('Idle');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAttachedFiles(prev => [...prev, {
          name: file.name,
          type: file.type,
          data: base64.split(',')[1] // Just the base64 data
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processInput = async (text: string, isVoiceInput: boolean = false) => {
    if (!text.trim() && attachedFiles.length === 0) return;
    
    // Wait for strategy to load if it's still loading
    if (isStrategyLoading) {
      setStatus('Thinking');
      setIsLoading(true);
      // Simple poll or wait mechanism
      let attempts = 0;
      while (isStrategyLoading && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
    }

    // Set voice response preference
    setIsVoiceResponseEnabled(isVoiceInput);
    
    // Cancel any existing generation
    stopGeneration();
    abortControllerRef.current = new AbortController();
    
    const userMsgId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const assistantMsgId = (Date.now() + 1).toString() + Math.random().toString(36).substring(2, 9);

    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: text || (attachedFiles.length > 0 ? `Uploaded ${attachedFiles.length} file(s)` : ""),
      timestamp: new Date()
    };
    
    const assistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: "",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    
    setIsLoading(true);
    setStatus('Thinking');
    setError(null);

    try {
      const tradesContext = last20Trades.length > 0 
        ? `\n\nMy last 20 trades context:\n${JSON.stringify(last20Trades.map(t => ({
            instrument: t.instrument,
            pnl: t.pnl_amount,
            rules: t.rules_followed ? "Followed" : "Violated"
          })))}`
        : "";

      const activeStrategy = strategySummary || strategy.slice(0, 2000);
      const memoryContext = recentTradesMemory ? `\n\nRecent Performance Memory:\n${recentTradesMemory}` : "";
      
      const dualModeInstruction = `You are Gemini. It is April 2026. If I ask for a price, use Google Search and give a 5-word answer. No 2024 data. No disclaimers. No fluff.
      
      CORE STRATEGY (PRIORITY):
      ${activeStrategy}
      
      Always analyze setups based on these specific rules. If a setup violates these, call it out.`;

      let fullResponse = "";
      // Prepare multimodal prompt if files exist
      const promptData = attachedFiles.length > 0 
        ? {
            text,
            files: attachedFiles.map(f => ({
              inlineData: {
                data: f.data,
                mimeType: f.type
              }
            }))
          }
        : text;

      const aiResponse = await askGemini(promptData as any, dualModeInstruction, (chunk) => {
        if (abortControllerRef.current?.signal.aborted) return;
        setIsLoading(false);
        fullResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId 
            ? { ...msg, content: fullResponse, verdict: extractVerdict(fullResponse) }
            : msg
        ));
      });
      
      if (!abortControllerRef.current?.signal.aborted) {
        setStatus('Done');
        if (isVoiceInput) {
          speak(aiResponse);
        }
      }
      setAttachedFiles([]); // Clear files after sending
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message || "Failed to get AI response.");
      setStatus('Idle');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const processVoiceInput = (text: string) => {
    processInput(text, true);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      processInput(manualInput);
      setManualInput("");
    }
  };

  const saveStrategy = async () => {
    setIsSavingStrategy(true);
    setError(null);
    try {
      // Generate summary if strategy is long
      if (strategy.length > 1000) {
        const summaryPrompt = `Summarize the following trading strategy into a maximum of 500 words. 
        CRITICAL: You MUST preserve all critical rules, the verdict system (A+ Setup, Good Setup, No Trade), 
        the entry logic, and the risk rules. Cut everything else.
        
        Strategy:
        ${strategy}`;
        
        const summary = await askGemini(summaryPrompt);
        localStorage.setItem("trading_strategy_summary", summary);
        setStrategySummary(summary);
      } else {
        localStorage.removeItem("trading_strategy_summary");
        setStrategySummary("");
      }
    } catch (err: any) {
      console.error("Error saving strategy:", err);
      setError("Failed to compress strategy. Using full version.");
    } finally {
      setIsSavingStrategy(false);
    }
  };

  // Remove redundant localStorage save
  useEffect(() => {
    // No-op, handled by saveStrategyToDB
  }, [strategy]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setStatus('Idle');
    } else {
      setTranscript("");
      setError(null);
      recognitionRef.current?.start();
      setIsListening(true);
      setStatus('Listening');
    }
  };

  const toggleLiveVoice = () => {
    setShowVoiceInterface(true);
  };

  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');

  return (
    <div className={cn(
      "flex-1 flex flex-col h-full pt-14 transition-colors duration-300",
      isDark ? "bg-[#050505]" : "bg-neutral-50"
    )}>
      <AnimatePresence>
        {showVoiceInterface && (
          <VoiceInterface 
            isOpen={showVoiceInterface}
            onClose={() => setShowVoiceInterface(false)}
            isDark={isDark}
            systemInstruction={strategySummary || strategy}
          />
        )}
      </AnimatePresence>

      {/* Header with Settings Toggle */}
      <div className={cn(
        "px-6 py-3 border-b flex justify-between items-center shrink-0",
        isDark ? "border-white/5 bg-black/20" : "border-neutral-200 bg-white"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg relative",
            isDark ? "bg-accent-green/10 text-accent-green" : "bg-black text-white"
          )}>
            <Sparkles size={18} />
            {isLoading && (
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-lg bg-accent-green/20"
              />
            )}
          </div>
          <div>
            <h1 className={cn("text-sm font-black tracking-tight uppercase", isDark ? "text-white" : "text-black")}>Gemini</h1>
            <div className="flex items-center gap-1.5">
              <div className={cn("w-1 h-1 rounded-full animate-pulse", isDark ? "bg-accent-green" : "bg-green-500")} />
              <span className={cn("text-[8px] font-bold uppercase tracking-widest opacity-40", isDark ? "text-white" : "text-black")}>
                {isLoading ? "Accessing Google Search & Code Interpreter..." : "Live Multimodal Stream"}
              </span>
            </div>
          </div>
        </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={clearChat}
              className={cn(
                "p-2 rounded-lg transition-all",
                isDark ? "hover:bg-white/5 text-white/40" : "hover:bg-neutral-100 text-neutral-400"
              )}
              title="Clear Chat"
            >
              <Trash2 size={18} />
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "p-2 rounded-lg transition-all",
                showSettings ? (isDark ? "bg-accent-green text-black" : "bg-black text-white") : (isDark ? "hover:bg-white/5 text-white/40" : "hover:bg-neutral-100 text-neutral-400")
              )}
            >
              <SettingsIcon size={18} />
            </button>
          </div>
      </div>

      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Main Interface Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Chat Layout */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar flex flex-col items-center">
              {messages.length === 0 && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                  <Sparkles size={48} className={isDark ? "text-white" : "text-black"} />
                  <p className={cn("text-xs font-bold uppercase tracking-[0.3em]", isDark ? "text-white" : "text-black")}>
                    Gemini is ready
                  </p>
                </div>
              )}
              <div className="w-full max-w-2xl space-y-6">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "p-4 rounded-2xl border flex flex-col items-center gap-4 text-center",
                      isDark ? "bg-red-500/10 border-red-500/20" : "bg-red-50 bg-red-100"
                    )}
                  >
                    <div className="flex items-center gap-2 text-red-500">
                      <X size={18} />
                      <span className="text-xs font-bold uppercase tracking-widest">Connection Error</span>
                    </div>
                    <p className={cn("text-sm", isDark ? "text-white/60" : "text-neutral-600")}>{error}</p>
                    <button 
                      onClick={() => {
                        setError(null);
                        setStatus('Idle');
                      }}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        isDark ? "bg-white text-black hover:bg-accent-green" : "bg-black text-white hover:bg-neutral-800"
                      )}
                    >
                      <RefreshCw size={14} />
                      Reconnect
                    </button>
                  </motion.div>
                )}
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-4",
                      msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      msg.role === 'user' 
                        ? (isDark ? "bg-white/10 text-white" : "bg-neutral-200 text-neutral-600")
                        : (isDark ? "bg-accent-green/20 text-accent-green" : "bg-black text-white")
                    )}>
                      {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                    </div>
                    <div className={cn("space-y-2 max-w-[80%]", msg.role === 'user' ? "text-right" : "text-left")}>
                      <div className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed inline-block text-left",
                        msg.role === 'user'
                          ? (isDark ? "bg-white/5 text-white" : "bg-white border border-neutral-200 text-black shadow-sm")
                          : (isDark ? "bg-neutral-900 text-white/90" : "bg-neutral-100 text-neutral-800")
                      )}>
                        {msg.verdict && (
                          <div className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest mb-3",
                            msg.verdict === 'A+ Setup' ? "bg-accent-green text-black" :
                            msg.verdict === 'Good Setup' ? "bg-yellow-500 text-black" :
                            "bg-accent-red text-white"
                          )}>
                            {msg.verdict}
                          </div>
                        )}
                        {msg.role === 'assistant' && msg.content === "" ? (
                          <div className="flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin text-accent-green" />
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-40", isDark ? "text-white" : "text-black")}>Thinking...</span>
                          </div>
                        ) : (
                          <p>{msg.content}</p>
                        )}
                      </div>
                      <span className={cn("text-[8px] font-bold uppercase tracking-widest opacity-20 block")}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div ref={chatEndRef} />
            </div>

            {/* Desktop Input Bar */}
            <div className={cn("p-6 border-t", isDark ? "border-white/5 bg-black/40" : "border-neutral-200 bg-white")}>
              <form onSubmit={handleManualSubmit} className="max-w-4xl mx-auto space-y-4">
                {/* File Preview Area */}
                <AnimatePresence>
                  {attachedFiles.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex gap-2 flex-wrap"
                    >
                      {attachedFiles.map((file, i) => (
                        <div key={i} className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest",
                          isDark ? "bg-white/5 border-white/10 text-white/60" : "bg-neutral-100 border-neutral-200 text-neutral-600"
                        )}>
                          {file.type.startsWith('image/') ? <ImageIcon size={12} /> : <FileText size={12} />}
                          <span className="max-w-[100px] truncate">{file.name}</span>
                          <button onClick={() => removeFile(i)} className="hover:text-red-500 transition-colors">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                    accept="image/*,.pdf,.txt"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all",
                      isDark ? "bg-white/5 text-white/40 hover:bg-white/10" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                    )}
                  >
                    <Plus size={18} />
                  </button>
                  <input 
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Describe your setup or ask a question..."
                    className={cn(
                      "w-full pl-14 pr-14 py-4 rounded-2xl text-sm transition-all outline-none border",
                      isDark 
                        ? "bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-accent-green/50" 
                        : "bg-neutral-100 border-neutral-200 text-black placeholder:text-neutral-400 focus:border-black/50"
                    )}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {isLoading ? (
                      <button
                        type="button"
                        onClick={stopGeneration}
                        className={cn(
                          "p-2.5 rounded-xl transition-all bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        )}
                        title="Stop Generation"
                      >
                        <Square size={18} fill="currentColor" />
                      </button>
                    ) : manualInput.trim() || attachedFiles.length > 0 ? (
                      <button
                        type="submit"
                        disabled={isLoading || isLimitReached}
                        className={cn(
                          "p-2.5 rounded-xl transition-all disabled:opacity-20",
                          isDark ? "bg-accent-green text-black" : "bg-black text-white"
                        )}
                      >
                        <Send size={18} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={cn(
                          "p-2.5 rounded-xl transition-all",
                          isListening 
                            ? "bg-red-500 text-white" 
                            : (isDark ? "hover:bg-white/10 text-white/40" : "hover:bg-neutral-200 text-neutral-500")
                        )}
                      >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Settings Sidebar (Strategy + Memory) */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className={cn(
                "absolute md:relative right-0 top-0 bottom-0 w-80 md:w-80 z-50 border-l overflow-y-auto custom-scrollbar",
                isDark ? "bg-black border-white/5" : "bg-white border-neutral-200"
              )}
            >
              <div className="p-6 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className={cn("text-xs font-black uppercase tracking-widest", isDark ? "text-white" : "text-black")}>Bridge Configuration</h2>
                  <button onClick={() => setShowSettings(false)} className="p-2 opacity-40 hover:opacity-100">
                    <ChevronDown size={20} />
                  </button>
                </div>

                {/* Bridge Memory Section */}
                {bridgeMemory && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-accent-green" />
                      <h3 className={cn("text-[10px] font-bold uppercase tracking-[0.2em]", isDark ? "text-white/40" : "text-neutral-500")}>
                        Memory (Last 20 Trades)
                      </h3>
                    </div>
                    <div className={cn(
                      "grid grid-cols-1 gap-4 p-5 rounded-2xl border text-left",
                      isDark ? "bg-white/5 border-white/10" : "bg-neutral-50 border-neutral-200"
                    )}>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">Best Setup</span>
                          <p className="text-xs font-black truncate">{bridgeMemory.bestSetup}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">Worst Setup</span>
                          <p className="text-xs font-black truncate">{bridgeMemory.worstSetup}</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-white/5">
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">Session Win Rates</span>
                        <div className="flex gap-3 flex-wrap mt-1">
                          {bridgeMemory.sessions.map(s => (
                            <div key={s.name} className="flex items-center gap-1.5">
                              <div className={cn("w-1 h-1 rounded-full", s.winRate > 50 ? "bg-accent-green" : "bg-accent-red")} />
                              <span className="text-[9px] font-bold">{s.name}: {s.winRate.toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Strategy Knowledge Input */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-accent-green" />
                      <h3 className={cn("text-[10px] font-bold uppercase tracking-[0.2em]", isDark ? "text-white/40" : "text-neutral-500")}>
                        Strategy Knowledge Base
                      </h3>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={strategy}
                      readOnly
                      placeholder="No strategy found. Update in Settings."
                      rows={15}
                      className={cn(
                        "w-full bg-transparent border rounded-2xl p-4 text-xs leading-relaxed resize-none transition-all outline-none",
                        isDark ? "bg-white/5 border-white/10 text-white/40" : "bg-neutral-50 border-neutral-200 text-neutral-400"
                      )}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <span className={cn("text-[8px] font-bold uppercase tracking-widest opacity-30", isDark ? "text-white" : "text-black")}>
                        Read Only • Synced from Settings
                      </span>
                    </div>
                  </div>
                  <p className={cn("text-[9px] font-medium italic opacity-40 leading-relaxed", isDark ? "text-white" : "text-black")}>
                    This strategy is dynamically loaded from your user settings and injected into every prompt. To edit, go to the Settings page.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
