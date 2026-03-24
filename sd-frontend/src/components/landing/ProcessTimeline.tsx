import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, PackageSearch, Rocket, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    title: "Enlistate",
    desc: "Crea tu cuenta de alto rendimiento en segundos.",
    icon: <UserPlus className="w-6 h-6" />,
  },
  {
    title: "Pide el Loot",
    desc: "Elige tus productos y lanza el pedido al tablón.",
    icon: <PackageSearch className="w-6 h-6" />,
  },
  {
    title: "Speedrun en Proceso",
    desc: "Nuestros repartidores pro inician el trayecto a toda marcha.",
    icon: <Rocket className="w-6 h-6" />,
  },
  {
    title: "Objetivo Completado",
    desc: "Recibe tu pedido en tiempo récord y sube de rango.",
    icon: <CheckCircle2 className="w-6 h-6" />,
  },
];

const ProcessTimeline: React.FC<{ lightMode?: boolean }> = ({ lightMode = false }) => {
  return (
    <div className="relative py-12">
      {/* Central Line */}
      <div className={`absolute left-1/2 transform -translate-x-1/2 h-full w-px ${lightMode ? 'bg-neutral-200' : 'bg-white/10'} hidden md:block`} />
      
      <div className="space-y-12 sm:space-y-24">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className={`flex flex-col md:flex-row items-center gap-5 sm:gap-8 ${
              i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}
          >
            {/* Content */}
            <div className={`flex-1 text-center ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
              <h3 className={`text-xl sm:text-2xl font-black ${lightMode ? 'text-black' : 'text-white'} mb-3 tracking-tight uppercase`}>{step.title}</h3>
              <p className={`${lightMode ? 'text-neutral-700 font-medium' : 'text-neutral-400'} max-w-sm mx-auto md:mx-0 inline-block`}>
                {step.desc}
              </p>
            </div>

            {/* Icon Circle */}
            <div className={`relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full ${lightMode ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-neutral-950 border-white/20 text-white'} border flex items-center justify-center shadow-xl backdrop-blur-md group transition-colors flex-shrink-0`}>
              <div className="absolute inset-0 rounded-full bg-white/5 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              {step.icon}
            </div>

            {/* Empty space for balance */}
            <div className="flex-1" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};


export default ProcessTimeline;
