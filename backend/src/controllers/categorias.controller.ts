import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';
import * as CategoriasModel from '../models/categorias.model';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const categorias = await CategoriasModel.listarCategoriasGrupo(req.supabase, req.params.grupoId);
  res.json(categorias);
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, icono, color } = req.body ?? {};
  if (typeof nombre !== 'string' || nombre.trim() === '') {
    throw new HttpError(422, 'nombre es requerido');
  }
  const categoria = await CategoriasModel.crearCategoriaGrupo(
    req.supabase,
    req.params.grupoId,
    nombre.trim(),
    icono,
    color
  );
  res.status(201).json(categoria);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, icono, color } = req.body ?? {};
  const categoria = await CategoriasModel.actualizarCategoria(req.supabase, req.params.categoriaId, {
    nombre,
    icono,
    color,
  });
  res.json(categoria);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  await CategoriasModel.eliminarCategoria(req.supabase, req.params.categoriaId);
  res.status(204).send();
});
