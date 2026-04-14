import React from 'react';
import { X, Calendar, ArrowLeftRight, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Trade } from '../types';

interface DayTradeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  trades: Trade[];
  isDark: boolean;
}

export const DayTradeLogModal: React.FC<DayTradeLogModalProps> = ({
  isOpen,
  onClose,
  date,
  trades,
  isDark
}) => {
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl_amount, 0);
  const winners = trades.filter(t => t.pnl_amount > 0).length;
  const losers = trades.filter(t => t.pnl_amount < 0).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative w-full max-w-2xl rounded-2xl border overflow-hidden shadow-2xl",
              isDark ? "bg-[#0a0a0a] border-white/10" : "bg-white border-neutral-200"
            )}
          >
            {/* Header */}
            <div className={cn(
              "p-6 border-b flex justify-between items-center",
              isDark ? "border-white/5 bg-white/[0.02]" : "border-neutral-100 bg-neutral-50"
            )}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2 rounded-lg",
                  isDark ? "bg-white/5 text-white/60" : "bg-neutral-200 text-neutral-600"
                )}>
                  <Calendar size={20} />
                </div>
                <div>
                  <h2 className={cn("text-lg font-black tracking-tight", isDark ? "text-white" : "text-black")}>
                    Trade Log
                  </h2>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest opacity-40", isDark ? "text-white" : "text-black")}>
                    {formattedDate}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isDark ? "hover:bg-white/5 text-white/40 hover:text-white" : "hover:bg-neutral-200 text-neutral-400 hover:text-black"
                )}
              >
                <X size={20} />
              </button>
            </div>

            {/* Stats Summary */}
            <div className={cn(
              "grid grid-cols-3 gap-px border-b",
              isDark ? "bg-white/5 border-white/5" : "bg-neutral-200 border-neutral-200"
            )}>
              <div className={cn("p-6 flex flex-col items-center justify-center", isDark ? "bg-black" : "bg-white")}>
                <span className={cn("text-[9px] font-bold uppercase tracking-widest mb-1 opacity-40", isDark ? "text-white" : "text-black")}>Total PnL</span>
                <span className={cn("text-xl font-black tracking-tighter", totalPnL >= 0 ? "text-accent-green" : "text-accent-red")}>
                  {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
                </span>
              </div>
              <div className={cn("p-6 flex flex-col items-center justify-center", isDark ? "bg-black" : "bg-white")}>
                <span className={cn("text-[9px] font-bold uppercase tracking-widest mb-1 opacity-40", isDark ? "text-white" : "text-black")}>Trades</span>
                <span className={cn("text-xl font-black tracking-tighter", isDark ? "text-white" : "text-black")}>
                  {trades.length}
                </span>
              </div>
              <div className={cn("p-6 flex flex-col items-center justify-center", isDark ? "bg-black" : "bg-white")}>
                <span className={cn("text-[9px] font-bold uppercase tracking-widest mb-1 opacity-40", isDark ? "text-white" : "text-black")}>Win Rate</span>
                <span className={cn("text-xl font-black tracking-tighter", isDark ? "text-white" : "text-black")}>
                  {trades.length > 0 ? Math.round((winners / trades.length) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Trade List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={cn(
                    "sticky top-0 z-10 border-b",
                    isDark ? "bg-[#0a0a0a] border-white/5" : "bg-neutral-50 border-neutral-100"
                  )}>
                    <th className={cn("px-6 py-3 text-[9px] font-bold uppercase tracking-[0.3em]", isDark ? "text-white/40" : "text-neutral-500")}>Time</th>
                    <th className={cn("px-6 py-3 text-[9px] font-bold uppercase tracking-[0.3em]", isDark ? "text-white/40" : "text-neutral-500")}>Instrument</th>
                    <th className={cn("px-6 py-3 text-[9px] font-bold uppercase tracking-[0.3em] text-center", isDark ? "text-white/40" : "text-neutral-500")}>Side</th>
                    <th className={cn("px-6 py-3 text-[9px] font-bold uppercase tracking-[0.3em] text-right", isDark ? "text-white/40" : "text-neutral-500")}>PnL</th>
                  </tr>
                </thead>
                <tbody className={cn("divide-y", isDark ? "divide-white/5" : "divide-neutral-100")}>
                  {trades.map((trade) => (
                    <tr key={trade.id} className={cn("group transition-all duration-300", isDark ? "hover:bg-white/5" : "hover:bg-neutral-50")}>
                      <td className={cn("px-6 py-4 text-[11px] font-bold", isDark ? "text-white/60" : "text-neutral-600")}>
                        {trade.entry_time}
                      </td>
                      <td className={cn("px-6 py-4 text-[11px] font-black uppercase tracking-tight", isDark ? "text-white" : "text-black")}>
                        {trade.instrument}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-2 py-0.5 text-[8px] font-bold uppercase rounded-md border",
                          trade.direction === "Buy" 
                            ? "bg-accent-green/10 text-accent-green border-accent-green/20" 
                            : "bg-accent-red/10 text-accent-red border-accent-red/20"
                        )}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className={cn(
                        "px-6 py-4 text-[11px] font-black text-right",
                        trade.pnl_amount >= 0 ? "text-accent-green" : "text-accent-red"
                      )}>
                        {trade.pnl_amount >= 0 ? '+' : ''}{formatCurrency(trade.pnl_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className={cn(
              "p-4 border-t text-center",
              isDark ? "border-white/5 bg-white/[0.01]" : "border-neutral-100 bg-neutral-50"
            )}>
              <p className={cn("text-[9px] font-bold uppercase tracking-widest opacity-30", isDark ? "text-white" : "text-black")}>
                Sovereign Analyst Ops • Trade Log Protocol
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
