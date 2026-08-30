import { getToken, removeToken } from './secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

// ── Shared types ─────────────────────────────────────────────────────────────

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

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
}

export interface AuthTokenResponse {
  token: string;
  user: AuthUser;
}

// ── Error class ───────────────────────────────────────────────────────────────

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

// ── Internal helpers ──────────────────────────────────────────────────────────

function getResponseMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object' || !('message' in data)) return undefined;
  const message = (data as Record<string, unknown>).message;
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

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message.includes('Network request failed') || err.message.includes('Failed to fetch') || err.message.includes('ECONNREFUSED'))) {
      throw new Error(
        "Can't reach the server. Make sure your backend is running and EXPO_PUBLIC_API_URL in .env points to your machine's local IP, not localhost."
      );
    }
    throw err;
  }

  let responseData: unknown = {};
  try {
    responseData = await response.json();
  } catch {
    responseData = { message: 'Failed to parse response' };
  }

  if (!response.ok) {
    if (response.status === 401) {
      await removeToken();
    }
    const message = getResponseMessage(responseData) ?? 'API request failed';
    throw new ApiError(message, response.status, responseData);
  }

  return responseData as ApiResponse<T>;
}

// ── Generic HTTP methods ──────────────────────────────────────────────────────

export const api = {
  get:    <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post:   <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put:    <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

// ── Named auth functions ──────────────────────────────────────────────────────

/**
 * POST /auth/login — authenticates with email + password, returns token + user.
 */
export async function login(
  email: string,
  password: string,
): Promise<ApiResponse<AuthTokenResponse>> {
  return api.post<AuthTokenResponse>('/auth/login', { email, password });
}

/**
 * POST /auth/register — creates account, returns token + user.
 */
export async function register(
  name: string,
  email: string,
  password: string,
  role: 'PATIENT' | 'DOCTOR' = 'PATIENT',
): Promise<ApiResponse<AuthTokenResponse>> {
  return api.post<AuthTokenResponse>('/auth/register', { name, email, password, role });
}

/**
 * POST /auth/logout — server-side session invalidation (best-effort; token
 * is always cleared from SecureStore regardless of response).
 */
export async function logout(): Promise<void> {
  try {
    await api.post<unknown>('/auth/logout', {});
  } catch {
    // Silently swallow — local token removal is the authoritative action.
  } finally {
    await removeToken();
  }
}

/**
 * GET /auth/me — validates token and returns the current user profile.
 */
export async function getCurrentUser(): Promise<ApiResponse<{ user: AuthUser }>> {
  return api.get<{ user: AuthUser }>('/auth/me');
}
