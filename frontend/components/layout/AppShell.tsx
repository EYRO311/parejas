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
      <aside className="hidden sm:flex sm:w-60 sm:shrink-0 sm:flex-col sm:border-r sm:border-border-soft/70 sm:p-4">
        <Link href="/grupos" className="mb-6 flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white shadow-md shadow-primary/30">
            FP
          </span>
          <span className="font-handwriting text-2xl leading-none text-foreground">Finanzas en Pareja</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {nav.map((item) => {
            const activo = esActivo(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activo
                    ? 'bg-primary/15 text-primary ring-1 ring-inset ring-primary/20'
                    : 'text-muted hover:bg-surface/60 hover:text-foreground'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={cerrarSesion}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface/60 hover:text-foreground"
        >
          <IconLogout size={20} stroke={1.5} />
          Cerrar sesión
        </button>
      </aside>

      {/* Top bar — celular */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border-soft/70 bg-background/80 px-4 py-3 backdrop-blur-md pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:hidden">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Volver"
            className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-foreground active:bg-surface"
          >
            <IconArrowLeft size={20} stroke={1.5} />
          </Link>
        ) : (
          <span className="w-9" />
        )}
        <p className="text-sm font-semibold text-foreground">{titulo}</p>
        <button
          onClick={cerrarSesion}
          aria-label="Cerrar sesión"
          className="-mr-2 flex h-9 w-9 items-center justify-center rounded-full text-muted active:bg-surface"
        >
          <IconLogout size={18} stroke={1.5} />
        </button>
      </header>

      <main className="flex-1 px-4 py-4 pb-24 sm:px-8 sm:py-6 sm:pb-6">
        <p className="mb-5 hidden font-handwriting text-3xl text-foreground sm:block">{titulo}</p>
        {children}
      </main>

      {/* Tab bar inferior — celular */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border-soft/70 bg-background/85 backdrop-blur-md pb-[env(safe-area-inset-bottom)] sm:hidden">
        {nav.map((item) => {
          const activo = esActivo(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-muted transition-colors active:opacity-70"
            >
              <span
                className={`flex items-center justify-center rounded-full px-3.5 py-1 transition-colors ${
                  activo ? 'bg-primary/20 text-primary' : ''
                }`}
              >
                {item.icon}
              </span>
              <span className={activo ? 'text-primary' : ''}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
