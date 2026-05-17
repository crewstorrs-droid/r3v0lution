'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/cart';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Link from 'next/link';
import { Lock } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CARD_STYLE = {
  style: {
    base: {
      color: '#f5f5f5',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      '::placeholder': { color: '#555' },
    },
    invalid: { color: '#e63329' },
  },
};

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [form, setForm] = useState({
    name: '', email: '',
    address: '', city: '', state: '', zip: '', country: 'US',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shipping = 6.99;
  const orderTotal = total() + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(orderTotal * 100),
          items,
          customer: form,
        }),
      });
      const { clientSecret, orderId, error: apiErr } = await res.json();
      if (apiErr) { setError(apiErr); setLoading(false); return; }

      // Confirm payment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const card = elements.getElement(CardElement) as any;
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: form.name,
            email: form.email,
            address: {
              line1: form.address,
              city: form.city,
              state: form.state,
              postal_code: form.zip,
              country: form.country,
            },
          },
        },
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/checkout/success?order=${orderId}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-2xl font-black mb-4">Your cart is empty</p>
        <Link href="/shop" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-12">
      {/* Left: form fields */}
      <div>
        <h2 className="text-xl font-black uppercase mb-6">Contact & Shipping</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" className="w-full" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" className="w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1">Street Address</label>
            <input name="address" value={form.address} onChange={handleChange} required placeholder="123 Main St" className="w-full" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">City</label>
              <input name="city" value={form.city} onChange={handleChange} required placeholder="City" className="w-full" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">State</label>
              <input name="state" value={form.state} onChange={handleChange} required placeholder="TX" className="w-full" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">ZIP</label>
              <input name="zip" value={form.zip} onChange={handleChange} required placeholder="12345" className="w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1">Country</label>
            <select name="country" value={form.country} onChange={handleChange} className="w-full" style={{ background: '#1a1a1a', color: '#f5f5f5', border: '1px solid #333', padding: '0.75rem' }}>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
          </div>
        </div>

        <h2 className="text-xl font-black uppercase mt-10 mb-6">Payment</h2>
        <div className="p-4" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <div className="flex items-center gap-2 mb-4 text-xs" style={{ color: '#888' }}>
            <Lock size={12} />
            <span>Secured by Stripe — we never store your card details</span>
          </div>
          <CardElement options={CARD_STYLE} />
        </div>

        {error && (
          <p className="mt-4 text-sm font-bold" style={{ color: '#e63329' }}>{error}</p>
        )}
      </div>

      {/* Right: order summary */}
      <div>
        <h2 className="text-xl font-black uppercase mb-6">Order Summary</h2>
        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <div key={`${item.product.id}-${item.size}-${item.color}`}
              className="flex justify-between text-sm py-2 border-b" style={{ borderColor: '#222' }}>
              <div>
                <p className="font-bold">{item.product.name} × {item.quantity}</p>
                <p style={{ color: '#888' }}>{item.size} / {item.color}</p>
              </div>
              <span>${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span style={{ color: '#888' }}>Subtotal</span><span>${total().toFixed(2)}</span></div>
          <div className="flex justify-between"><span style={{ color: '#888' }}>Shipping</span><span>${shipping.toFixed(2)}</span></div>
          <div className="flex justify-between font-black text-xl pt-3 border-t" style={{ borderColor: '#333' }}>
            <span>Total</span><span style={{ color: '#e63329' }}>${orderTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !stripe}
          className="w-full mt-8 py-4 font-black uppercase tracking-widest text-white transition-all"
          style={{ background: loading ? '#333' : '#e63329', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Processing...' : `Pay $${orderTotal.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black uppercase tracking-tight mb-10">Checkout</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}
