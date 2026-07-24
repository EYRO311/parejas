import 'dotenv/config';

function requerida(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}`);
  }
  return valor;
}

export const env = {
  SUPABASE_URL: requerida('SUPABASE_URL'),
  SUPABASE_ANON_KEY: requerida('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: requerida('SUPABASE_SERVICE_ROLE_KEY'),
  PORT: Number(process.env.PORT ?? 4000),
};
