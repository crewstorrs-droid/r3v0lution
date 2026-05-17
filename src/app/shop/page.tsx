import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';

async function getProducts(category?: string): Promise<Product[]> {
  try {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });
    if (category && category !== 'all') query = query.eq('category', category);
    const { data } = await query;
    return data || [];
  } catch {
    return [];
  }
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const products = await getProducts(cat);

  const categories = ['All', 'New', 'Graphic Tees', 'Hoodies', 'Sale'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-bold tracking-[0.4em] uppercase mb-2" style={{ color: '#e63329' }}>R3V0LUTION</p>
        <h1 className="text-5xl font-black uppercase tracking-tight">Shop All</h1>
      </div>

      {/* Category filters */}
      <div className="flex gap-3 mb-10 flex-wrap">
        {categories.map((c) => {
          const slug = c === 'All' ? undefined : c.toLowerCase().replace(' ', '-');
          const active = (!cat && c === 'All') || cat === slug;
          return (
            <a
              key={c}
              href={slug ? `/shop?cat=${slug}` : '/shop'}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all"
              style={{
                background: active ? '#e63329' : 'transparent',
                borderColor: active ? '#e63329' : '#333',
                color: active ? 'white' : '#888',
              }}
            >
              {c}
            </a>
          );
        })}
      </div>

      {/* Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="text-4xl font-black uppercase mb-4">Coming Soon</p>
          <p style={{ color: '#888' }}>New drops loading. Check back soon.</p>
        </div>
      )}
    </div>
  );
}
