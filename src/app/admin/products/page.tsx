'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';

const EMPTY: Partial<Product> = {
  name: '', description: '', price: 0, category: 'Graphic Tees',
  sizes: ['S', 'M', 'L', 'XL'], colors: [], stock: 10, images: [],
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Product>>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(EMPTY); setModal(true); };
  const openEdit = (p: Product) => { setEditing(p); setModal(true); };

  const handleSave = async () => {
    const { id, ...body } = editing as Product;
    if (id) {
      await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...body }) });
    } else {
      await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    setModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
    load();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `products/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('product-images').upload(path, file);
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
      setEditing((prev) => ({ ...prev, images: [...(prev.images || []), urlData.publicUrl] }));
    }
    setUploading(false);
  };

  const removeImage = (url: string) =>
    setEditing((prev) => ({ ...prev, images: prev.images?.filter((i) => i !== url) }));

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
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
          <h2 className="text-3xl font-black uppercase">Products</h2>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 font-bold uppercase text-sm"
            style={{ background: '#e63329', color: 'white' }}>
            <Plus size={16} /> Add Product
          </button>
        </div>

        <div className="rounded overflow-hidden" style={{ border: '1px solid #1a1a1a' }}>
          <table className="w-full text-sm">
            <thead style={{ background: '#111' }}>
              <tr>
                {['Image', 'Name', 'Price', 'Stock', 'Category', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#666' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderTop: '1px solid #1a1a1a' }}>
                  <td className="px-4 py-3">
                    <div className="relative w-10 h-10" style={{ background: '#1a1a1a' }}>
                      {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold">{p.name}</td>
                  <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span style={{ color: p.stock === 0 ? '#e63329' : p.stock < 5 ? '#f59e0b' : '#22c55e' }}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#888' }}>{p.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1 hover:text-red-500"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="text-center py-12" style={{ color: '#555' }}>No products yet. Add your first shirt!</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded" style={{ background: '#111', border: '1px solid #222' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase">{editing.id ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={() => setModal(false)}><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Name</label>
                  <input value={editing.name || ''} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} className="w-full" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#f5f5f5', padding: '0.5rem' }} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Price ($)</label>
                  <input type="number" step="0.01" value={editing.price || ''} onChange={(e) => setEditing((p) => ({ ...p, price: parseFloat(e.target.value) }))} className="w-full" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#f5f5f5', padding: '0.5rem' }} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Description</label>
                <textarea rows={3} value={editing.description || ''} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} className="w-full" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#f5f5f5', padding: '0.5rem' }} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Category</label>
                  <select value={editing.category || ''} onChange={(e) => setEditing((p) => ({ ...p, category: e.target.value }))} className="w-full" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#f5f5f5', padding: '0.5rem' }}>
                    {['Graphic Tees', 'Hoodies', 'Accessories', 'Sale'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Stock</label>
                  <input type="number" value={editing.stock || 0} onChange={(e) => setEditing((p) => ({ ...p, stock: parseInt(e.target.value) }))} className="w-full" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#f5f5f5', padding: '0.5rem' }} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Sizes (comma separated)</label>
                <input value={editing.sizes?.join(', ') || ''} onChange={(e) => setEditing((p) => ({ ...p, sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} className="w-full" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#f5f5f5', padding: '0.5rem' }} placeholder="S, M, L, XL, XXL" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Colors (comma separated)</label>
                <input value={editing.colors?.join(', ') || ''} onChange={(e) => setEditing((p) => ({ ...p, colors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} className="w-full" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#f5f5f5', padding: '0.5rem' }} placeholder="Black, White, Red" />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">Product Images</label>
                <div className="flex gap-2 flex-wrap mb-3">
                  {editing.images?.map((url) => (
                    <div key={url} className="relative w-16 h-16" style={{ background: '#1a1a1a' }}>
                      <Image src={url} alt="" fill className="object-cover" />
                      <button onClick={() => removeImage(url)} className="absolute top-0 right-0 p-0.5" style={{ background: '#e63329' }}>
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase border"
                  style={{ borderColor: '#333', color: '#888', background: 'transparent', cursor: 'pointer' }}>
                  <Upload size={14} />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={handleSave} className="flex-1 py-3 font-black uppercase tracking-wider text-white"
                style={{ background: '#e63329' }}>
                {editing.id ? 'Save Changes' : 'Create Product'}
              </button>
              <button onClick={() => setModal(false)} className="px-6 py-3 font-bold uppercase text-sm border"
                style={{ borderColor: '#333', color: '#888', background: 'transparent' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
