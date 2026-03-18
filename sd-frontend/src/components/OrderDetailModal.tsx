import { useState, useEffect } from 'react';
import api from '../api/client';
import OrderTimeline from './OrderTimeline';
import SpeedrunTimer from './SpeedrunTimer';

interface Tarifa { id: number; zona: string; precioBase: number; }
interface Evidence { id: number; imageUrl: string; notas: string; createdAt: string; }
interface Order {
  id: number; descripcion: string; puntoRetiro: string; puntoEntrega: string; 
  status: string; montoOfertado: number; startTime: string | null; 
  repartidor: { id: number; nombre: string; tarifas?: Tarifa[] } | null;
  evidences: Evidence[];
}


interface Props {
  orderId: number;
  onClose: () => void;
  isCourier?: boolean;
}

export default function OrderDetailModal({ orderId, onClose, isCourier }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      const { data } = await api.get<Order>(`/orders/${orderId}`);
      setOrder(data);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchDetail(); }, [orderId]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const submitEvidence = async () => {
    if (!image) return;
    await api.post(`/orders/${orderId}/evidence`, { imageUrl: image, notas: note });
    setImage(null); setNote('');
    fetchDetail();
  };

  if (loading) return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="text-white animate-pulse">Cargando detalles...</div>
    </div>
  );

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-premium w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 flex flex-col animate-slide-up">
        
        <div className="p-8 border-b border-white/5 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-brand-light text-xs font-bold tracking-widest uppercase">Pedido #{order.id}</span>
              <span className={`status-${order.status} scale-90`}>{order.status}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{order.descripcion}</h2>
            <p className="text-muted text-sm">{order.puntoRetiro} → {order.puntoEntrega}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {order.status === 'EN_CAMINO' && (
             <SpeedrunTimer startTime={order.startTime} active />
          )}

          <div className="bg-white/[0.02] rounded-3xl p-6 border border-white/5">
            <OrderTimeline status={order.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Información</h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-muted text-sm">Valor Final</span>
                  <span className="text-brand-light font-bold">${order.montoOfertado.toLocaleString()}</span>
                </div>
                <div className="flex flex-col border-b border-white/5 pb-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted text-sm">Repartidor</span>
                    <span className="text-white text-sm">{order.repartidor?.nombre || 'Buscando...'}</span>
                  </div>
                  {order.repartidor?.tarifas && order.repartidor.tarifas?.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {order.repartidor.tarifas.map(t => (
                        <span key={t.id} className="text-[9px] bg-white/5 py-1 px-2 rounded-md border border-white/10 text-gray-400">
                          {t.zona}: <span className="text-brand-light font-bold">${t.precioBase.toLocaleString()}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>


              {isCourier && (order.status === 'EN_CAMINO' || order.status === 'ASIGNADA') && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-bold text-brand-light uppercase tracking-widest">Añadir Avance</h3>
                  <div className="space-y-3">
                    <label className="block w-full cursor-pointer">
                      <div className="input-clean flex items-center justify-center gap-2 py-8 border-dashed">
                        {image ? <img src={image} className="w-20 h-20 object-cover rounded-lg" /> : <span>📸 Subir Foto</span>}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                    </label>
                    <input className="input-clean" placeholder="Breve nota de avance..." value={note} onChange={e=>setNote(e.target.value)} />
                    <button onClick={submitEvidence} disabled={!image} className="btn-primary w-full py-2.5 disabled:opacity-50">Enviar Evidencia</button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Evidencias ({order.evidences?.length || 0})</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {order.evidences?.map(ev => (
                  <div key={ev.id} className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 space-y-3">
                    <img src={ev.imageUrl} alt="Evidencia" className="w-full h-auto rounded-xl object-contain border border-white/10" />
                    {ev.notas && <p className="text-gray-300 text-[10px] leading-relaxed italic">"{ev.notas}"</p>}
                    <span className="text-[8px] text-muted block text-right">{new Date(ev.createdAt).toLocaleString()}</span>
                  </div>
                ))}
                {(order.evidences?.length ?? 0) === 0 && <p className="text-muted text-xs italic">Aún no hay evidencias subidas.</p>}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
