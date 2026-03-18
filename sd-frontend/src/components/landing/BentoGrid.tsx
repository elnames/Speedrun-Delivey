import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Users, Trophy, Monitor, Headset } from 'lucide-react';

const features = [
  {
    title: "Velocidad Extrema",
    desc: "Nuestros repartidores pro-gamers optimizan rutas como un speedrun de nivel mundial. Entregas en minutos, no horas.",
    icon: <Zap className="w-8 h-8" />,
    className: "md:col-span-2 md:row-span-2",
    metric: "Latencia mínima: <15min"
  },
  {
    title: "Seguridad Premium",
    desc: "Cada paquete está encriptado con tracking en tiempo real. Cero lag en la información.",
    icon: <Shield className="w-6 h-6" />,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Comunidad Elite",
    desc: "Sistema de reseñas cruzadas para mantener el fair play en cada entrega.",
    icon: <Users className="w-6 h-6" />,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Ranking Global",
    desc: "Compite con los mejores repartidores y sube en el leaderboard semanal.",
    icon: <Trophy className="w-6 h-6" />,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Analítica Pro",
    desc: "Visualiza tus estadísticas de entrega y optimiza tu rendimiento con datos reales.",
    icon: <Monitor className="w-6 h-6" />,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Soporte 24/7",
    desc: "Atención personalizada para resolver cualquier inconveniente en tiempo récord.",
    icon: <Headset className="w-6 h-6" />,
    className: "md:col-span-1 md:row-span-1",
  }
];



export default function BentoGrid({ lightMode = false }: { lightMode?: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
      {features.map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className={`${lightMode ? 'glass-light' : 'glass-premium'} p-8 flex flex-col justify-between group overflow-hidden relative ${f.className}`}
        >
          <div className={`absolute top-0 right-0 w-32 h-32 ${lightMode ? 'bg-neutral-900/5' : 'bg-white/5'} rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-all duration-500`} />
          
          <div className="relative z-10">
            <div className={`mb-6 ${lightMode ? 'opacity-100 font-bold' : 'opacity-80 group-hover:opacity-100'} transition-opacity`}>
               {React.isValidElement(f.icon) ? React.cloneElement(f.icon as React.ReactElement<any>, { 
                 className: `${(f.icon as React.ReactElement<any>).props.className || ''} ${lightMode ? 'text-neutral-900 border-neutral-900' : 'text-white'}` 
               }) : f.icon}
            </div>
            <h3 className={`text-2xl font-bold ${lightMode ? 'text-black' : 'text-white'} mb-3 tracking-tight`}>{f.title}</h3>
            <p className={`${lightMode ? 'text-neutral-700 font-medium' : 'text-neutral-400 font-light'} text-sm leading-relaxed`}>{f.desc}</p>
          </div>

          
          {f.metric && (
             <div className={`relative z-10 mt-auto ${lightMode ? 'bg-neutral-100 border-neutral-200' : 'bg-white/5 border-white/10'} py-2 px-6 rounded-full border w-fit backdrop-blur-sm`}>
                <span className={`${lightMode ? 'text-neutral-900' : 'text-white'} text-xs font-mono font-medium`}>{f.metric}</span>
             </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}


