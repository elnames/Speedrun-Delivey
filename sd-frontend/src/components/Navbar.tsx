import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleRoutes: Record<string, string> = {
  CLIENTE: '/dashboard',
  REPARTIDOR: '/courier',
  ADMIN: '/admin',
};

const roleLabels: Record<string, string> = {
  CLIENTE: '🛍 CLIENTE',
  REPARTIDOR: '🚴 REPARTIDOR',
  ADMIN: '⚙ ADMIN',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-header px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
      <Link
        to={user ? roleRoutes[user.role] : '/login'}
        className="flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-80"
      >
        <img src="/speed run circular.png" alt="Logo" className="w-8 h-8 rounded-full border border-white/10" />
        <span className="text-white font-bold text-base sm:text-lg tracking-tight">Speedrun</span>
      </Link>

      {user && (
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-sm font-medium hidden sm:inline">
            <span className="text-muted">Hola, </span>
            <span className="text-white">{user.nombre}</span>
          </span>
          <span className="badge bg-neutral-800 text-brand-light border-brand/30 hidden sm:inline-flex">
            {roleLabels[user.role]}
          </span>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="text-xs btn-outline py-2 px-4 min-h-[40px]"
          >
            Salir
          </button>
        </div>
      )}
    </nav>
  );
}
