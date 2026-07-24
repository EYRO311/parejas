import { apiDelete, apiGet, apiPatch, apiPost } from './api';
import type { Categoria } from '@/lib/types';

export function listarCategorias(token: string, grupoId: string) {
  return apiGet<Categoria[]>(`/grupos/${grupoId}/categorias`, token);
}

export function crearCategoria(token: string, grupoId: string, nombre: string, icono?: string, color?: string) {
  return apiPost<Categoria>(`/grupos/${grupoId}/categorias`, token, { nombre, icono, color });
}

export function actualizarCategoria(
  token: string,
  grupoId: string,
  categoriaId: string,
  cambios: Partial<Pick<Categoria, 'nombre' | 'icono' | 'color'>>
) {
  return apiPatch<Categoria>(`/grupos/${grupoId}/categorias/${categoriaId}`, token, cambios);
}

export function eliminarCategoria(token: string, grupoId: string, categoriaId: string) {
  return apiDelete<void>(`/grupos/${grupoId}/categorias/${categoriaId}`, token);
}
