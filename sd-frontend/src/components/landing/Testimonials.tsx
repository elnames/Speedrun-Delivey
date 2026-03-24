import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Alex 'ProSkier' Rivera",
    role: "Cliente Top Tier",
    content: "Speedrun Delivery no es solo un servicio, es una ventaja competitiva. Mis pedidos llegan antes de que termine mi siguiente partida.",
    rating: 5,
  },
  {
    name: "Sofia Master",
    role: "Repartidora Elite",
    content: "La plataforma me permite optimizar cada segundo. El sistema de ranking y las ofertas son lo más justo que he usado.",
    rating: 5,
  },
  {
    name: "Marco 'Flash' Soto",
    role: "Cliente Frecuente",
    content: "Soberbio. La interfaz es limpia y el seguimiento en tiempo real es impecable. Sin lag, sin problemas.",
    rating: 5,
  },
];

const Testimonials: React.FC<{ lightMode?: boolean }> = ({ lightMode = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
      {testimonials.map((t, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className={`${lightMode ? 'glass-light' : 'glass-premium'} p-5 sm:p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300`}
        >
          <div>
            <div className="flex gap-1 mb-6">
              {[...Array(t.rating)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${lightMode ? 'fill-neutral-900 text-neutral-900' : 'fill-white text-white'} opacity-80`} />
              ))}
            </div>
            <p className={`${lightMode ? 'text-neutral-600' : 'text-neutral-300'} italic mb-8 font-light leading-relaxed`}>"{t.content}"</p>
          </div>
          <div>
            <h4 className={`${lightMode ? 'text-neutral-900' : 'text-white'} font-semibold tracking-tight`}>{t.name}</h4>
            <span className="text-neutral-500 text-sm uppercase tracking-widest">{t.role}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};


export default Testimonials;
