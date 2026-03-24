import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, ShieldCheck, Zap, Package } from 'lucide-react';

const statuses = [
  { icon: <Navigation className="w-4 h-4" />, text: "LOCALIZANDO DESTINO...", color: "text-neutral-500" },
  { icon: <Zap className="w-4 h-4 text-white" />, text: "OPTIMIZANDO RUTA PRO", color: "text-white" },
  { icon: <ShieldCheck className="w-4 h-4 text-white" />, text: "ENTREGA EN CURSO", color: "text-white" },
  { icon: <Package className="w-4 h-4 text-white" />, text: "OBJETIVO COMPLETADO", color: "text-white" },
];

export default function RouteVisualizer() {
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % statuses.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[280px] sm:h-[400px] md:h-[600px] glass-premium rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden border border-white/5 bg-black group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0 z-0">
        <img 
          src="/santiago-map.png" 
          alt="Santiago Map" 
          className="w-full h-full object-cover opacity-60 grayscale brightness-125 contrast-125 scale-100 sm:scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-linear"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>



      {/* HUD Elements */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20 space-y-2 sm:space-y-4">
        <div className="px-4 py-2 bg-black/60 border border-white/10 rounded-full backdrop-blur-md flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-black tracking-widest uppercase text-white">LIVE_TRAJECTORY_SYNC</span>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={statusIdx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-3 bg-black/40 p-3 sm:p-4 rounded-2xl border border-white/5 backdrop-blur-sm"
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white shadow-lg flex-shrink-0">
              {statuses[statusIdx].icon}
            </div>
            <div>
              <p className={`text-[9px] sm:text-xs font-black tracking-[0.15em] sm:tracking-[0.2em] uppercase ${statuses[statusIdx].color}`}>
                {statuses[statusIdx].text}
              </p>
              <p className="text-neutral-500 text-[8px] sm:text-[10px] font-mono mt-1">08:42:12 - ALPHA-9</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-20 text-right bg-black/40 p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5 backdrop-blur-md">
        <p className="text-3xl sm:text-[50px] font-black text-white leading-none tracking-tighter italic">99.9%</p>
        <p className="text-neutral-400 text-[8px] sm:text-[10px] font-bold tracking-widest uppercase mt-1 sm:mt-2">EFICIENCIA</p>
      </div>

      {/* Simulated Route over the map */}
      <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 800 600" fill="none">
        {/* Animated Neon Route */}
        <motion.path
          d="M150 500 C 150 400, 200 350, 300 350 S 450 300, 450 200 S 550 150, 650 100"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.8))' }}
        />

        {/* Start / End Points */}
        <motion.circle 
          cx="150" cy="500" r="8" fill="white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />
        
        <motion.g animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <circle cx="650" cy="100" r="15" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="650" cy="100" r="6" fill="white" />
        </motion.g>
      </svg>

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 pointer-events-none" />
    </div>
  );
}


