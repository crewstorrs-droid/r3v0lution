import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';

export default function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0] || '/placeholder-shirt.jpg';
  return (
    <Link href={`/shop/${product.id}`} className="group block">
      <div className="relative overflow-hidden aspect-square" style={{ background: '#1a1a1a' }}>
        <Image
          src={img}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <span className="text-white font-bold uppercase tracking-widest text-sm">Sold Out</span>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-bold uppercase tracking-wide text-sm group-hover:text-red-500 transition-colors">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {product.colors?.slice(0, 4).map((c) => (
            <span key={c} className="text-xs" style={{ color: '#888' }}>{c}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
