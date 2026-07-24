export function formatMoney(monto: number, moneda = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: moneda }).format(monto);
}

export function formatFecha(fechaIso: string): string {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatFechaCorta(fechaIso: string): string {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}
