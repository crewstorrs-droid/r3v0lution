'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/store/cart';
import { Product } from '@/types';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => {
      setProduct(data);
      if (data?.sizes?.[0]) setSelectedSize(data.sizes[0]);
      if (data?.colors?.[0]) setSelectedColor(data.colors[0]);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-red-600 rounded-full animate-spin" style={{ borderTopColor: 'transparent' }} />
    </div>
  );

  if (!product) return (
    <div className="text-center py-24">
      <p className="text-2xl font-black">Product not found</p>
      <button onClick={() => router.push('/shop')} className="btn-primary mt-6">Back to Shop</button>
    </div>
  );

  const handleAdd = () => {
    if (!selectedSize || !selectedColor) return;
    addItem(product, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button onClick={() => router.push('/shop')} className="flex items-center gap-1 text-sm mb-8" style={{ color: '#888' }}>
        <ChevronLeft size={16} /> Back to Shop
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square overflow-hidden" style={{ background: '#1a1a1a' }}>
            {product.images?.length > 0 ? (
              <Image src={product.images[imgIdx]} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full" style={{ color: '#333' }}>
                <p className="text-6xl font-black">R</p>
              </div>
            )}
            {product.images?.length > 1 && (
              <>
                <button onClick={() => setImgIdx((i) => (i - 1 + product.images.length) % product.images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1" style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => setImgIdx((i) => (i + 1) % product.images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className="relative w-16 h-16 overflow-hidden border-2 transition-colors"
                  style={{ borderColor: i === imgIdx ? '#e63329' : 'transparent', background: '#1a1a1a' }}>
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#e63329' }}>{product.category}</p>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-4">{product.name}</h1>
          <p className="text-3xl font-bold mb-6">${product.price.toFixed(2)}</p>
          <p className="mb-8 leading-relaxed" style={{ color: '#aaa' }}>{product.description}</p>

          {/* Color */}
          {product.colors?.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider mb-3">Color: <span style={{ color: '#e63329' }}>{selectedColor}</span></p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((c) => (
                  <button key={c} onClick={() => setSelectedColor(c)}
                    className="px-4 py-2 text-xs font-bold uppercase border transition-all"
                    style={{
                      borderColor: selectedColor === c ? '#e63329' : '#333',
                      color: selectedColor === c ? '#e63329' : '#888',
                      background: 'transparent',
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {product.sizes?.length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-wider mb-3">Size: <span style={{ color: '#e63329' }}>{selectedSize}</span></p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className="w-12 h-12 text-xs font-bold uppercase border transition-all"
                    style={{
                      borderColor: selectedSize === s ? '#e63329' : '#333',
                      color: selectedSize === s ? '#e63329' : '#888',
                      background: selectedSize === s ? 'rgba(230,51,41,0.1)' : 'transparent',
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="w-full py-4 font-black uppercase tracking-widest text-white flex items-center justify-center gap-3 transition-all"
            style={{
              background: product.stock === 0 ? '#333' : added ? '#22c55e' : '#e63329',
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
            }}>
            <ShoppingCart size={20} />
            {product.stock === 0 ? 'Sold Out' : added ? 'Added to Cart!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
