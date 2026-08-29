import { getToken, removeToken } from './secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export type JsonValue =
  | boolean
  | number
  | string
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: JsonValue;
}

export class ApiError extends Error {
  statusCode: number;
  data: unknown;

  constructor(message: string, statusCode: number, data: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

function getResponseMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object' || !('message' in data)) return undefined;
  const message = data.message;
  return typeof message === 'string' ? message : undefined;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const token = await getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let responseData: unknown = {};
  try {
    responseData = await response.json();
  } catch {
    // Handle empty or non-JSON responses safely
    responseData = { message: 'Failed to parse response' };
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Auto-logout or clear token on 401 Unauthorized
      await removeToken();
    }
    const message = getResponseMessage(responseData) ?? 'API request failed';
    throw new ApiError(message, response.status, responseData);
  }

  return responseData as ApiResponse<T>;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: unknown, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};
