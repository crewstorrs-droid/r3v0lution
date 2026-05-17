import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'R3V0LUTION Admin',
  robots: 'noindex',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '100vh', background: '#080808' }}>{children}</div>;
}
