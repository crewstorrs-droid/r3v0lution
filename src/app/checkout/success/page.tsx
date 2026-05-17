'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get('order');

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle size={80} style={{ color: '#22c55e' }} />
      </div>
      <h1 className="text-4xl font-black uppercase mb-4">Order Confirmed!</h1>
      <p className="mb-2" style={{ color: '#888' }}>
        Thanks for your purchase. We&apos;ll ship it out within 2-3 business days.
      </p>
      {orderId && (
        <p className="text-sm mt-4 mb-8" style={{ color: '#555' }}>
          Order ID: <span className="font-mono" style={{ color: '#aaa' }}>{orderId}</span>
        </p>
      )}
      <Link href="/shop" className="btn-primary">Keep Shopping</Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
