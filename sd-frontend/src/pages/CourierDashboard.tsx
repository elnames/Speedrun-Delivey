import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import OrderTimeline from '../components/OrderTimeline';
import OrderDetailModal from '../components/OrderDetailModal';

interface Order {
  id: number;
  descripcion: string;
  puntoRetiro: string;
  puntoEntrega: string;
  montoOfertado: number;
  status: string;
  startTime: string | null;
  endTime: string | null;
  totalSeconds: number | null;
  cliente: { id: number; nombre: string };
  offers: Array<{ id: number; repartidorId: number }>;
}

interface Tarifa {
  id: number;
  zona: string;
  precioBase: number;
}

const STATUS_LABEL: Record<string, string> = {
  ABIERTA: 'ABIERTA',
  INVITADO: 'INVITADO (SOLICITUD)',
  ASIGNADA: 'ASIGNADA',
  EN_CAMINO: 'EN CAMINO',
  COMPLETADA: 'COMPLETADA',
  CANCELADA: 'CANCELADA',
};


export default function CourierDashboard() {
  const { user } = useAuth();
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [tarifaForm, setTarifaForm] = useState({ zona: '', precioBase: '' });
  const [tab, setTab] = useState<'tablon' | 'mis' | 'tarifas'>('tablon');
  const [offerModal, setOfferModal] = useState<Order | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [offerAmount, setOfferAmount] = useState('');

  const fetchAll = useCallback(async () => {
    const [open, mine, tars] = await Promise.all([
      api.get<Order[]>('/orders/open'),
      api.get<Order[]>('/orders/mine'),
      api.get<Tarifa[]>('/users/me/tarifas'),
    ]);
    setOpenOrders(open.data);
    setMyOrders(mine.data);
    setTarifas(tars.data);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);


  const sendOffer = async () => {
    if (!offerModal) return;
    await api.post(`/orders/${offerModal.id}/offers`, { montoOfertado: parseFloat(offerAmount) });
    setOfferModal(null);
    setOfferAmount('');
    fetchAll();
  };

  const startDelivery = async (orderId: number) => {
    await api.patch(`/orders/${orderId}/start`);
    fetchAll();
  };

  const complete = async (orderId: number) => {
    await api.patch(`/orders/${orderId}/complete`);
    fetchAll();
  };

  const acceptInv = async (orderId: number) => {
    await api.patch(`/orders/${orderId}/accept-invitation`);
    fetchAll();
  };

  const rejectInv = async (orderId: number) => {
    await api.patch(`/orders/${orderId}/reject-invitation`);
    fetchAll();
  };


  const addTarifa = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/users/me/tarifas', { zona: tarifaForm.zona, precioBase: parseFloat(tarifaForm.precioBase) });
    setTarifaForm({ zona: '', precioBase: '' });
    fetchAll();
  };

  const deleteTarifa = async (id: number) => {
    await api.delete(`/users/me/tarifas/${id}`);
    fetchAll();
  };

  const activeOrder = myOrders.find((o) => o.status === 'EN_CAMINO' || o.status === 'ASIGNADA');

  return (
    <div className="min-h-screen bg-neutral-950 font-sans selection:bg-white/10">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard Repartidor</h2>
          <span className="text-muted text-sm mt-1">/ {user?.nombre}</span>
        </div>

        {activeOrder && (
          <div onClick={() => setDetailOrderId(activeOrder.id)} className="glass-premium border-brand/40 shadow-brand/10 p-6 animate-fade-in relative overflow-hidden cursor-pointer group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl group-hover:bg-brand/20 transition-all" />
            <h3 className="text-brand-light font-semibold mb-3 flex items-center gap-2">
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-brand-light"></span></span>
              PEDIDO ACTIVO #{activeOrder.id}
            </h3>
            <p className="text-white text-lg mb-4">{activeOrder.descripcion}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-dark-800/50 rounded-xl p-4 border border-white/5">
              <div className="flex flex-col"><span className="text-xs text-muted mb-1">Retiro</span><span className="font-medium text-gray-200">{activeOrder.puntoRetiro}</span></div>
              <div className="flex flex-col"><span className="text-xs text-muted mb-1">Entrega</span><span className="font-medium text-gray-200">{activeOrder.puntoEntrega}</span></div>
            </div>

            <div className="flex gap-4 mt-6">
              {activeOrder.status === 'ASIGNADA' && (
                <button id={`start-${activeOrder.id}`} className="btn-primary flex-1" onClick={() => startDelivery(activeOrder.id)}>
                  Iniciar Viaje
                </button>
              )}
              {activeOrder.status === 'EN_CAMINO' && (
                <button id={`complete-${activeOrder.id}`} className="btn-primary bg-green-600 hover:bg-green-500 shadow-green-600/20 flex-1" onClick={() => complete(activeOrder.id)}>
                  Marcar como Entregado
                </button>
              )}
            </div>
            
            <div className="mt-8 border-t border-white/5 pt-4">
               <OrderTimeline status={activeOrder.status} />
            </div>
          </div>
        )}

        {myOrders.some(o => o.status === 'INVITADO') && (
          <div className="space-y-4 animate-slide-up">
            <h3 className="text-lg font-bold text-white border-l-4 border-orange-500 pl-4 uppercase tracking-tighter">🔔 Solicitudes Directas Pendientes</h3>
            {myOrders.filter(o => o.status === 'INVITADO').map(inv => (
              <div key={inv.id} className="glass-premium p-6 border-orange-500/20 bg-orange-500/5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">{inv.descripcion}</h4>
                    <p className="text-muted text-xs font-mono">Solicitado por: {inv.cliente.nombre}</p>
                  </div>
                  <div className="text-brand-light font-black text-xl">${inv.montoOfertado.toLocaleString()}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="block text-[10px] text-muted uppercase font-bold mb-1">Desde</span>
                    <span className="text-gray-300">{inv.puntoRetiro}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="block text-[10px] text-muted uppercase font-bold mb-1">Hasta</span>
                    <span className="text-gray-300">{inv.puntoEntrega}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => acceptInv(inv.id)} className="flex-1 btn-primary py-2.5">Aceptar</button>
                  <button 
                    onClick={() => { setOfferModal(inv); setOfferAmount(inv.montoOfertado.toString()); }} 
                    className="flex-1 btn-outline py-2.5 hover:bg-white/5"
                  >
                    Contra-oferta
                  </button>
                  <button onClick={() => rejectInv(inv.id)} className="px-6 btn-outline border-red-500/30 text-red-400 hover:bg-red-500/10">Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        )}


        <div className="flex gap-4 border-b border-white/10">
          {(['tablon', 'mis', 'tarifas'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium transition-colors ${
                tab === t ? 'text-brand-light border-b-2 border-brand-light' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'tablon' ? '📋 TABLÓN' : t === 'mis' ? '📦 HISTORIAL' : '💲 TARIFAS'}
            </button>
          ))}
        </div>

        {tab === 'tablon' && (
          <div className="space-y-4">
            {openOrders.length === 0 ? (
              <p className="text-muted text-sm italic">No hay ofertas disponibles en este momento.</p>
            ) : (
              openOrders.map((order) => (
                <div key={order.id} className="glass-premium p-5 group hover:border-white/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-muted text-xs">#{order.id}</span>
                      <h4 className="text-white font-medium text-lg">{order.descripcion}</h4>
                      <span className="badge bg-blue-900/30 text-blue-400 border-blue-500/30 ml-auto md:ml-0">${order.montoOfertado.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span><span className="text-muted">De:</span> {order.puntoRetiro}</span>
                      <span className="text-muted">→</span>
                      <span><span className="text-muted">A:</span> {order.puntoEntrega}</span>
                    <span className="ml-auto text-xs text-muted">Solicita: {order.cliente.nombre}</span>
                  </div>
                </div>
                <button
                  id={`offer-${order.id}`}
                  className="btn-primary shrink-0 w-full md:w-auto text-sm py-2 px-6"
                    onClick={() => { setOfferModal(order); setOfferAmount(order.montoOfertado.toString()); }}
                    disabled={!!activeOrder || order.offers?.some(o => o.repartidorId === user?.id)}
                  >
                    {order.offers?.some(o => o.repartidorId === user?.id) ? 'Postulado' : 'Postular'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'mis' && (
          <div className="space-y-4">
            {myOrders.length === 0 ? (
               <p className="text-muted text-sm italic">Tu historial está vacío.</p>
            ) : myOrders.map((order) => (
              <div key={order.id} onClick={() => setDetailOrderId(order.id)} className="glass-premium p-5 flex justify-between items-center cursor-pointer hover:border-white/20 transition-all border-white/5">
                <div className="flex flex-col">
                  <span className="text-white font-medium">{order.descripcion}</span>
                  {order.status === 'COMPLETADA' && order.totalSeconds !== null && (
                    <span className="text-brand-light text-sm mt-1 flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       <span className="font-mono tracking-wide">
                        {[Math.floor(order.totalSeconds/3600), Math.floor((order.totalSeconds%3600)/60), order.totalSeconds%60].map(v=>String(v).padStart(2,'0')).join(':')}
                       </span>
                    </span>
                  )}
                </div>
                <span className={`status-${order.status}`}>{STATUS_LABEL[order.status]}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'tarifas' && (
          <div className="space-y-6">
            <div className="glass-premium p-6 border-brand/20">
              <h3 className="text-white font-medium mb-4">Añadir nueva zona</h3>
              <form onSubmit={addTarifa} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Zona de Cobertura</label>
                  <input className="input-clean" placeholder="Ej: Providencia, Las Condes"
                    value={tarifaForm.zona} onChange={(e) => setTarifaForm({ ...tarifaForm, zona: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Precio Base ($)</label>
                  <input className="input-clean" type="number" min="0" step="0.01" placeholder="2500"
                    value={tarifaForm.precioBase} onChange={(e) => setTarifaForm({ ...tarifaForm, precioBase: e.target.value })} required />
                </div>
                <div className="md:col-span-2 pt-2">
                  <button type="submit" className="btn-primary w-full">Agregar Tarifa</button>
                </div>
              </form>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tarifas.map((t) => (
                <div key={t.id} className="glass-premium p-4 flex justify-between items-center group">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{t.zona}</span>
                    <span className="text-brand-light font-medium text-lg">${t.precioBase.toLocaleString()}</span>
                  </div>
                  <button className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-colors" onClick={() => deleteTarifa(t.id)}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {offerModal && (
        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-premium w-full max-w-sm p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-2">🏷️ Enviar Oferta</h3>
            <p className="text-xs text-muted mb-6">Pedido #{offerModal.id} | {offerModal.descripcion}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Tu Propuesta ($)</label>
                <input className="input-clean" type="number" 
                  value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-2">
                <button className="btn-primary flex-1 py-2" onClick={sendOffer}>Enviar Oferta</button>
                <button className="btn-outline flex-1 py-2 text-red-400" onClick={() => setOfferModal(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailOrderId && (
        <OrderDetailModal orderId={detailOrderId} onClose={() => { setDetailOrderId(null); fetchAll(); }} isCourier />
      )}
    </div>
  );
}
