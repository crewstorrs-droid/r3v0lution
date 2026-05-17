import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { amount, items, customer } = await req.json();

    if (!amount || amount < 50) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    // Create Stripe payment intent
    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { customer_email: customer.email, customer_name: customer.name },
    });

    // Save order to Supabase
    const db = supabaseAdmin();
    const { data: order } = await db.from('orders').insert({
      customer_name: customer.name,
      customer_email: customer.email,
      shipping_address: {
        line1: customer.address,
        city: customer.city,
        state: customer.state,
        postal_code: customer.zip,
        country: customer.country,
      },
      items: items.map((i: { product: { id: string; name: string; price: number }; quantity: number; size: string; color: string }) => ({
        product_id: i.product.id,
        product_name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      })),
      subtotal: items.reduce((s: number, i: { product: { price: number }; quantity: number }) => s + i.product.price * i.quantity, 0),
      shipping: 6.99,
      total: amount / 100,
      status: 'pending',
      stripe_payment_intent: paymentIntent.id,
    }).select().single();

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, orderId: order?.id });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
