import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .limit(4);
    return data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden" style={{ background: '#0a0a0a' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)' }} />
        {/* Decorative lines */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="absolute border-l" style={{ borderColor: '#e63329', left: `${i * 11}%`, top: 0, bottom: 0 }} />
          ))}
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <p className="text-xs font-bold tracking-[0.5em] mb-6 uppercase" style={{ color: '#e63329' }}>New Collection 2026</p>
          <h1 className="text-6xl md:text-9xl font-black uppercase leading-none tracking-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
            WEAR THE<br />
            <span style={{ color: '#e63329', WebkitTextStroke: '2px #e63329' }}>R3V0LUTION</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-xl mx-auto" style={{ color: '#888' }}>
            Premium street shirts. Designed to stand out. Built to last.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="btn-primary text-center">Shop Now</Link>
            <Link href="/shop?cat=new" className="btn-outline text-center">New Arrivals</Link>
          </div>
        </div>
      </section>

      {/* Marquee banner */}
      <div className="overflow-hidden py-4" style={{ background: '#e63329' }}>
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="text-white font-black uppercase tracking-widest text-sm flex-shrink-0">
              R3V0LUTION &nbsp;•&nbsp; STREET APPAREL &nbsp;•&nbsp; BUILT DIFFERENT &nbsp;•&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-xs font-bold tracking-[0.4em] uppercase mb-2" style={{ color: '#e63329' }}>Featured</p>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Best Sellers</h2>
          </div>
          <Link href="/shop" className="hidden md:block btn-outline">View All</Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Placeholder skeletons when no products */}
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="aspect-square rounded-sm animate-pulse" style={{ background: '#1a1a1a' }} />
                <div className="mt-3 h-4 rounded animate-pulse w-3/4" style={{ background: '#1a1a1a' }} />
                <div className="mt-2 h-4 rounded animate-pulse w-1/2" style={{ background: '#1a1a1a' }} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center md:hidden">
          <Link href="/shop" className="btn-primary">View All</Link>
        </div>
      </section>

      {/* Brand strip */}
      <section className="py-20" style={{ background: '#111' }}>
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: '🔥', title: 'Limited Drops', desc: 'Every shirt is a limited run. When it\'s gone, it\'s gone.' },
            { icon: '✊', title: 'Made With Purpose', desc: 'Every design carries a message. Wear what you believe.' },
            { icon: '📦', title: 'Fast Shipping', desc: 'Orders ship within 2-3 business days. Track every step.' },
          ].map((item) => (
            <div key={item.title} className="p-6">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-black uppercase tracking-wide text-lg mb-2">{item.title}</h3>
              <p className="text-sm" style={{ color: '#888' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
