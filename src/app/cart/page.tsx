'use client';
import { useCart } from '@/store/cart';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const shipping = items.length > 0 ? 6.99 : 0;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-6">🛒</p>
        <h1 className="text-4xl font-black uppercase mb-4">Your Cart is Empty</h1>
        <p className="mb-8" style={{ color: '#888' }}>Time to load it up.</p>
        <Link href="/shop" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black uppercase tracking-tight mb-10">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.product.id}-${item.size}-${item.color}`}
              className="flex gap-4 p-4" style={{ background: '#111', border: '1px solid #222' }}>
              <div className="relative w-24 h-24 flex-shrink-0" style={{ background: '#1a1a1a' }}>
                {item.product.images?.[0] && (
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black uppercase tracking-wide">{item.product.name}</h3>
                    <p className="text-xs mt-1" style={{ color: '#888' }}>
                      Size: {item.size} &nbsp;·&nbsp; Color: {item.color}
                    </p>
                  </div>
                  <button onClick={() => removeItem(item.product.id, item.size, item.color)}
                    className="p-1 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border" style={{ borderColor: '#333' }}>
                    <button onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                      className="px-3 py-1 hover:text-red-500">
                      <Minus size={14} />
                    </button>
                    <span className="px-3 py-1 text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                      className="px-3 py-1 hover:text-red-500">
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="p-6 h-fit" style={{ background: '#111', border: '1px solid #222' }}>
          <h2 className="font-black uppercase text-xl mb-6">Order Summary</h2>
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between">
              <span style={{ color: '#888' }}>Subtotal</span>
              <span>${total().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#888' }}>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-lg" style={{ borderColor: '#333' }}>
              <span>Total</span>
              <span style={{ color: '#e63329' }}>${(total() + shipping).toFixed(2)}</span>
            </div>
          </div>
          <Link href="/checkout" className="btn-primary w-full text-center block">
            Checkout
          </Link>
          <Link href="/shop" className="block text-center text-sm mt-4" style={{ color: '#888' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
