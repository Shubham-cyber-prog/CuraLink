import { getToken, removeToken } from './secure-store';
import { getApiBaseUrl, getHealthCheckUrl } from './api-config';

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

export class NetworkError extends Error {
  targetUrl: string;

  constructor(message: string, targetUrl: string) {
    super(message);
    this.name = 'NetworkError';
    this.targetUrl = targetUrl;
  }
}

// Global network status subscriber system
type NetworkStatusListener = (reachable: boolean, targetUrl: string) => void;
const listeners = new Set<NetworkStatusListener>();
let lastReachableState = true;

export function subscribeNetworkStatus(listener: NetworkStatusListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyNetworkStatus(reachable: boolean, targetUrl: string) {
  lastReachableState = reachable;
  listeners.forEach((fn) => fn(reachable, targetUrl));
}

export async function checkServerHealth(): Promise<boolean> {
  const healthUrl = getHealthCheckUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const isOk = res.ok;
    notifyNetworkStatus(isOk, healthUrl);
    return isOk;
  } catch {
    notifyNetworkStatus(false, healthUrl);
    return false;
  }
}

function getResponseMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object' || !('message' in data)) return undefined;
  const message = data.message;
  return typeof message === 'string' ? message : undefined;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

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
    notifyNetworkStatus(true, url);
  } catch (err: unknown) {
    notifyNetworkStatus(false, url);
    throw new NetworkError(
      `Can't reach server at ${baseUrl}. Ensure backend is running and device is on the same network.`,
      baseUrl
    );
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

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: unknown, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};
