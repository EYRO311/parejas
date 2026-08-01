import type { Metadata } from 'next';
import { Geist_Mono, Playwrite_NZ_Guides, Playwrite_US_Modern } from 'next/font/google';
import './globals.css';

const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const playwriteTitulos = Playwrite_NZ_Guides({ variable: '--font-playwrite-titulos', weight: '400' });
const playwriteTexto = Playwrite_US_Modern({ variable: '--font-playwrite-texto', weight: 'variable' });

export const metadata: Metadata = {
  title: 'Finanzas en Pareja',
  description: 'Gastos y presupuesto quincenal compartido en pareja',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistMono.variable} ${playwriteTitulos.variable} ${playwriteTexto.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
