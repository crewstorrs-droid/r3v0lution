'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { ChevronDown } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  paid: '#3b82f6',
  shipped: '#a855f7',
  delivered: '#22c55e',
  cancelled: '#e63329',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    let q = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    setOrders(data || []);
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    load();
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 flex-shrink-0 p-6" style={{ background: '#0f0f0f', borderRight: '1px solid #1a1a1a' }}>
        <div className="mb-8">
          <h1 className="text-lg font-black tracking-widest" style={{ color: '#e63329' }}>R3V0LUTION</h1>
          <p className="text-xs mt-1" style={{ color: '#555' }}>Admin Panel</p>
        </div>
        <nav className="flex flex-col gap-2">
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/products', label: 'Products' },
            { href: '/admin/orders', label: 'Orders' },
            { href: '/', label: '← View Site' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="px-3 py-2 text-sm font-bold uppercase tracking-wide hover:text-red-500 transition-colors" style={{ color: '#888' }}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black uppercase">Orders</h2>
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className="px-3 py-1 text-xs font-bold uppercase border transition-all capitalize"
                style={{ borderColor: filter === s ? '#e63329' : '#333', color: filter === s ? '#e63329' : '#666', background: 'transparent' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} style={{ background: '#111', border: '1px solid #1a1a1a' }} className="rounded">
              <button
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                className="w-full flex items-center justify-between p-4 text-left">
                <div className="flex items-center gap-6">
                  <span className="font-mono text-xs" style={{ color: '#555' }}>{order.id.slice(0, 8)}…</span>
                  <span className="font-bold">{order.customer_name}</span>
                  <span className="text-sm" style={{ color: '#888' }}>{order.customer_email}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">${order.total.toFixed(2)}</span>
                  <span className="text-xs px-2 py-1 rounded capitalize font-bold" style={{ background: `${STATUS_COLORS[order.status]}22`, color: STATUS_COLORS[order.status] }}>
                    {order.status}
                  </span>
                  <span className="text-xs" style={{ color: '#555' }}>{new Date(order.created_at).toLocaleDateString()}</span>
                  <ChevronDown size={16} className={`transition-transform ${expanded === order.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {expanded === order.id && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: '#1a1a1a' }}>
                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    {/* Shipping */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#666' }}>Shipping Address</h4>
                      <p className="text-sm">{order.shipping_address.line1}</p>
                      {order.shipping_address.line2 && <p className="text-sm">{order.shipping_address.line2}</p>}
                      <p className="text-sm">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                      <p className="text-sm">{order.shipping_address.country}</p>
                    </div>

                    {/* Items */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#666' }}>Items</h4>
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm py-1">
                          <span>{item.product_name} × {item.quantity} ({item.size}/{item.color})</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status update */}
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#666' }}>Update Status:</span>
                    <div className="flex gap-2 flex-wrap">
                      {['pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((s) => (
                        <button key={s} onClick={() => updateStatus(order.id, s)}
                          disabled={order.status === s}
                          className="px-3 py-1 text-xs font-bold uppercase border transition-all capitalize"
                          style={{
                            borderColor: order.status === s ? STATUS_COLORS[s] : '#333',
                            color: order.status === s ? STATUS_COLORS[s] : '#666',
                            background: 'transparent',
                            cursor: order.status === s ? 'default' : 'pointer',
                          }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-16" style={{ color: '#555' }}>No orders yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
