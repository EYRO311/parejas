import { AppShell } from '@/components/layout/AppShell';
import { navGrupo } from '@/components/layout/navPresets';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Input } from '@/components/atoms/Input';
import { Alert } from '@/components/atoms/Alert';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { MoneyText } from '@/components/atoms/MoneyText';
import { Avatar } from '@/components/atoms/Avatar';
import { EmptyState } from '@/components/molecules/EmptyState';
import { FormField } from '@/components/molecules/FormField';

export default function DevPreviewAppShell() {
  return (
    <AppShell titulo="Resumen" nav={navGrupo('demo')} backHref="/grupos">
      <div className="space-y-6">
        <section className="grid gap-3 sm:grid-cols-2">
          <Card className="transition-all hover:border-primary/40 hover:bg-surface active:scale-[0.98]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">01 — 15 ago</p>
              <Badge tone="success">Activo</Badge>
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">
              <MoneyText monto={4200.5} />
            </p>
          </Card>
          <Card>
            <p className="mb-3 text-sm font-medium text-foreground">Aportes por persona</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <Avatar nombre="Emiliano Ruiz" size="sm" />
                <p className="flex-1 text-sm font-medium text-foreground">Emiliano</p>
                <MoneyText monto={1800} className="font-medium" />
              </div>
              <ProgressBar valor={1800} maximo={2000} />
            </div>
          </Card>
        </section>

        <section className="space-y-2">
          <p className="text-sm font-medium text-foreground">Botones</p>
          <div className="flex flex-wrap gap-2">
            <Button>Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Deshabilitado</Button>
          </div>
        </section>

        <section className="space-y-2">
          <p className="text-sm font-medium text-foreground">Form</p>
          <Card>
            <FormField label="Monto comprometido" htmlFor="demo-monto">
              <Input id="demo-monto" type="number" inputMode="decimal" placeholder="0.00" />
            </FormField>
          </Card>
        </section>

        <section className="space-y-2">
          <p className="text-sm font-medium text-foreground">Alertas</p>
          <Alert tone="danger">Correo o contraseña incorrectos</Alert>
          <Alert tone="success">Guardado correctamente</Alert>
        </section>

        <section className="space-y-2">
          <p className="text-sm font-medium text-foreground">Empty state</p>
          <EmptyState titulo="Sin salidas registradas" descripcion="Registra la primera desde la pestaña Salidas." />
        </section>
      </div>
    </AppShell>
  );
}
