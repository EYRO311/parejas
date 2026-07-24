import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Evita que Next confunda el package-lock.json de EYRO/ (monorepo casero
  // de otros proyectos) con la raíz de este workspace.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
