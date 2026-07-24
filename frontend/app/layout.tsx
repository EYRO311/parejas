import type { Metadata } from 'next';
import { Geist, Geist_Mono, Caveat } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const caveat = Caveat({ variable: '--font-caveat', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Finanzas en Pareja',
  description: 'Gastos y presupuesto quincenal compartido en pareja',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
