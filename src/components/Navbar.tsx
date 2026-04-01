import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

export default function Navbar({ onLaunch }: { onLaunch: () => void }) {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse shadow-[0_0_8px_#ff0000]" />
          <span className="text-xl font-black uppercase tracking-tighter font-sans">
            SOVEREIGN.OS
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          <a href="#" className="text-xs font-bold uppercase tracking-widest border-b border-accent-red pb-1">
            Home
          </a>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLaunch}
          className="bg-accent-red text-white px-6 py-2 rounded-sm font-sans font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,0,0,0.3)]"
        >
          System Launch
        </motion.button>
      </div>
    </nav>
  );
}
