export default function Footer() {
  return (
    <footer className="bg-black py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-3 items-center md:items-start">
          <div className="font-black text-white text-xl font-sans uppercase tracking-tighter">
            SOVEREIGN.OS
          </div>
          <p className="font-body text-[10px] uppercase tracking-[0.4em] text-white/30 text-center md:text-left">
            PRIVATE ACCESS ONLY • ENCRYPTED END-TO-END • 2024
          </p>
        </div>
        
        <div className="flex gap-12">
          <a href="#" className="text-[10px] uppercase tracking-[0.3em] text-white/30 hover:text-accent-red transition-colors">
            Security Logs
          </a>
          <a href="#" className="text-[10px] uppercase tracking-[0.3em] text-white/30 hover:text-accent-red transition-colors">
            Terminal Settings
          </a>
        </div>
      </div>
    </footer>
  );
}
