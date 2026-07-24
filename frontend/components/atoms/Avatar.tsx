interface AvatarProps {
  nombre: string;
  size?: 'sm' | 'md';
}

const SIZES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-11 h-11 text-sm',
};

function iniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ nombre, size = 'md' }: AvatarProps) {
  return (
    <div
      className={`${SIZES[size]} shrink-0 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center`}
    >
      {iniciales(nombre) || '?'}
    </div>
  );
}
