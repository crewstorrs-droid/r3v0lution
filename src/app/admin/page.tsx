'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { TrendingUp, TrendingDown, Package, DollarSign, ShoppingBag, Users } from 'lucide-react';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  avgOrderValue: number;
  revenueByDay: { date: string; revenue: number }[];
  recentOrders: Order[];
  statusBreakdown: Record<string, number>;
}

const SHIRT_COST = 12; // estimated cost per shirt for P&L

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const since = new Date();
      since.setDate(since.getDate() - range);

      const [{ data: orders }, { data: products }] = await Promise.all([
        supabase.from('orders').select('*').gte('created_at', since.toISOString()).order('created_at', { ascending: false }),
        supabase.from('products').select('id'),
      ]);

      const paid = (orders || []).filter((o) => ['paid', 'shipped', 'delivered'].includes(o.status));
      const totalRevenue = paid.reduce((s: number, o: Order) => s + o.total, 0);
      const totalItems = paid.reduce((s: number, o: Order) => s + o.items.reduce((ss: number, i) => ss + i.quantity, 0), 0);
      const cogs = totalItems * SHIRT_COST;

      // Revenue by day (last range days)
      const dayMap: Record<string, number> = {};
      for (let i = range - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dayMap[d.toISOString().slice(0, 10)] = 0;
      }
      paid.forEach((o: Order) => {
        const day = o.created_at.slice(0, 10);
        if (day in dayMap) dayMap[day] += o.total;
      });

      const statusBreakdown: Record<string, number> = {};
      (orders || []).forEach((o: Order) => {
        statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
      });

      setStats({
        totalRevenue,
        totalOrders: (orders || []).length,
        totalProducts: (products || []).length,
        avgOrderValue: paid.length ? totalRevenue / paid.length : 0,
        revenueByDay: Object.entries(dayMap).map(([date, revenue]) => ({ date, revenue })),
        recentOrders: (orders || []).slice(0, 8) as Order[],
        statusBreakdown,
      });
      setLoading(false);
    }
    load();
  }, [range]);

  const profit = stats ? stats.totalRevenue - (stats.totalOrders * SHIRT_COST * 1.2) : 0;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 p-6 flex flex-col gap-2" style={{ background: '#0f0f0f', borderRight: '1px solid #1a1a1a' }}>
        <div className="mb-8">
          <h1 className="text-lg font-black tracking-widest" style={{ color: '#e63329' }}>R3V0LUTION</h1>
          <p className="text-xs mt-1" style={{ color: '#555' }}>Admin Panel</p>
        </div>
        {[
          { href: '/admin', label: 'Dashboard', icon: TrendingUp },
          { href: '/admin/products', label: 'Products', icon: ShoppingBag },
          { href: '/admin/orders', label: 'Orders', icon: Package },
          { href: '/', label: '← View Site', icon: Users },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className="flex items-center gap-3 px-3 py-2 text-sm font-bold uppercase tracking-wide rounded transition-colors hover:text-red-500"
            style={{ color: '#888' }}>
            <Icon size={16} />{label}
          </Link>
        ))}
      </aside>

      {/* Main */}
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black uppercase">Dashboard</h2>
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <button key={d} onClick={() => setRange(d)}
                className="px-3 py-1 text-xs font-bold uppercase border transition-all"
                style={{ borderColor: range === d ? '#e63329' : '#333', color: range === d ? '#e63329' : '#666', background: 'transparent' }}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-red-600 rounded-full animate-spin" style={{ borderTopColor: 'transparent' }} />
          </div>
        ) : stats && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: '#22c55e' },
                { label: 'Orders', value: stats.totalOrders, icon: Package, color: '#3b82f6' },
                { label: 'Products', value: stats.totalProducts, icon: ShoppingBag, color: '#a855f7' },
                { label: 'Avg Order', value: `$${stats.avgOrderValue.toFixed(2)}`, icon: TrendingUp, color: '#f59e0b' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="p-5 rounded" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#666' }}>{label}</p>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <p className="text-2xl font-black">{value}</p>
                </div>
              ))}
            </div>

            {/* P&L */}
            <div className="p-6 mb-8 rounded" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
              <h3 className="font-black uppercase tracking-wider mb-4 text-sm" style={{ color: '#888' }}>Profit & Loss (last {range} days)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#666' }}>Revenue</p>
                  <p className="text-2xl font-black" style={{ color: '#22c55e' }}>${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#666' }}>Est. Costs</p>
                  <p className="text-2xl font-black" style={{ color: '#e63329' }}>
                    ${(stats.totalOrders * SHIRT_COST * 1.2).toFixed(2)}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#444' }}>~$14.40/shirt (materials + overhead)</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#666' }}>Net Profit</p>
                  <div className="flex items-center gap-2">
                    {profit >= 0
                      ? <TrendingUp size={20} style={{ color: '#22c55e' }} />
                      : <TrendingDown size={20} style={{ color: '#e63329' }} />}
                    <p className="text-2xl font-black" style={{ color: profit >= 0 ? '#22c55e' : '#e63329' }}>
                      ${Math.abs(profit).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue chart (simple bar) */}
            <div className="p-6 mb-8 rounded" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
              <h3 className="font-black uppercase tracking-wider mb-4 text-sm" style={{ color: '#888' }}>Revenue Over Time</h3>
              <div className="flex items-end gap-1 h-32">
                {stats.revenueByDay.map(({ date, revenue }) => {
                  const max = Math.max(...stats.revenueByDay.map((d) => d.revenue), 1);
                  const height = (revenue / max) * 100;
                  return (
                    <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="w-full rounded-t" style={{ height: `${Math.max(height, 2)}%`, background: revenue > 0 ? '#e63329' : '#1a1a1a' }} />
                      <div className="absolute bottom-full mb-1 hidden group-hover:block text-xs px-1 py-0.5 rounded whitespace-nowrap" style={{ background: '#222', color: '#fff' }}>
                        {date}: ${revenue.toFixed(0)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order status + recent orders */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="p-6 rounded" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
                <h3 className="font-black uppercase tracking-wider mb-4 text-sm" style={{ color: '#888' }}>Order Status</h3>
                {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex justify-between py-2 border-b text-sm" style={{ borderColor: '#1a1a1a' }}>
                    <span className="capitalize font-bold">{status}</span>
                    <span style={{ color: '#888' }}>{count}</span>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black uppercase tracking-wider text-sm" style={{ color: '#888' }}>Recent Orders</h3>
                  <Link href="/admin/orders" className="text-xs" style={{ color: '#e63329' }}>View all →</Link>
                </div>
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex justify-between py-2 border-b text-sm" style={{ borderColor: '#1a1a1a' }}>
                    <div>
                      <p className="font-bold">{order.customer_name}</p>
                      <p className="text-xs" style={{ color: '#555' }}>{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${order.total.toFixed(2)}</p>
                      <p className="text-xs capitalize" style={{ color: order.status === 'paid' ? '#22c55e' : '#888' }}>{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
