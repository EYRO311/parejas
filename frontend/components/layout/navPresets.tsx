import { IconHome, IconReceipt2, IconTags, IconUsers, IconWallet } from '@tabler/icons-react';
import type { NavItem } from './AppShell';

const ICON_PROPS = { size: 20, stroke: 1.5 } as const;

export function navGlobal(): NavItem[] {
  return [{ href: '/grupos', label: 'Grupos', icon: <IconUsers {...ICON_PROPS} /> }];
}

export function navGrupo(grupoId: string): NavItem[] {
  const base = `/grupos/${grupoId}`;
  return [
    { href: base, label: 'Resumen', icon: <IconHome {...ICON_PROPS} /> },
    { href: `${base}/salidas`, label: 'Salidas', icon: <IconReceipt2 {...ICON_PROPS} /> },
    { href: `${base}/presupuesto`, label: 'Presupuesto', icon: <IconWallet {...ICON_PROPS} /> },
    { href: `${base}/categorias`, label: 'Categorías', icon: <IconTags {...ICON_PROPS} /> },
    { href: `${base}/miembros`, label: 'Miembros', icon: <IconUsers {...ICON_PROPS} /> },
  ];
}
