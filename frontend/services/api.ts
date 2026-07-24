import type { ApiErrorBody } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Opciones extends Omit<RequestInit, 'body'> {
  accessToken: string;
  body?: unknown;
}

async function apiFetch<T>(path: string, { accessToken, headers, body, ...init }: Opciones): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const responseBody = await res.json().catch(() => null);

  if (!res.ok) {
    const mensaje = (responseBody as ApiErrorBody | null)?.error ?? 'Error del servidor';
    throw new Error(mensaje);
  }

  return responseBody as T;
}

export function apiGet<T>(path: string, accessToken: string): Promise<T> {
  return apiFetch<T>(path, { accessToken, method: 'GET' });
}

export function apiPost<T>(path: string, accessToken: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, { accessToken, method: 'POST', body });
}

export function apiPatch<T>(path: string, accessToken: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, { accessToken, method: 'PATCH', body });
}

export function apiPut<T>(path: string, accessToken: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, { accessToken, method: 'PUT', body });
}

export function apiDelete<T>(path: string, accessToken: string): Promise<T> {
  return apiFetch<T>(path, { accessToken, method: 'DELETE' });
}
