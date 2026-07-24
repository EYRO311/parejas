export type GrupoTipo = 'pareja' | 'familia' | 'roommates';
export type MiembroRol = 'admin' | 'miembro';
export type InvitacionEstado = 'activo' | 'usado' | 'expirado';
export type PresupuestoEstado = 'activo' | 'cerrado';

export interface Grupo {
  id: string;
  nombre: string;
  tipo: GrupoTipo;
  creado_por: string;
  created_at: string;
}

export interface MiembroGrupo {
  id: string;
  grupo_id: string;
  usuario_id: string;
  rol: MiembroRol;
  fecha_union: string;
  activo: boolean;
  usuarios?: { nombre: string; email: string };
}

export interface InvitacionGrupo {
  id: string;
  grupo_id: string;
  codigo: string;
  creado_por: string;
  estado: InvitacionEstado;
  expira_at: string;
  created_at: string;
}

export interface Categoria {
  id: string;
  usuario_id: string | null;
  grupo_id: string | null;
  nombre: string;
  icono: string | null;
  color: string | null;
  created_at: string;
}

export interface Salida {
  id: string;
  grupo_id: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  categoria_id: string | null;
  costo_total: number;
  moneda: string;
  creado_por: string;
  created_at: string;
}

export interface PagoSalida {
  id: string;
  salida_id: string;
  usuario_id: string;
  monto: number;
  banco: string | null;
  captura_url: string | null;
  created_at: string;
}

export interface RepartoSalida {
  id: string;
  salida_id: string;
  usuario_id: string;
  monto_le_corresponde: number;
  liquidado: boolean;
}

export interface PresupuestoQuincenal {
  id: string;
  grupo_id: string;
  quincena_inicio: string;
  quincena_fin: string;
  monto_objetivo_total: number;
  estado: PresupuestoEstado;
  created_at: string;
}

export interface PresupuestoConAportes extends PresupuestoQuincenal {
  aportes_presupuesto: AportePresupuesto[];
}

export interface AportePresupuesto {
  id: string;
  presupuesto_id: string;
  usuario_id: string;
  monto_comprometido: number;
  monto_aportado: number;
}

export interface ApiErrorBody {
  error: string;
}
