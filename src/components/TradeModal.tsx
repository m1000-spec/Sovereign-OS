import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Calculator, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

const FormGroup = ({ label, children, isDark, accent = false }: { label: string; children: React.ReactNode; isDark: boolean; accent?: boolean }) => (
  <div className="space-y-2">
    <label className={cn(
      "text-[10px] font-bold uppercase tracking-widest",
      accent ? "text-accent-green" : (isDark ? "text-white/40" : "text-neutral-500")
    )}>
      {label}
    </label>
    {children}
  </div>
);

export const TradeModal = ({ isOpen, onClose, isDark }: TradeModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 md:p-12 border shadow-2xl",
              isDark ? "bg-[#050505]/90 backdrop-blur-3xl border-accent-green/20" : "bg-white border-neutral-200"
            )}
          >
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className={cn("text-3xl font-sans font-black tracking-tight flex items-center gap-3", isDark ? "text-white" : "text-black")}>
                  <FileText className="text-accent-green" />
                  Manual Trade Log
                </h2>
                <p className={cn("text-[10px] font-bold tracking-[0.3em] mt-2 uppercase", isDark ? "text-accent-green" : "text-neutral-500")}>
                  Protocol Execution // Analyst_01
                </p>
              </div>
              <button 
                onClick={onClose}
                className={cn("w-10 h-10 rounded-full flex items-center justify-center border transition-all", isDark ? "border-white/10 text-white/40 hover:text-white hover:bg-white/10" : "border-neutral-200 text-neutral-400 hover:text-black hover:bg-neutral-100")}
              >
                <X size={20} />
              </button>
            </div>

            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormGroup label="Trade Date" isDark={isDark}>
                  <input className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")} type="date" defaultValue="2024-10-24" />
                </FormGroup>
                <FormGroup label="Entry Time" isDark={isDark}>
                  <input className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")} type="time" />
                </FormGroup>
                <FormGroup label="Exit Time" isDark={isDark}>
                  <input className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")} type="time" />
                </FormGroup>
                <FormGroup label="Instrument" isDark={isDark}>
                  <input className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")} placeholder="e.g. BTC/USDT" type="text" />
                </FormGroup>
                <FormGroup label="Direction" isDark={isDark}>
                  <select className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none appearance-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")}>
                    <option className={isDark ? "bg-black" : "bg-white"}>LONG</option>
                    <option className={isDark ? "bg-black" : "bg-white"}>SHORT</option>
                  </select>
                </FormGroup>
                <FormGroup label="Session" isDark={isDark}>
                  <select className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none appearance-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")}>
                    <option className={isDark ? "bg-black" : "bg-white"}>New York</option>
                    <option className={isDark ? "bg-black" : "bg-white"}>London</option>
                    <option className={isDark ? "bg-black" : "bg-white"}>Asia</option>
                  </select>
                </FormGroup>
              </div>

              <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl border", isDark ? "bg-accent-green/5 border-accent-green/10" : "bg-neutral-50 border-neutral-200")}>
                <FormGroup label="Risk ($)" isDark={isDark} accent>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-green/40">$</span>
                    <input className={cn("w-full rounded-2xl pl-8 pr-4 py-3 text-sm focus:ring-1 transition-all outline-none", isDark ? "bg-black/40 border border-accent-green/20 text-white focus:ring-accent-green" : "bg-white border border-neutral-200 text-black focus:ring-black")} placeholder="0.00" type="number" />
                  </div>
                </FormGroup>
                <FormGroup label="P&L ($)" isDark={isDark} accent>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-green/40">$</span>
                    <input className={cn("w-full rounded-2xl pl-8 pr-4 py-3 text-sm focus:ring-1 transition-all outline-none", isDark ? "bg-black/40 border border-accent-green/20 text-white focus:ring-accent-green" : "bg-white border border-neutral-200 text-black focus:ring-black")} placeholder="0.00" type="number" />
                  </div>
                </FormGroup>
                <FormGroup label="R Multiple" isDark={isDark} accent>
                  <div className={cn("flex items-center h-12 px-4 border border-dashed rounded-2xl", isDark ? "bg-accent-green/10 border-accent-green/30" : "bg-white border-neutral-300")}>
                    <span className={cn("text-sm font-sans font-black", isDark ? "text-accent-green" : "text-black")}>0.0 R</span>
                    <Calculator size={16} className="ml-auto text-accent-green/40" />
                  </div>
                </FormGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup label="Trade Notes" isDark={isDark}>
                  <textarea className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none resize-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")} placeholder="Analyze the psychological state and execution quality..." rows={4}></textarea>
                </FormGroup>
                <FormGroup label="Screenshots" isDark={isDark}>
                  <div className={cn("h-[124px] border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all", isDark ? "border-white/10 bg-white/5 hover:border-accent-green/40" : "border-neutral-200 bg-neutral-50 hover:border-black")}>
                    <ImageIcon size={24} className={isDark ? "text-white/20" : "text-neutral-300"} />
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", isDark ? "text-white/40 group-hover:text-accent-green" : "text-neutral-400 group-hover:text-black")}>
                      Click to add screenshots
                    </span>
                  </div>
                </FormGroup>
              </div>

              <div className="flex gap-4 pt-4">
                <button className={cn(
                  "flex-1 font-sans font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm",
                  isDark ? "bg-accent-green text-black shadow-[0_0_30px_rgba(0,255,65,0.3)] hover:shadow-[0_0_50px_rgba(0,255,65,0.5)]" : "bg-black text-white"
                )}>
                  Commit Trade to Ledger
                </button>
                <button 
                  onClick={onClose}
                  className={cn("px-8 font-bold py-4 rounded-2xl transition-all uppercase tracking-widest text-xs", isDark ? "bg-white/5 border border-white/10 text-white hover:bg-white/10" : "bg-neutral-100 border border-neutral-200 text-black hover:bg-neutral-200")}
                >
                  Discard
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
