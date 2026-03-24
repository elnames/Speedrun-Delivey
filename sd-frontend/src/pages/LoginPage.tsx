import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SmokeBackground } from '../components/ui/spooky-smoke-animation';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || 'Credenciales inválidas'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden font-sans text-white">
      <div className="fixed inset-0 z-0">
        <SmokeBackground smokeColor="#ffffff" />
      </div>
      
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in flex flex-col items-center">
          <img src="/speed run con fuego.png" alt="Speedrun Delivery" className="w-20 h-20 sm:w-28 sm:h-28 object-contain mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.12)]" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            BIENVENIDO A <br />
            <span className="text-neutral-500">SPEEDRUN</span>
          </h1>
          <p className="text-neutral-400 text-sm mt-2 font-medium uppercase tracking-widest">Plataforma Elite de Mensajería</p>
        </div>

        <div className="glass-premium p-5 sm:p-8 animate-slide-up relative">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Correo Electrónico</label>
              <input
                id="login-email"
                className="input-clean border-white/10 bg-white/5 text-white placeholder:text-neutral-600 focus:border-white/30"
                type="email"
                placeholder="usuario@speedrun.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Contraseña</label>
              <input
                id="login-password"
                className="input-clean border-white/10 bg-white/5 text-white placeholder:text-neutral-600 focus:border-white/30"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 font-medium">
                {error}
              </p>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-3.5 text-base mt-2 disabled:opacity-50 transition-all rounded-full"
            >
              {loading ? 'CONECTANDO...' : 'INICIAR SESIÓN'}
            </button>
          </form>

          <p className="text-center text-neutral-400 text-sm mt-8">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-white hover:underline font-bold transition-all">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


