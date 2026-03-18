import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { SmokeBackground } from '../components/ui/spooky-smoke-animation';
import BentoGrid from '../components/landing/BentoGrid';
import ProcessTimeline from '../components/landing/ProcessTimeline';
import Testimonials from '../components/landing/Testimonials';
import RouteVisualizer from '../components/landing/RouteVisualizer';
import { ArrowRight, Rocket } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  if (user) {
    if (user.role === 'REPARTIDOR') return <Navigate to="/courier" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden text-white font-sans selection:bg-white/10 selection:text-white">
      <div className="fixed inset-0 z-0 bg-black">
        <SmokeBackground smokeColor="#404040" />
      </div>

      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Rocket className="text-black w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">SPEEDRUN</span>
        </div>
        
        <div className="flex gap-8 items-center">
          <Link to="/login" className="text-neutral-400 hover:text-white text-sm font-semibold transition-colors">Login</Link>
          <Link to="/register" className="bg-white hover:bg-neutral-200 text-black text-sm font-bold px-8 py-3 rounded-full transition-all shadow-lg">Empezar</Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-20">
        {/* Hero Section */}
        <section className="text-center space-y-12 mb-48">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 py-2 px-5 rounded-full border border-white/10 bg-white/5 text-white text-[11px] font-medium tracking-[0.2em] uppercase"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Infraestructura de Clase Mundial
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] uppercase"
          >
            Entregas <br />
            <span className="text-neutral-500">Evolucionadas.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-neutral-400 text-lg md:text-2xl max-w-2xl mx-auto font-medium leading-tight"
          >
            Logística de alto rendimiento para quienes valoran el tiempo. 
            Sin fricciones, sin retrasos. Solo excelencia.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row gap-6 justify-center items-center pt-8"
          >
            <Link to="/register" className="bg-white hover:bg-neutral-200 text-black px-12 py-5 rounded-full text-lg group flex items-center gap-3 transition-all font-bold">
              Iniciar Speedrun
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </section>

        {/* Features Bento */}
        <section className="mb-48">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">Capacidades Pro</h2>
            <p className="text-neutral-400 font-medium max-w-lg mx-auto leading-tight">Diseñado para la eficiencia máxima en cada entrega.</p>
          </div>
          <BentoGrid lightMode={false} />
        </section>

        {/* Process Timeline */}
        <section className="mb-48">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">El Flow</h2>
            <p className="text-neutral-400 font-medium max-w-lg mx-auto leading-tight">De la orden a tu puerta en tiempo récord.</p>
          </div>
          <ProcessTimeline lightMode={false} />
        </section>

        {/* Testimonials */}
        <section className="mb-48">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">Voz de la Elite</h2>
            <p className="text-neutral-400 font-medium max-w-lg mx-auto leading-tight">Nuestra comunidad de repartidores y clientes habla por nosotros.</p>
          </div>
          <Testimonials lightMode={false} />
        </section>

        {/* Route Visualizer */}
        <section className="mb-48">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">Rutas Optimizadas</h2>
            <p className="text-neutral-400 font-medium max-w-lg mx-auto leading-tight">Cada segundo cuenta. Nuestra IA traza el camino más rápido.</p>
          </div>
          <RouteVisualizer />
        </section>



        {/* Final CTA */}
        <section className="mb-48 py-24 bg-white/5 border border-white/10 rounded-[3rem] text-center overflow-hidden relative">
          <div className="relative z-10 space-y-8">
            <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter uppercase">¿LISTO PARA EL NIVEL SIGUIENTE?</h2>
            <p className="text-neutral-400 max-w-xl mx-auto font-light leading-relaxed">Únete a la plataforma de logística más avanzada y rompe tus propios récords.</p>
            <Link to="/register" className="bg-white hover:bg-neutral-200 text-black px-16 py-5 mx-auto rounded-full inline-block font-bold">Comenzar Ahora</Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-40 border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center text-neutral-500 text-[10px] gap-8 tracking-widest uppercase font-medium">
          <p>© {new Date().getFullYear()} SPEEDRUN DELIVERY</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span>Status: Network Optimized</span>
          </div>
        </footer>
      </main>
    </div>
  );
}



