import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SpeedrunTimer from '../components/SpeedrunTimer';
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
  repartidor: { id: number; nombre: string } | null;
  offers: Array<{ id: number; montoOfertado: number; repartidor: { nombre: string } }>;
}

function formatSeconds(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, '0')).join(':');
}

const STATUS_LABEL: Record<string, string> = {
  ABIERTA: 'ABIERTA',
  INVITADO: 'ESPERANDO RESPUESTA',
  ASIGNADA: 'ASIGNADA',
  EN_CAMINO: 'EN CAMINO',
  COMPLETADA: 'COMPLETADA',
  CANCELADA: 'CANCELADA',
};


export default function ClientDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState({ descripcion: '', puntoRetiro: '', puntoEntrega: '', montoOfertado: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState<{ orderId: number; sujetoId: number } | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState({ puntos: 5, comentario: '' });
  const [sockets, setSockets] = useState<Map<number, Socket>>(new Map());
  const [couriers, setCouriers] = useState<any[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<{ id: number; nombre: string } | null>(null);

  const fetchOrders = useCallback(async () => {
    const { data } = await api.get<Order[]>('/orders/mine');
    setOrders(data);
    return data;
  }, []);

  const fetchCouriers = async () => {
    try {
      const { data } = await api.get('/users/couriers');
      setCouriers(data);
    } catch (e) {}
  };

  const subscribeOrder = useCallback((order: Order) => {
    if (order.status === 'EN_CAMINO' || order.status === 'ASIGNADA') {
      const wsUrl = import.meta.env.VITE_WS_URL || 'http://100.117.249.82:3000';
      const socket = io(`${wsUrl}/orders`);
      socket.emit('joinOrder', order.id);
      socket.on('orderStatusChanged', (updated: Order) => {
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      });
      setSockets((prev) => new Map(prev).set(order.id, socket));
    }
  }, []);

  useEffect(() => {
    fetchOrders().then((data) => data.forEach(subscribeOrder));
    fetchCouriers();
    return () => {
      sockets.forEach((s) => s.disconnect());
    };
  }, [fetchOrders, subscribeOrder, sockets]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await api.post('/orders', { 
        ...form, 
        montoOfertado: parseFloat(form.montoOfertado),
        repartidorId: selectedCourier?.id 
      });
      setForm({ descripcion: '', puntoRetiro: '', puntoEntrega: '', montoOfertado: '' });
      setSelectedCourier(null);
      const data = await fetchOrders();
      data.forEach(subscribeOrder);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error al crear pedido');
    } finally {
      setFormLoading(false);
    }
  };

  const handleReview = async () => {
    if (!reviewModal) return;
    await api.post('/reviews', { ...reviewForm, orderId: reviewModal.orderId, sujetoId: reviewModal.sujetoId });
    setReviewModal(null);
    fetchOrders();
  };

  const acceptOffer = async (orderId: number, offerId: number) => {
    await api.patch(`/orders/${orderId}/accept-offer/${offerId}`);
    const data = await fetchOrders();
    data.forEach(subscribeOrder);
  };

  const activeOrder = orders.find((o) => o.status === 'EN_CAMINO');

  return (
    <div className="min-h-screen bg-neutral-950 font-sans selection:bg-white/10">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard Cliente</h2>
          <span className="text-muted text-sm mt-1">/ {user?.nombre}</span>
        </div>

        {activeOrder && (
          <div className="animate-fade-in">
            <SpeedrunTimer startTime={activeOrder.startTime} active />
          </div>
        )}

        <div className="glass-premium p-6 md:p-8 animate-slide-up">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-3">
             <h3 className="text-lg font-semibold text-white">📦 {selectedCourier ? `Solicitud Directa a ${selectedCourier.nombre}` : 'Nuevo Pedido'}</h3>
             {selectedCourier && (
               <button onClick={() => setSelectedCourier(null)} className="text-[10px] text-red-400 font-bold uppercase tracking-widest hover:text-red-300">Cancelar Selección</button>
             )}
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Descripción</label>
              <input id="order-desc" className="input-clean" placeholder="Ej: Paquete pequeño, documentos..."
                value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Punto de Retiro</label>
              <input id="order-retiro" className="input-clean" placeholder="Ej: Av. Providencia 1234"
                value={form.puntoRetiro} onChange={(e) => setForm({ ...form, puntoRetiro: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Punto de Entrega</label>
              <input id="order-entrega" className="input-clean" placeholder="Ej: Calle Ñuñoa 456"
                value={form.puntoEntrega} onChange={(e) => setForm({ ...form, puntoEntrega: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Presupuesto ($)</label>
              <input id="order-monto" className="input-clean" type="number" min="1" step="0.01" placeholder="3500"
                value={form.montoOfertado} onChange={(e) => setForm({ ...form, montoOfertado: e.target.value })} required />
            </div>
            <div className="flex items-end pt-1">
              <button id="order-submit" type="submit" disabled={formLoading} className="btn-primary w-full disabled:opacity-60">
                {formLoading ? 'Procesando...' : selectedCourier ? 'Mandar Solicitud' : 'Publicar Oferta'}
              </button>
            </div>
            {formError && (
              <p className="md:col-span-2 text-red-400 text-sm bg-red-900/20 px-4 py-3 rounded-xl border border-red-500/20">{formError}</p>
            )}
          </form>
        </div>

        <div>
           <h3 className="text-lg font-semibold text-white mb-5 border-b border-white/10 pb-3 uppercase tracking-tighter">⚡ Speedrunners Disponibles</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {couriers.map((c: any) => {
               const avgPuntos = c.reviewsR?.length > 0 
                 ? (c.reviewsR.reduce((acc: number, r: any) => acc + r.puntos, 0) / c.reviewsR.length).toFixed(1)
                 : 'Nuevo';
               
               return (
                 <div key={c.id} className="glass-premium p-5 flex items-center justify-between group hover:border-brand-light/20 transition-all">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-gray-400 group-hover:bg-white/10 transition-colors">
                       {c.nombre[0]}
                     </div>
                     <div>
                       <p className="text-white font-medium text-sm">{c.nombre}</p>
                       <div className="flex flex-wrap items-center gap-2 mt-1">
                         <span className="text-[10px] text-brand-light font-bold mr-1">⭐ {avgPuntos}</span>
                         {c.tarifas?.map((t: any) => (
                           <span key={t.id} className="text-[9px] bg-white/10 px-2 py-0.5 rounded-md text-gray-400 border border-white/5">
                             {t.zona}: <span className="text-gray-200 font-bold">${t.precioBase.toLocaleString()}</span>
                           </span>
                         ))}
                         {(!c.tarifas || c.tarifas.length === 0) && <span className="text-[9px] text-muted italic">Sin tarifas publicadas</span>}
                       </div>

                     </div>
                   </div>
                   <button 
                     onClick={() => {
                       setSelectedCourier(c);
                       document.getElementById('order-desc')?.focus();
                       window.scrollTo({ top: 0, behavior: 'smooth' });
                     }}
                     className="btn-outline px-4 py-1.5 text-[10px] opacity-60 hover:opacity-100"
                   >
                     Solicitar
                   </button>
                 </div>
               );
             })}
             {couriers.length === 0 && <p className="text-muted text-xs italic">No hay repartidores activos en este momento.</p>}
           </div>
         </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-5 border-b border-white/10 pb-3">📋 Mis Pedidos</h3>
          {orders.length === 0 ? (
            <p className="text-muted text-sm italic">No has realizado pedidos todavía.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} onClick={() => setDetailOrderId(order.id)} className="glass-premium p-5 group hover:border-brand-light/40 transition-all cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-brand/5 rounded-full blur-2xl -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-muted text-xs mr-2">#{order.id}</span>
                      <span className="text-gray-100 font-medium">{order.descripcion}</span>
                    </div>
                    <span className={`status-${order.status}`}>{STATUS_LABEL[order.status]}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 bg-dark-800/50 p-3 rounded-xl">
                    <div className="flex flex-col"><span className="text-xs text-muted mb-0.5">Retiro</span><span className="truncate">{order.puntoRetiro}</span></div>
                    <div className="flex flex-col"><span className="text-xs text-muted mb-0.5">Entrega</span><span className="truncate">{order.puntoEntrega}</span></div>
                    <div className="flex flex-col"><span className="text-xs text-muted mb-0.5">Valor</span><span className="text-brand-light font-medium">${order.montoOfertado.toLocaleString()}</span></div>
                    {order.repartidor && <div className="flex flex-col"><span className="text-xs text-muted mb-0.5">Repartidor</span><span>{order.repartidor.nombre}</span></div>}
                  </div>

                  {order.status !== 'ABIERTA' && order.status !== 'INVITADO' && order.status !== 'CANCELADA' && (

                    <div className="mt-6 border-t border-white/5 pt-2">
                       <OrderTimeline status={order.status} />
                    </div>
                  )}

                  {order.status === 'ABIERTA' && order.offers && order.offers.length > 0 && (
                    <div className="mt-4 border-t border-white/5 pt-4">
                      <p className="text-[10px] font-bold text-brand-light uppercase tracking-[0.2em] mb-3">Ofertas de Repartidores ({order.offers.length})</p>
                      <div className="space-y-2">
                        {order.offers.map(off => (
                          <div key={off.id} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                            <div className="text-sm">
                              <span className="text-white font-medium mr-2">{off.repartidor.nombre}</span>
                              <span className="text-brand-light font-bold">${off.montoOfertado.toLocaleString()}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); acceptOffer(order.id, off.id); }} className="btn-primary py-1 px-4 text-[10px]">Aceptar</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {order.status === 'COMPLETADA' && order.totalSeconds !== null && (
                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2 text-brand-light">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="font-mono text-sm tracking-wide">{formatSeconds(order.totalSeconds)}</span>
                      </div>
                      {order.repartidor && (
                        <button
                          className="text-xs btn-outline py-1.5 px-4"
                          onClick={(e) => { e.stopPropagation(); setReviewModal({ orderId: order.id, sujetoId: order.repartidor!.id }); }}
                        >
                          Calificar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {reviewModal && (
        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-premium w-full max-w-sm p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-5">⭐ Calificar Repartidor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Puntaje (1-5)</label>
                <input className="input-clean" type="number" min={1} max={5}
                  value={reviewForm.puntos} onChange={(e) => setReviewForm({ ...reviewForm, puntos: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Comentario</label>
                <textarea className="input-clean resize-none h-24" placeholder="Entrega rápida, muy profesional..."
                  value={reviewForm.comentario} onChange={(e) => setReviewForm({ ...reviewForm, comentario: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button className="btn-primary flex-1 py-2" onClick={handleReview}>Enviar</button>
                <button className="btn-outline flex-1 py-2 text-red-400 hover:text-red-300" onClick={() => setReviewModal(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailOrderId && (
        <OrderDetailModal orderId={detailOrderId} onClose={() => { setDetailOrderId(null); fetchOrders(); }} />
      )}
    </div>
  );
}
