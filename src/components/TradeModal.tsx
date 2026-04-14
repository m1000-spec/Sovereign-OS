import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Calculator, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Trade, TradeFormData } from '../types';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  tradeToEdit?: Trade | null;
  instruments?: { id: number, name: string, color: string }[];
  setups?: string[];
  tagGroups?: { id: string, title: string, tags: { id: string, label: string, color: string }[] }[];
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

export const TradeModal = ({ isOpen, onClose, isDark, tradeToEdit, instruments = [], setups = [], tagGroups = [] }: TradeModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TradeFormData>({
    trade_date: new Date().toISOString().split('T')[0],
    entry_time: '',
    exit_time: '',
    instrument: '',
    direction: 'LONG',
    session: 'New York',
    risk_amount: '',
    pnl_amount: '',
    notes: '',
    setup: '',
    timeframe: '15M',
    duration: '',
    tags: '',
    rules_followed: false,
    screenshots: []
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (tradeToEdit) {
      setFormData({
        ...tradeToEdit,
        risk_amount: tradeToEdit.risk_amount.toString(),
        pnl_amount: tradeToEdit.pnl_amount.toString(),
        duration: tradeToEdit.duration?.toString() || '',
        tags: tradeToEdit.tags || '',
        rules_followed: tradeToEdit.rules_followed ?? false,
        screenshots: tradeToEdit.screenshots || []
      });
    } else {
      setFormData({
        trade_date: new Date().toISOString().split('T')[0],
        entry_time: '',
        exit_time: '',
        instrument: '',
        direction: 'LONG',
        session: 'New York',
        risk_amount: '',
        pnl_amount: '',
        notes: '',
        setup: '',
        timeframe: '1m',
        duration: '',
        tags: '',
        rules_followed: false,
        screenshots: []
      });
    }
  }, [tradeToEdit, isOpen]);

  React.useEffect(() => {
    if (formData.entry_time && formData.exit_time) {
      const [entryH, entryM] = formData.entry_time.split(':').map(Number);
      const [exitH, exitM] = formData.exit_time.split(':').map(Number);
      
      if (!isNaN(entryH) && !isNaN(entryM) && !isNaN(exitH) && !isNaN(exitM)) {
        let diffMinutes = (exitH * 60 + exitM) - (entryH * 60 + entryM);
        if (diffMinutes < 0) diffMinutes += 24 * 60;
        setFormData(prev => ({ ...prev, duration: diffMinutes }));
      }
    }
  }, [formData.entry_time, formData.exit_time]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setFormData(prev => ({
            ...prev,
            screenshots: [...(prev.screenshots || []), base64String]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeScreenshot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      screenshots: (prev.screenshots || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const risk = parseFloat(formData.risk_amount as string) || 0;
      const pnl = Math.round((parseFloat(formData.pnl_amount as string) || 0) * 100) / 100;
      const rMultiple = risk !== 0 ? (pnl / risk).toFixed(2) : "0.00";

      // Calculate duration one last time to be sure
      let finalDuration = 0;
      if (formData.entry_time && formData.exit_time) {
        const [entryH, entryM] = formData.entry_time.split(':').map(Number);
        const [exitH, exitM] = formData.exit_time.split(':').map(Number);
        if (!isNaN(entryH) && !isNaN(entryM) && !isNaN(exitH) && !isNaN(exitM)) {
          finalDuration = (exitH * 60 + exitM) - (entryH * 60 + entryM);
          if (finalDuration < 0) finalDuration += 24 * 60;
        }
      }

      const { id, ...payload } = formData;
      const dataToSave = {
        ...payload,
        risk_amount: risk,
        pnl_amount: pnl,
        r_multiple: parseFloat(rMultiple),
        duration: finalDuration,
      };

      if (tradeToEdit?.id) {
        const { error } = await supabase
          .from('trades')
          .update(dataToSave)
          .eq('id', tradeToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('trades')
          .insert([dataToSave]);
        if (error) throw error;
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving trade:', error);
      const errorMessage = error.message || 'Unknown error';
      alert(`Failed to save trade: ${errorMessage}\n\nIf you see an RLS policy error, please check your Supabase policies.`);
    } finally {
      setLoading(false);
    }
  };

  const riskVal = parseFloat(formData.risk_amount as string) || 0;
  const pnlVal = parseFloat(formData.pnl_amount as string) || 0;
  const rMultiple = riskVal !== 0 ? (pnlVal / riskVal).toFixed(2) : "0.00";

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
                  {tradeToEdit ? "Edit Trade Log" : "Manual Trade Log"}
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

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormGroup label="Trade Date" isDark={isDark}>
                  <input 
                    name="trade_date"
                    value={formData.trade_date}
                    onChange={handleChange}
                    className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")} 
                    type="date" 
                    required
                  />
                </FormGroup>
                <FormGroup label="Entry Time" isDark={isDark}>
                  <input 
                    name="entry_time"
                    value={formData.entry_time}
                    onChange={handleChange}
                    className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")} 
                    type="time" 
                  />
                </FormGroup>
                <FormGroup label="Exit Time" isDark={isDark}>
                  <input 
                    name="exit_time"
                    value={formData.exit_time}
                    onChange={handleChange}
                    className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")} 
                    type="time" 
                  />
                </FormGroup>
                <FormGroup label="Instrument" isDark={isDark}>
                  <select 
                    name="instrument"
                    value={formData.instrument}
                    onChange={handleChange}
                    className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none appearance-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")} 
                    required
                  >
                    <option value="" disabled className={isDark ? "bg-black" : "bg-white"}>Select Instrument</option>
                    {instruments.map(inst => (
                      <option key={inst.id} value={inst.name} className={isDark ? "bg-black" : "bg-white"}>{inst.name}</option>
                    ))}
                  </select>
                </FormGroup>
                <FormGroup label="Direction" isDark={isDark}>
                  <select 
                    name="direction"
                    value={formData.direction}
                    onChange={handleChange}
                    className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none appearance-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")}
                  >
                    <option value="LONG" className={isDark ? "bg-black" : "bg-white"}>LONG</option>
                    <option value="SHORT" className={isDark ? "bg-black" : "bg-white"}>SHORT</option>
                  </select>
                </FormGroup>
                <FormGroup label="Session" isDark={isDark}>
                  <select 
                    name="session"
                    value={formData.session}
                    onChange={handleChange}
                    className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none appearance-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")}
                  >
                    <option value="New York" className={isDark ? "bg-black" : "bg-white"}>New York</option>
                    <option value="London" className={isDark ? "bg-black" : "bg-white"}>London</option>
                    <option value="Asia" className={isDark ? "bg-black" : "bg-white"}>Asia</option>
                  </select>
                </FormGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormGroup label="Setup" isDark={isDark}>
                  <select 
                    name="setup"
                    value={formData.setup}
                    onChange={handleChange}
                    className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none appearance-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")} 
                    required
                  >
                    <option value="" disabled className={isDark ? "bg-black" : "bg-white"}>Select Setup</option>
                    {setups.map((setup, idx) => (
                      <option key={idx} value={setup} className={isDark ? "bg-black" : "bg-white"}>{setup}</option>
                    ))}
                  </select>
                </FormGroup>
                <FormGroup label="Timeframe" isDark={isDark}>
                  <select 
                    name="timeframe"
                    value={formData.timeframe}
                    onChange={handleChange}
                    className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none appearance-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")}
                  >
                    <option value="30s" className={isDark ? "bg-black" : "bg-white"}>30 Seconds</option>
                    <option value="1m" className={isDark ? "bg-black" : "bg-white"}>1 Minute</option>
                    <option value="2m" className={isDark ? "bg-black" : "bg-white"}>2 Minutes</option>
                    <option value="3m" className={isDark ? "bg-black" : "bg-white"}>3 Minutes</option>
                    <option value="4m" className={isDark ? "bg-black" : "bg-white"}>4 Minutes</option>
                    <option value="5m" className={isDark ? "bg-black" : "bg-white"}>5 Minutes</option>
                  </select>
                </FormGroup>
                <FormGroup label="Tags" isDark={isDark}>
                  <div className="space-y-2">
                    <select 
                      onChange={(e) => {
                        const newTag = e.target.value;
                        if (newTag) {
                          const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t !== "") : [];
                          if (!currentTags.includes(newTag)) {
                            const updatedTags = [...currentTags, newTag].join(', ');
                            setFormData(prev => ({ ...prev, tags: updatedTags }));
                          }
                          e.target.value = "";
                        }
                      }}
                      className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none appearance-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")} 
                    >
                      <option value="" className={isDark ? "bg-black" : "bg-white"}>Add Tag...</option>
                      {tagGroups.map(group => (
                        <optgroup key={group.id} label={group.title} className={isDark ? "bg-black" : "bg-white"}>
                          {group.tags.map(tag => (
                            <option key={tag.id} value={tag.label} className={isDark ? "bg-black" : "bg-white"}>{tag.label}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <input 
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")} 
                      placeholder="Tags (comma separated)" 
                      type="text" 
                    />
                  </div>
                </FormGroup>
                <div className="flex items-center gap-3 pt-6">
                  <input 
                    type="checkbox"
                    id="rules_followed"
                    name="rules_followed"
                    checked={formData.rules_followed}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-accent-green text-accent-green focus:ring-accent-green accent-accent-green"
                  />
                  <label htmlFor="rules_followed" className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-white/60" : "text-neutral-600")}>
                    Rules Followed
                  </label>
                </div>
              </div>

              <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl border", isDark ? "bg-accent-green/5 border-accent-green/10" : "bg-neutral-50 border-neutral-200")}>
                <FormGroup label="Risk ($)" isDark={isDark} accent>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-green/40">$</span>
                    <input 
                      name="risk_amount"
                      value={formData.risk_amount}
                      onChange={handleChange}
                      className={cn("w-full rounded-2xl pl-8 pr-4 py-3 text-sm focus:ring-1 transition-all outline-none", isDark ? "bg-black/40 border border-accent-green/20 text-white focus:ring-accent-green" : "bg-white border border-neutral-200 text-black focus:ring-black")} 
                      placeholder="0.00" 
                      type="number" 
                      step="0.01"
                    />
                  </div>
                </FormGroup>
                <FormGroup label="P&L ($)" isDark={isDark} accent>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-green/40">$</span>
                    <input 
                      name="pnl_amount"
                      value={formData.pnl_amount}
                      onChange={handleChange}
                      className={cn("w-full rounded-2xl pl-8 pr-4 py-3 text-sm focus:ring-1 transition-all outline-none", isDark ? "bg-black/40 border border-accent-green/20 text-white focus:ring-accent-green" : "bg-white border border-neutral-200 text-black focus:ring-black")} 
                      placeholder="0.00" 
                      type="number" 
                      step="0.01"
                    />
                  </div>
                </FormGroup>
                <FormGroup label="R Multiple" isDark={isDark} accent>
                  <div className={cn("flex items-center h-12 px-4 border border-dashed rounded-2xl", isDark ? "bg-accent-green/10 border-accent-green/30" : "bg-white border-neutral-300")}>
                    <span className={cn("text-sm font-sans font-black", isDark ? "text-accent-green" : "text-black")}>{rMultiple} R</span>
                    <Calculator size={16} className="ml-auto text-accent-green/40" />
                  </div>
                </FormGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup label="Trade Notes" isDark={isDark}>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className={cn("w-full rounded-2xl px-4 py-3 text-sm focus:ring-1 transition-all outline-none resize-none", isDark ? "bg-white/5 border border-white/10 text-white focus:ring-accent-green" : "bg-neutral-50 border border-neutral-200 text-black focus:ring-black")} 
                    placeholder="Analyze the psychological state and execution quality..." 
                    rows={4}
                  ></textarea>
                </FormGroup>
                <FormGroup label="Screenshots" isDark={isDark}>
                  <div className="space-y-4">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn("h-[124px] border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all", isDark ? "border-white/10 bg-white/5 hover:border-accent-green/40" : "border-neutral-200 bg-neutral-50 hover:border-black")}
                    >
                      <ImageIcon size={24} className={isDark ? "text-white/20" : "text-neutral-300"} />
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", isDark ? "text-white/40 group-hover:text-accent-green" : "text-neutral-400 group-hover:text-black")}>
                        Click to add screenshots
                      </span>
                    </div>
                    
                    {formData.screenshots && formData.screenshots.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {formData.screenshots.map((src, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setPreviewImage(src)}
                            className="relative group aspect-video rounded-xl overflow-hidden border border-white/10 cursor-zoom-in"
                          >
                            <img src={src} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeScreenshot(idx);
                              }}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormGroup>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "flex-1 font-sans font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2",
                    isDark ? "bg-accent-green text-black shadow-[0_0_30px_rgba(0,255,65,0.3)] hover:shadow-[0_0_50px_rgba(0,255,65,0.5)]" : "bg-black text-white",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (tradeToEdit ? "Update Trade" : "Commit Trade to Ledger")}
                </button>
                <button 
                  type="button"
                  onClick={onClose}
                  className={cn("px-8 font-bold py-4 rounded-2xl transition-all uppercase tracking-widest text-xs", isDark ? "bg-white/5 border border-white/10 text-white hover:bg-white/10" : "bg-neutral-100 border border-neutral-200 text-black hover:bg-neutral-200")}
                >
                  Discard
                </button>
              </div>
            </form>
          </motion.div>

          {/* Image Lightbox */}
          <AnimatePresence>
            {previewImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 bg-black/90 backdrop-blur-xl"
                onClick={() => setPreviewImage(null)}
              >
                <button 
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <X size={24} />
                </button>
                <motion.img
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  src={previewImage}
                  alt="Enlarged screenshot"
                  className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};
