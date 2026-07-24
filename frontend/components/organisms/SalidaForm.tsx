'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/useSession';
import { crearSalida } from '@/services/salidas.service';
import { listarCategorias } from '@/services/categorias.service';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/atoms/Textarea';
import { Alert } from '@/components/atoms/Alert';
import { Card } from '@/components/atoms/Card';
import { FormField } from '@/components/molecules/FormField';
import { ChipGroup } from '@/components/molecules/ChipGroup';
import { hoyISO } from '@/lib/format';
import type { Categoria } from '@/lib/types';

export function SalidaForm({ grupoId }: { grupoId: string }) {
  const router = useRouter();
  const { accessToken } = useSession();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(hoyISO());
  const [categoriaId, setCategoriaId] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) return;
    listarCategorias(accessToken, grupoId).then(setCategorias);
  }, [accessToken, grupoId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setError('');
    setCargando(true);
    try {
      const salida = await crearSalida(accessToken, grupoId, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        fecha,
        categoria_id: categoriaId || null,
      });
      router.push(`/grupos/${grupoId}/salidas/${salida.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la salida');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField label="Título" htmlFor="titulo-salida">
          <Input
            id="titulo-salida"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Cena de aniversario"
          />
        </FormField>

        <FormField label="Descripción (opcional)" htmlFor="descripcion-salida">
          <Textarea
            id="descripcion-salida"
            rows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </FormField>

        <FormField label="Fecha" htmlFor="fecha-salida">
          <Input
            id="fecha-salida"
            type="date"
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </FormField>

        {categorias.length > 0 && (
          <div>
            <p className="mb-1 text-sm font-medium text-foreground">
              Categoría <span className="font-normal text-muted">(opcional)</span>
            </p>
            <ChipGroup
              options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
              value={categoriaId || null}
              onChange={(v) => setCategoriaId(v ?? '')}
              allowClear
            />
          </div>
        )}

        {error && <Alert>{error}</Alert>}

        <Button type="submit" disabled={cargando} className="w-full">
          {cargando ? 'Guardando...' : 'Crear salida'}
        </Button>
      </form>
    </Card>
  );
}
