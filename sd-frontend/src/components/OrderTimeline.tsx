interface Props {
  status: string;
}

const steps = [
  { key: 'ABIERTA', label: 'CREADO', icon: '📝' },
  { key: 'ASIGNADA', label: 'ACEPTADO', icon: '👤' },
  { key: 'EN_CAMINO', label: 'EN CAMINO', icon: '🚴' },
  { key: 'COMPLETADA', label: 'ENTREGADO', icon: '🏁' },
];

export default function OrderTimeline({ status }: Props) {
  const currentIdx = steps.findIndex(s => s.key === status);
  
  return (
    <div className="w-full py-8">
      <div className="relative flex justify-between">
        {/* Background Line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-white/10 z-0" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-5 left-0 h-[2px] bg-brand transition-all duration-700 z-0 shadow-[0_0_10px_#0066FF]" 
          style={{ width: `${Math.max(0, (currentIdx / (steps.length - 1)) * 100)}%` }}
        />

        {steps.map((step, idx) => {
          const isActive = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-500
                ${isActive ? 'bg-brand text-white border-brand shadow-[0_0_15px_rgba(0,102,255,0.4)]' : 'bg-dark-800 text-gray-600 border-white/10'}
                border-2 ${isCurrent ? 'animate-pulse scale-110 shadow-brand' : ''}
              `}>
                {step.icon}
              </div>
              <div className="mt-3 text-center">
                <p className={`text-[10px] font-black tracking-widest uppercase transition-colors ${isActive ? 'text-white' : 'text-gray-600'}`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <span className="text-[8px] text-brand-light font-bold animate-pulse-subtle">ACTUAL</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
