import { motion } from "motion/react";

export default function Hero({ onAccess }: { onAccess: () => void }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 overflow-hidden px-6">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="scanline" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-5xl mx-auto"
      >
        <div className="mb-8 flex items-center justify-center gap-4 opacity-50">
          <span className="text-[10px] font-sans font-black tracking-[0.4em] uppercase text-accent-red">
            Security Level: Alpha
          </span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span className="text-[10px] font-sans font-black tracking-[0.4em] uppercase">
            User: M1000
          </span>
        </div>

        <h1 className="flex flex-col gap-2">
          <span className="text-5xl md:text-8xl font-sans font-medium tracking-tight text-white">
            Good evening, M1000.
          </span>
          <span className="text-5xl md:text-8xl font-display italic text-accent-red text-glow-red">
            Ready to analyze?
          </span>
        </h1>

        <p className="mt-10 text-lg md:text-xl text-white/60 font-body max-w-2xl mx-auto leading-relaxed">
          System check complete. Markets are active and your portfolio data is synchronized. Shall we begin the session?
        </p>

        <motion.div 
          className="mt-14"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <button 
            onClick={onAccess}
            className="bg-accent-red text-white px-12 py-5 rounded-full font-sans font-black text-sm uppercase tracking-wider transition-all duration-300 btn-glow-red"
          >
            Access Dashboard
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
