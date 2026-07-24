export interface CeldaCalendario {
  dia: number | null;
  iso: string | null;
}

/** Cuadrícula de un mes (semana empieza en domingo), con huecos null para completar la primera semana. */
export function obtenerCeldasMes(anio: number, mesIndex0: number): CeldaCalendario[] {
  const primerDia = new Date(anio, mesIndex0, 1);
  const diasEnMes = new Date(anio, mesIndex0 + 1, 0).getDate();
  const offset = primerDia.getDay();

  const celdas: CeldaCalendario[] = [];
  for (let i = 0; i < offset; i++) celdas.push({ dia: null, iso: null });
  for (let d = 1; d <= diasEnMes; d++) {
    const iso = `${anio}-${String(mesIndex0 + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    celdas.push({ dia: d, iso });
  }
  return celdas;
}

export function nombreMes(anio: number, mesIndex0: number): string {
  const texto = new Date(anio, mesIndex0, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
