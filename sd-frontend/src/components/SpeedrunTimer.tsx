import { useEffect, useState } from 'react';

interface Props {
  startTime: string | null; // ISO string from server
  active: boolean;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export default function SpeedrunTimer({ startTime, active }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active || !startTime) {
      setElapsed(0);
      return;
    }
    const start = new Date(startTime).getTime();

    const tick = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    };

    tick(); // immediate first tick
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [active, startTime]);

  if (!active) return null;

  return (
    <div className="flex flex-col items-center py-6 px-8 glass-premium border-brand/30 shadow-brand/10 group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-50" />
      <span className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-2 font-sans">Temporizador Activo</span>
      <span className="text-5xl font-mono font-bold text-white tracking-tighter drop-shadow-sm">
        {formatTime(elapsed)}
      </span>
      <span className="text-[10px] text-brand-light font-bold uppercase tracking-widest mt-3 animate-pulse-subtle flex items-center gap-2">
         <span className="w-1.5 h-1.5 rounded-full bg-brand-light" />
         En tránsito
      </span>
    </div>
  );
}
