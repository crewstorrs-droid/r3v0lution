'use client';
import Link from 'next/link';
import { useCart } from '@/store/cart';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const count = useCart((s) => s.count());
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ background: '#0a0a0a', borderBottom: '1px solid #1a1a1a' }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="text-2xl font-black tracking-widest" style={{ color: '#e63329', letterSpacing: '0.15em' }}>
          R3V0LUTION
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/shop" className="text-sm font-bold uppercase tracking-wider hover:text-red-500 transition-colors">Shop</Link>
          <Link href="/shop?cat=new" className="text-sm font-bold uppercase tracking-wider hover:text-red-500 transition-colors">New</Link>
          <Link href="/shop?cat=sale" className="text-sm font-bold uppercase tracking-wider hover:text-red-500 transition-colors">Sale</Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-2">
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full" style={{ background: '#e63329', fontSize: '10px' }}>
                {count}
              </span>
            )}
          </Link>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: '#111', borderBottom: '1px solid #222' }} className="md:hidden px-4 pb-4">
          <div className="flex flex-col gap-4 pt-4">
            <Link href="/shop" onClick={() => setOpen(false)} className="text-sm font-bold uppercase tracking-wider">Shop All</Link>
            <Link href="/shop?cat=new" onClick={() => setOpen(false)} className="text-sm font-bold uppercase tracking-wider">New Arrivals</Link>
            <Link href="/shop?cat=sale" onClick={() => setOpen(false)} className="text-sm font-bold uppercase tracking-wider">Sale</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
