import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SmokeBackground } from '../components/ui/spooky-smoke-animation';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', nombre: '', role: 'CLIENTE' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden font-sans text-white py-12">
      <div className="fixed inset-0 z-0">
        <SmokeBackground smokeColor="#ffffff" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8 animate-fade-in flex flex-col items-center">
          <img src="/speed run con fuego.png" alt="Speedrun Delivery" className="w-24 h-24 object-contain mb-4 drop-shadow-[0_0_25px_rgba(255,255,255,0.1)]" />
          <h1 className="text-3xl font-bold text-white tracking-tight uppercase">
            Crea tu cuenta
          </h1>
          <p className="text-neutral-400 text-sm mt-2 font-medium tracking-widest">Únete a nuestra élite de entregas</p>
        </div>

        <div className="glass-premium p-8 animate-slide-up relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Nombre Completo</label>
              <input
                id="reg-nombre"
                className="input-clean border-white/10 bg-white/5 text-white placeholder:text-neutral-600 focus:border-white/30"
                placeholder="Javier Jorquera"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Correo Electrónico</label>
              <input
                id="reg-email"
                className="input-clean border-white/10 bg-white/5 text-white placeholder:text-neutral-600 focus:border-white/30"
                type="email"
                placeholder="usuario@speedrun.cl"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Contraseña</label>
              <input
                id="reg-password"
                className="input-clean border-white/10 bg-white/5 text-white placeholder:text-neutral-600 focus:border-white/30"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>


            {error && (
              <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 font-medium">
                {error}
              </p>
            )}

            <button
              id="reg-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-3.5 text-base mt-4 disabled:opacity-50 transition-all rounded-full"
            >
              {loading ? 'CREANDO CUENTA...' : 'REGISTRARME'}
            </button>
          </form>

          <p className="text-center text-neutral-400 text-sm mt-8">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-white hover:underline font-bold transition-all">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


