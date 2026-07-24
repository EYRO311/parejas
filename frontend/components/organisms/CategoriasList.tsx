'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useSession } from '@/lib/useSession';
import { crearCategoria, eliminarCategoria, listarCategorias } from '@/services/categorias.service';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Spinner } from '@/components/atoms/Spinner';
import { Alert } from '@/components/atoms/Alert';
import type { Categoria } from '@/lib/types';

export function CategoriasList({ grupoId }: { grupoId: string }) {
  const { accessToken } = useSession();
  const [categorias, setCategorias] = useState<Categoria[] | null>(null);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [creando, setCreando] = useState(false);

  const cargar = () => {
    if (!accessToken) return;
    listarCategorias(accessToken, grupoId)
      .then(setCategorias)
      .catch((err: Error) => setError(err.message));
  };

  useEffect(cargar, [accessToken, grupoId]);

  const handleCrear = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setError('');
    setCreando(true);
    try {
      await crearCategoria(accessToken, grupoId, nombre.trim());
      setNombre('');
      cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la categoría');
    } finally {
      setCreando(false);
    }
  };

  const handleEliminar = async (categoriaId: string) => {
    if (!accessToken) return;
    await eliminarCategoria(accessToken, grupoId, categoriaId);
    cargar();
  };

  return (
    <div className="space-y-4">
      <Card>
        <form onSubmit={handleCrear} className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              required
              placeholder="Ej. Citas, Renta compartida"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={creando}>
            {creando ? 'Creando...' : 'Agregar'}
          </Button>
        </form>
        {error && <Alert className="mt-3">{error}</Alert>}
      </Card>

      {categorias === null ? (
        <div className="flex justify-center py-6 text-muted">
          <Spinner />
        </div>
      ) : categorias.length === 0 ? (
        <EmptyState titulo="Sin categorías propias del grupo todavía" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {categorias.map((c) => (
            <button key={c.id} onClick={() => handleEliminar(c.id)} title="Quitar categoría">
              <Badge tone="accent">{c.nombre} ✕</Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
