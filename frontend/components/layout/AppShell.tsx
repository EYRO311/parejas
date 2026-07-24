'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { IconArrowLeft, IconLogout } from '@tabler/icons-react';

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface AppShellProps {
  titulo: string;
  nav: NavItem[];
  backHref?: string;
  children: ReactNode;
}

/**
 * Layout responsivo compartido: barra inferior de tabs en celular (<500px)
 * y sidebar fijo en monitor (>=500px, prefijo `sm:`). El set de `nav` lo
 * decide cada página (global vs. contextual a un grupo), AppShell solo
 * sabe pintarlo. Estilo minimalista: color plano para el estado activo,
 * sin fondos ni sombras de más — como el resto de la casa (asistente).
 */
export function AppShell({ titulo, nav, backHref, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const cerrarSesion = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const esActivo = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      {/* Sidebar — monitor */}
      <aside className="hidden sm:flex sm:w-56 sm:shrink-0 sm:flex-col sm:border-r sm:border-border-soft sm:p-4">
        <Link href="/grupos" className="mb-6 px-2 font-handwriting text-2xl text-foreground">
          Finanzas en Pareja
        </Link>
        <nav className="flex-1 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                esActivo(item.href) ? 'text-primary' : 'text-muted hover:text-foreground'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={cerrarSesion}
          className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted hover:text-foreground"
        >
          <IconLogout size={20} stroke={1.5} />
          Cerrar sesión
        </button>
      </aside>

      {/* Top bar — celular */}
      <header className="flex items-center justify-between border-b border-border-soft px-4 py-3 sm:hidden">
        {backHref ? (
          <Link href={backHref} aria-label="Volver" className="text-foreground">
            <IconArrowLeft size={20} stroke={1.5} />
          </Link>
        ) : (
          <span className="w-5" />
        )}
        <p className="text-sm font-semibold text-foreground">{titulo}</p>
        <button onClick={cerrarSesion} aria-label="Cerrar sesión" className="text-muted">
          <IconLogout size={18} stroke={1.5} />
        </button>
      </header>

      <main className="flex-1 px-4 py-4 pb-20 sm:px-8 sm:py-6 sm:pb-6">
        <p className="mb-4 hidden font-handwriting text-3xl text-foreground sm:block">{titulo}</p>
        {children}
      </main>

      {/* Tab bar inferior — celular */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border-soft bg-background pb-[env(safe-area-inset-bottom)] sm:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              esActivo(item.href) ? 'text-primary' : 'text-muted'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
