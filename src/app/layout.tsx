import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import CartProvider from '@/components/CartProvider';

export const metadata: Metadata = {
  title: 'R3V0LUTION | Street Apparel',
  description: 'Premium street shirts. Built different.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col" style={{ background: '#0a0a0a', color: '#f5f5f5' }}>
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer style={{ background: '#111', borderTop: '1px solid #222' }} className="py-12 mt-16">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-black tracking-widest mb-3" style={{ color: '#e63329' }}>R3V0LUTION</h3>
                <p className="text-sm" style={{ color: '#888' }}>Premium street apparel. Made with purpose.</p>
              </div>
              <div>
                <h4 className="font-bold uppercase tracking-wider mb-3 text-sm">Shop</h4>
                <ul className="space-y-2 text-sm" style={{ color: '#888' }}>
                  <li><a href="/shop" className="hover:text-white transition-colors">All Shirts</a></li>
                  <li><a href="/shop?cat=new" className="hover:text-white transition-colors">New Arrivals</a></li>
                  <li><a href="/shop?cat=sale" className="hover:text-white transition-colors">Sale</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold uppercase tracking-wider mb-3 text-sm">Info</h4>
                <ul className="space-y-2 text-sm" style={{ color: '#888' }}>
                  <li><a href="/shipping" className="hover:text-white transition-colors">Shipping Policy</a></li>
                  <li><a href="/returns" className="hover:text-white transition-colors">Returns</a></li>
                  <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                </ul>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t" style={{ borderColor: '#222' }}>
              <p className="text-xs text-center" style={{ color: '#555' }}>
                © {new Date().getFullYear()} R3V0LUTION. All rights reserved.
              </p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
