const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string) => apiClient<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
