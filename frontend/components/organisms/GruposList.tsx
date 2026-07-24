'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { listarGrupos } from '@/services/grupos.service';
import { GrupoCard } from '@/components/molecules/GrupoCard';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Spinner } from '@/components/atoms/Spinner';
import { Alert } from '@/components/atoms/Alert';
import type { Grupo } from '@/lib/types';

export function GruposList() {
  const { accessToken, cargando: cargandoSesion } = useSession();
  const [grupos, setGrupos] = useState<Grupo[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) return;
    listarGrupos(accessToken)
      .then(setGrupos)
      .catch((err: Error) => setError(err.message));
  }, [accessToken]);

  if (cargandoSesion || (!grupos && !error)) {
    return (
      <div className="flex justify-center py-10 text-muted">
        <Spinner />
      </div>
    );
  }

  if (error) return <Alert>{error}</Alert>;

  if (!grupos || grupos.length === 0) {
    return (
      <EmptyState
        titulo="Todavía no tienes grupos"
        descripcion="Crea uno nuevo o únete con el código que te compartieron."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {grupos.map((grupo) => (
        <GrupoCard key={grupo.id} grupo={grupo} />
      ))}
    </div>
  );
}
