import { motion } from "motion/react";
import { Bot, Cpu, Activity } from "lucide-react";

export default function Features() {
  return (
    <section className="bg-black py-32 px-8 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="md:col-span-8 glass-panel rounded-xl p-12 flex flex-col justify-between min-h-[450px]"
        >
          <div>
            <span className="text-accent-red font-sans font-black uppercase tracking-[0.3em] text-[10px]">
              Real-time Intelligence
            </span>
            <h2 className="text-4xl font-sans font-bold text-white mt-6 mb-8">
              Sovereign Analyst Core
            </h2>
            <p className="text-white/70 max-w-xl leading-relaxed italic font-display text-3xl">
              "Markets are the only place where the observer directly influences the observed through pure intent."
            </p>
          </div>
          
          <div className="mt-12 flex items-end justify-between">
            <div className="flex gap-2">
              <div className="h-1 bg-accent-red w-24 rounded-full shadow-[0_0_10px_#ff0000]" />
              <div className="h-1 bg-white/10 w-12 rounded-full" />
              <div className="h-1 bg-white/10 w-12 rounded-full" />
            </div>
            <div className="text-[10px] text-white/30 font-sans font-black uppercase tracking-[0.3em]">
              Neural Link: Active
            </div>
          </div>
        </motion.div>

        {/* Node Network Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="md:col-span-4 glass-panel rounded-xl p-12 flex flex-col items-center justify-center text-center"
        >
          <div className="relative mb-8">
            <Activity className="w-16 h-16 text-accent-red animate-pulse" />
            <div className="absolute inset-0 bg-accent-red/20 blur-2xl rounded-full" />
          </div>
          <h3 className="text-2xl font-sans font-bold text-white">Node Network</h3>
          <p className="text-white/40 mt-4 text-[10px] uppercase tracking-[0.3em] font-black">
            All Systems Nominal
          </p>
        </motion.div>

        {/* Risk Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:col-span-4 glass-panel rounded-xl p-10"
        >
          <h4 className="text-[10px] font-sans font-black text-white/40 uppercase tracking-[0.3em] mb-10">
            Current Risk Profile
          </h4>
          <div className="space-y-6">
            <div className="flex justify-between items-center py-4 border-b border-white/5">
              <span className="text-white/50 text-sm">Drawdown Limit</span>
              <span className="text-accent-red font-sans font-black text-lg">2.5%</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-white/5">
              <span className="text-white/50 text-sm">Exposure Ratio</span>
              <span className="text-white font-sans font-black text-lg">1:3</span>
            </div>
          </div>
        </motion.div>

        {/* Memory Indexing Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:col-span-8 glass-panel rounded-xl p-12 flex items-center justify-between"
        >
          <div className="max-w-md">
            <h3 className="text-2xl font-sans font-bold text-white mb-6">Memory Indexing</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Last session data archived. Sentiment analysis reveals high conviction levels on current positions. Neural weights updated and synchronized across all edge nodes.
            </p>
          </div>
          <div className="hidden lg:flex w-32 h-32 border border-white/10 rounded-full items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border border-accent-red/20 animate-ping" />
            <Cpu className="text-accent-red w-10 h-10" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
