import type { NextFunction, Request, Response } from 'express';
import { obtenerClienteUsuario } from '../config/supabaseClient';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Falta token de autenticación' });
  }

  const accessToken = header.slice('Bearer '.length);
  const supabase = obtenerClienteUsuario(accessToken);
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  req.usuario = { id: data.user.id, email: data.user.email ?? '' };
  req.supabase = supabase;
  req.accessToken = accessToken;
  next();
}
