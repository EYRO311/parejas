import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { verificarPertenenciaGrupo } from '../utils/verificarPertenencia';
import * as SalidasModel from '../models/salidas.model';
import * as PagosModel from '../models/pagos.model';
import * as MiembrosModel from '../models/miembros.model';

interface SalidaDeGasto {
  salidaId: string;
  titulo: string;
  fecha: string;
  monto: number;
}

interface GastoPorUsuario {
  usuarioId: string;
  nombre: string;
  total: number;
  salidas: SalidaDeGasto[];
}

/**
 * Cuánto ha pagado cada miembro del grupo y en qué salidas, para el
 * dashboard de gastos. Incluye a todos los miembros aunque no hayan
 * pagado nada (total: 0), no solo a quienes aparecen en pagos_salida.
 */
export const gastosPorUsuario = asyncHandler(async (req: Request, res: Response) => {
  const { grupoId } = req.params;
  await verificarPertenenciaGrupo(req.supabase, req.usuario.id, grupoId);

  const [miembros, salidas, pagos] = await Promise.all([
    MiembrosModel.listarMiembros(req.supabase, grupoId),
    SalidasModel.listarSalidas(req.supabase, grupoId, {}),
    PagosModel.listarPagosDeGrupo(req.supabase, grupoId),
  ]);

  const salidaPorId = new Map(salidas.map((s) => [s.id, s]));

  const acumulado = new Map<string, { nombre: string; total: number; salidas: Map<string, SalidaDeGasto> }>();

  for (const miembro of miembros) {
    acumulado.set(miembro.usuario_id, {
      nombre: miembro.usuarios?.nombre ?? 'Sin nombre',
      total: 0,
      salidas: new Map(),
    });
  }

  for (const pago of pagos) {
    const salida = salidaPorId.get(pago.salida_id);
    if (!salida) continue;

    let entrada = acumulado.get(pago.usuario_id);
    if (!entrada) {
      entrada = { nombre: pago.usuarios?.nombre ?? 'Sin nombre', total: 0, salidas: new Map() };
      acumulado.set(pago.usuario_id, entrada);
    }

    entrada.total += Number(pago.monto);

    const salidaAcumulada = entrada.salidas.get(salida.id);
    if (salidaAcumulada) {
      salidaAcumulada.monto += Number(pago.monto);
    } else {
      entrada.salidas.set(salida.id, {
        salidaId: salida.id,
        titulo: salida.titulo,
        fecha: salida.fecha,
        monto: Number(pago.monto),
      });
    }
  }

  const resultado: GastoPorUsuario[] = Array.from(acumulado.entries())
    .map(([usuarioId, entrada]) => ({
      usuarioId,
      nombre: entrada.nombre,
      total: entrada.total,
      salidas: Array.from(entrada.salidas.values()).sort((a, b) => (a.fecha < b.fecha ? 1 : -1)),
    }))
    .sort((a, b) => b.total - a.total);

  res.json(resultado);
});
