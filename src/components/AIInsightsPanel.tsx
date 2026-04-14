import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, AlertCircle, X, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { askGemini, getGeminiStats, DAILY_LIMIT } from "../services/geminiService";
import ReactMarkdown from "react-markdown";

interface AIInsightsPanelProps {
  id: string;
  data: any;
  prompt: string;
  isDark: boolean;
}

export function AIInsightsPanel({ id, data, prompt, isDark }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState(getGeminiStats());

  useEffect(() => {
    const handleUpdate = () => setStats(getGeminiStats());
    window.addEventListener('gemini-stats-updated', handleUpdate as EventListener);
    return () => window.removeEventListener('gemini-stats-updated', handleUpdate as EventListener);
  }, []);

  const isLimitReached = stats.count >= DAILY_LIMIT;

  const cacheKey = `ai_insights_${id}`;

  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setInsights(cached);
    }
  }, [cacheKey]);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const dataString = JSON.stringify(data);
      const fullPrompt = `${prompt}\n\nData: ${dataString}`;
      const response = await askGemini(fullPrompt);
      setInsights(response);
      localStorage.setItem(cacheKey, response);
    } catch (err: any) {
      console.error("AI Insights Error:", err);
      setError(err.message || "Failed to fetch AI insights.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      if (!insights) {
        fetchInsights();
      }
    } else {
      setIsOpen(false);
    }
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetchInsights();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleToggle}
        disabled={(loading && !isOpen) || (isLimitReached && !insights)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          "hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100",
          isLimitReached && !insights ? "bg-neutral-500/10 text-neutral-500 border-neutral-500/20 cursor-not-allowed" :
          isDark 
            ? "bg-accent-green/10 text-accent-green border border-accent-green/20 hover:bg-accent-green/20" 
            : "bg-black text-white hover:bg-neutral-800"
        )}
      >
        {loading && !isOpen ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {isLimitReached && !insights ? "AI Limit Reached" : isOpen ? "Close AI Insights" : "Get AI Insights"}
      </button>

      {isLimitReached && !insights && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-red-500/60 ml-1">
          Daily AI limit reached. Resets at midnight.
        </p>
      )}

      <AnimatePresence>
        {isOpen && (insights || error || loading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "p-6 rounded-xl border transition-all duration-300 relative group",
              isDark 
                ? "bg-neutral-900/50 border-neutral-800" 
                : "bg-white border-neutral-200 shadow-sm"
            )}
          >
            <button
              onClick={() => setIsOpen(false)}
              className={cn(
                "absolute top-4 right-4 p-1 rounded-md transition-colors",
                isDark ? "hover:bg-white/10 text-neutral-500" : "hover:bg-neutral-100 text-neutral-400"
              )}
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                isDark ? "bg-accent-green/10" : "bg-neutral-100"
              )}>
                <Sparkles className={cn(
                  "w-5 h-5",
                  isDark ? "text-accent-green" : "text-black"
                )} />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={cn(
                    "text-sm font-semibold uppercase tracking-wider",
                    isDark ? "text-neutral-400" : "text-neutral-500"
                  )}>
                    AI Trading Coach Analysis
                  </h3>
                  
                  {insights && !loading && (
                    <button
                      onClick={handleRefresh}
                      disabled={isLimitReached}
                      className={cn(
                        "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                        isDark ? "text-accent-green hover:text-accent-green/80" : "text-neutral-600 hover:text-black"
                      )}
                    >
                      <RefreshCw size={12} className={cn(loading && "animate-spin")} />
                      {isLimitReached ? "Limit Reached" : "Refresh Analysis"}
                    </button>
                  )}
                </div>
                
                {loading ? (
                  <div className="flex items-center gap-3 py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-accent-green" />
                    <span className={cn("text-sm", isDark ? "text-neutral-400" : "text-neutral-500")}>
                      Generating insights...
                    </span>
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-2 text-red-500 text-sm py-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                ) : (
                  <div className={cn(
                    "text-sm leading-relaxed prose prose-sm max-w-none",
                    isDark ? "prose-invert text-neutral-300" : "text-neutral-700"
                  )}>
                    <ReactMarkdown>{insights || ""}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
