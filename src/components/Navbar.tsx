import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { LogOut, User } from "lucide-react";

export default function Navbar({ onLaunch, session }: { onLaunch: () => void, session?: Session | null }) {
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('_non_existent_table_').select('*').limit(1);
        // If we get an error that isn't a connection error, it means we're connected but the table doesn't exist
        if (error && error.code === 'PGRST301') {
          setIsSupabaseConnected(false);
        } else {
          setIsSupabaseConnected(true);
        }
      } catch (e) {
        setIsSupabaseConnected(false);
      }
    };
    checkConnection();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse shadow-[0_0_8px_#ff0000]" />
          <span className="text-xl font-black uppercase tracking-tighter font-sans">
            SOVEREIGN.OS
          </span>
          <div className="ml-4 flex items-center gap-2">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              isSupabaseConnected === true ? "bg-accent-green shadow-[0_0_8px_#34c759]" : 
              isSupabaseConnected === false ? "bg-accent-red shadow-[0_0_8px_#ff3b30]" : 
              "bg-gray-500"
            )} />
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">
              Supabase: {isSupabaseConnected === true ? "Online" : isSupabaseConnected === false ? "Offline" : "Checking..."}
            </span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          <a href="#" className="text-xs font-bold uppercase tracking-widest border-b border-accent-red pb-1">
            Home
          </a>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/5 border border-white/10">
                <User className="w-3 h-3 text-white/40" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  {session.user.email?.split('@')[0]}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="text-white/40 hover:text-accent-red transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLaunch}
                className="bg-accent-red text-white px-6 py-2 rounded-sm font-sans font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,0,0,0.3)]"
              >
                Enter Terminal
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLaunch}
              className="bg-accent-red text-white px-6 py-2 rounded-sm font-sans font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,0,0,0.3)]"
            >
              System Launch
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
}
