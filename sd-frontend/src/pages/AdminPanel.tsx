import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import Navbar from '../components/Navbar';

interface User { id: number; email: string; nombre: string; role: string; createdAt: string; }
interface Review { id: number; puntos: number; comentario: string; sujeto: { nombre: string }; order: { descripcion: string }; }
interface Metrics { total: number; completed: number; avgSeconds: number | null; topCouriers: any[]; }

function formatSeconds(s: number) {
  return [Math.floor(s/3600), Math.floor((s%3600)/60), s%60].map(v=>String(Math.round(v)).padStart(2,'0')).join(':');
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [tab, setTab] = useState<'metrics' | 'users' | 'reviews'>('metrics');
  
  // Modals / Editing state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [passResetUser, setPassResetUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '', nombre: '', role: 'CLIENTE' });

  const fetchAll = useCallback(async () => {
    try {
      const [u, r, m] = await Promise.all([
        api.get<User[]>('/users'),
        api.get<Review[]>('/reviews'),
        api.get<Metrics>('/orders/metrics'),
      ]);
      setUsers(u.data);
      setReviews(r.data);
      setMetrics(m.data);
    } catch(e) {}
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const deleteReview = async (id: number) => {
    if(!confirm('¿Eliminar reseña?')) return;
    await api.delete(`/reviews/${id}`);
    fetchAll();
  };

  const deleteUser = async (id: number) => {
    if(!confirm('¿Eliminar usuario permanentemente?')) return;
    await api.delete(`/users/${id}`);
    fetchAll();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setIsCreating(false);
      setFormData({ email: '', password: '', nombre: '', role: 'CLIENTE' });
      fetchAll();
      alert('Usuario creado exitosamente');
    } catch (err: any) {
      alert(`Error al crear usuario: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!editingUser) return;
    await api.patch(`/users/${editingUser.id}`, { nombre: editingUser.nombre, role: editingUser.role });
    setEditingUser(null);
    fetchAll();
  };

  const handlePassReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!passResetUser) return;
    const form = e.currentTarget;
    const newPass = (form.elements.namedItem('newpass') as HTMLInputElement).value;
    await api.patch(`/users/${passResetUser.id}/password`, { password: newPass });
    setPassResetUser(null);
    alert('Contraseña actualizada');
  };

  const roleColors: Record<string, string> = {
    CLIENTE: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    REPARTIDOR: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    ADMIN: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  };

  const completionRate = metrics ? (metrics.total > 0 ? (metrics.completed / metrics.total) * 100 : 0) : 0;

  return (
    <div className="min-h-screen bg-neutral-950 font-sans animate-fade-in pb-20">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-6 sm:space-y-10">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6 sm:pb-8">
          <div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2">Panel Ejecutivo</h2>
            <p className="text-muted text-sm">Control total de usuarios y rendimiento de red.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsCreating(true)} className="btn-primary text-xs px-6 py-2.5">
              + Nuevo Usuario
            </button>
            <button onClick={fetchAll} className="btn-outline text-xs px-4 py-2 hover:bg-white/10">
              ⚡ Refrescar
            </button>
          </div>
        </div>

        <nav className="flex gap-4 sm:gap-8 border-b border-white/10 overflow-x-auto">
          {(['metrics', 'users', 'reviews'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-4 text-sm font-semibold tracking-wide transition-all relative ${
                tab === t ? 'text-brand-light' : 'text-gray-500 hover:text-gray-300'
              }`}>
              {t === 'metrics' ? 'DATOS & MÉTRICAS' : t === 'users' ? 'USUARIOS' : 'RESEÑAS'}
              {tab === t && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-light animate-pulse-subtle" />}
            </button>
          ))}
        </nav>

        {tab === 'users' && (
          <div className="glass-premium overflow-hidden animate-slide-up">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/[0.02] border-b border-white/10 text-[10px] uppercase text-gray-500 font-bold tracking-[0.2em]">
                  <tr>
                    <th className="px-3 sm:px-8 py-3 sm:py-5">Perfil</th>
                    <th className="px-3 sm:px-8 py-3 sm:py-5 hidden sm:table-cell">Identificación</th>
                    <th className="px-3 sm:px-8 py-3 sm:py-5">Rol</th>
                    <th className="px-3 sm:px-8 py-3 sm:py-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-3 sm:px-8 py-3 sm:py-5">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-dark-700 to-dark-800 border border-white/10 flex items-center justify-center text-sm font-bold text-gray-400 shrink-0">
                            {u.nombre[0]}
                          </div>
                          <div>
                            <p className="text-white font-medium text-base mb-0.5">{u.nombre}</p>
                            <p className="text-muted text-xs font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-8 py-3 sm:py-5 text-gray-400 font-mono text-xs italic hidden sm:table-cell">#{u.id}</td>
                      <td className="px-3 sm:px-8 py-3 sm:py-5">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] font-bold border tracking-wider ${roleColors[u.role]}`}>{u.role}</span>
                      </td>
                      <td className="px-3 sm:px-8 py-3 sm:py-5 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button onClick={() => setEditingUser(u)} className="p-2.5 sm:p-2 text-gray-400 hover:text-brand-light transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                        <button onClick={() => setPassResetUser(u)} className="p-2.5 sm:p-2 text-gray-400 hover:text-orange-400 transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg></button>
                        <button onClick={() => deleteUser(u.id)} className="p-2.5 sm:p-2 text-gray-400 hover:text-red-400 transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'metrics' && metrics && (
          <div className="space-y-10 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-premium p-5 sm:p-8 group overflow-hidden relative border-brand/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl -mr-8 -mt-8" />
                <div className="text-2xl sm:text-4xl font-bold text-white mb-2 leading-none tracking-tighter">{metrics.total}</div>
                <div className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                   Total Operaciones
                </div>
              </div>
              <div className="glass-premium p-5 sm:p-8 group overflow-hidden relative border-green-500/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-3xl -mr-8 -mt-8" />
                <div className="text-2xl sm:text-4xl font-bold text-white mb-2 leading-none tracking-tighter">{metrics.completed}</div>
                <div className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                   Entregas Exitosas
                </div>
              </div>
              <div className="glass-premium p-5 sm:p-8 group overflow-hidden relative border-purple-500/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl -mr-8 -mt-8" />
                <div className="text-2xl sm:text-4xl font-bold text-white mb-2 leading-none font-mono tracking-tight">
                  {metrics.avgSeconds ? formatSeconds(Math.round(metrics.avgSeconds)) : '–'}
                </div>
                <div className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                   Eficiencia Avg
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-premium p-5 sm:p-8">
                <h3 className="text-base sm:text-lg font-bold text-white mb-6 sm:mb-8 tracking-tight">Rendimiento Logístico</h3>
                <div className="flex items-end justify-center gap-6 sm:gap-12 h-32 sm:h-40">
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-16 bg-brand/10 border border-brand/20 rounded-2xl relative flex items-end justify-center overflow-hidden h-32">
                         <div className="w-full bg-brand transition-all duration-1000 shadow-[0_0_20px_rgba(0,102,255,0.3)]" style={{ height: `${completionRate}%` }} />
                         <span className="absolute top-2 text-[10px] font-black text-white z-10">{Math.round(completionRate)}%</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest text-center">Tasa de Exito</span>
                   </div>
                   <div className="flex flex-col items-center gap-4 opacity-40">
                      <div className="w-16 bg-white/5 border border-white/10 rounded-2xl relative flex items-end justify-center overflow-hidden h-32">
                         <div className="w-full bg-white/10" style={{ height: '80%' }} />
                         <span className="absolute top-2 text-[10px] font-black text-white z-10">80%</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest text-center">Optimun</span>
                   </div>
                </div>
              </div>

              <div className="glass-premium p-5 sm:p-8">
                <h3 className="text-base sm:text-lg font-bold text-white mb-5 sm:mb-6 tracking-tight">Top Agentes</h3>
                <div className="space-y-4">
                  {metrics.topCouriers.length > 0 ? metrics.topCouriers.slice(0, 3).map((c, i) => (
                    <div key={c.repartidorId} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 group hover:border-brand-light/30 transition-all">
                      <div className="flex items-center gap-4 text-sm font-semibold">
                        <div className="text-brand font-black italic opacity-30 text-2xl">0{i+1}</div>
                        <div className="text-gray-200">Agente Logístico #{c.repartidorId}</div>
                      </div>
                      <div className="text-brand-light font-bold text-sm">{c._count.id} Envíos</div>
                    </div>
                  )) : <p className="text-muted italic text-sm">No hay datos suficientes.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'reviews' && (
          <div className="animate-slide-up grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div key={r.id} className="glass-premium p-4 sm:p-6 relative group border-transparent hover:border-white/10 transition-all">
                <button className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-600 hover:text-red-400 p-1.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center" onClick={() => deleteReview(r.id)}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                <div className="flex text-brand-light mb-4">
                  {Array.from({length: 5}).map((_, i) => (
                    <svg key={i} className={`w-3.5 h-3.5 ${i < r.puntos ? 'fill-current' : 'text-white/10'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">"{r.comentario}"</p>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-muted uppercase tracking-widest">
                  <span>De: {r.sujeto.nombre}</span>
                  <span className="font-mono">P-#{r.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-premium w-full max-w-md p-5 sm:p-8 animate-slide-up border-brand/40 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-5 sm:mb-6">Crear Nuevo Perfil</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" placeholder="Nombre Completo" required className="input-clean" value={formData.nombre} onChange={e=>setFormData({...formData, nombre:e.target.value})} />
              <input type="email" placeholder="Email" required className="input-clean" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} />
              <input type="password" placeholder="Contraseña Inicial" required className="input-clean" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} />
              <select className="input-clean" value={formData.role} onChange={e=>setFormData({...formData, role:e.target.value})}>
                <option value="CLIENTE">CLIENTE</option>
                <option value="REPARTIDOR">REPARTIDOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={()=>setIsCreating(false)} className="flex-1 btn-outline py-2">Cancelar</button>
                <button type="submit" className="flex-1 btn-primary py-2">Crear Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-premium w-full max-w-md p-5 sm:p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Editar Perfil</h3>
            <p className="text-xs text-muted mb-6">ID: #{editingUser.id} | {editingUser.email}</p>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="text" required className="input-clean" value={editingUser.nombre} onChange={e=>setEditingUser({...editingUser, nombre:e.target.value})} />
              <select className="input-clean" value={editingUser.role} onChange={e=>setEditingUser({...editingUser, role:e.target.value})}>
                <option value="CLIENTE">CLIENTE</option>
                <option value="REPARTIDOR">REPARTIDOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={()=>setEditingUser(null)} className="flex-1 btn-outline py-2">Cancelar</button>
                <button type="submit" className="flex-1 btn-primary py-2">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passResetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-5 sm:p-8 animate-slide-up border-orange-500/40 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Reasignar Contraseña</h3>
            <p className="text-xs text-muted mb-6">Usuario: {passResetUser.nombre}</p>
            <form onSubmit={handlePassReset} className="space-y-4">
              <input name="newpass" type="password" placeholder="Nueva Contraseña" required minLength={6} className="input-clean" />
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={()=>setPassResetUser(null)} className="flex-1 btn-outline py-2">Cancelar</button>
                <button type="submit" className="flex-1 btn-primary bg-orange-600 hover:bg-orange-700 border-orange-600 py-2">Actualizar Clave</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
