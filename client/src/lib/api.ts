import type { Philosopher, Theme, Quote, ApiResponse, PaginatedResponse } from './types';

export type { Philosopher, Theme, Quote, ApiResponse, PaginatedResponse };

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.error || `API error ${res.status}`);
  }

  return res.json();
}

export const apiClient = {
  getRandomQuote: (theme?: Theme, philosopherId?: string) => {
    const params = new URLSearchParams();
    if (theme) params.append('theme', theme);
    if (philosopherId) params.append('philosopherId', philosopherId);
    const query = params.toString();
    return api<ApiResponse<Quote>>(`/quotes/random${query ? `?${query}` : ''}`);
  },

  getQuotes: (page = 1, limit = 10, theme?: Theme, philosopherId?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (theme) params.append('theme', theme);
    if (philosopherId) params.append('philosopherId', philosopherId);
    return api<PaginatedResponse<Quote>>(`/quotes?${params.toString()}`);
  },

  getQuoteById: (id: string) => {
    return api<ApiResponse<Quote>>(`/quotes/${id}`);
  },

  getThemes: () => {
    return api<ApiResponse<string[]>>('/quotes/themes');
  },

  getQuotesByTheme: (theme: Theme, page = 1, limit = 10) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return api<PaginatedResponse<Quote>>(`/quotes/theme/${theme}?${params.toString()}`);
  },

  getPhilosophers: (school?: string) => {
    const params = school ? `?school=${encodeURIComponent(school)}` : '';
    return api<ApiResponse<Philosopher[]>>(`/philosophers${params}`);
  },

  getPhilosopherById: (id: string) => {
    return api<ApiResponse<Philosopher & { quoteCount: number }>>(`/philosophers/${id}`);
  },
};
