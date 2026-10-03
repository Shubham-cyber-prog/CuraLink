import { getToken, getRefreshToken, saveTokens, removeToken } from './secure-store';
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

// Global session expired subscriber system
type SessionExpiredListener = () => void;
const sessionExpiredListeners = new Set<SessionExpiredListener>();

export function subscribeSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

function notifySessionExpired() {
  sessionExpiredListeners.forEach((fn) => fn());
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

// In-flight refresh token promise mutex to prevent concurrent refresh calls
let activeRefreshPromise: Promise<string | null> | null = null;

async function attemptTokenRefresh(): Promise<string | null> {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    try {
      const storedRefreshToken = await getRefreshToken();
      if (!storedRefreshToken) {
        return null;
      }

      const baseUrl = getApiBaseUrl();
      const refreshUrl = `${baseUrl}/auth/refresh`;

      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Platform': 'mobile',
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      const resData = await response.json();
      const newAccessToken = resData?.data?.accessToken || resData?.data?.token;
      const newRefreshToken = resData?.data?.refreshToken;

      if (newAccessToken) {
        await saveTokens(newAccessToken, newRefreshToken || storedRefreshToken);
        return newAccessToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('X-Client-Platform', 'mobile');

  const token = await getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // 10s request timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
    clearTimeout(timeoutId);
    notifyNetworkStatus(true, url);
  } catch (err: unknown) {
    clearTimeout(timeoutId);
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
    // Check if 401 Unauthorized can be refreshed
    const isAuthEndpoint =
      endpoint.startsWith('/auth/login') ||
      endpoint.startsWith('/auth/register') ||
      endpoint.startsWith('/auth/refresh');

    if (response.status === 401 && !isRetry && !isAuthEndpoint) {
      const refreshedToken = await attemptTokenRefresh();
      if (refreshedToken) {
        // Replay original request once with fresh token
        return request<T>(endpoint, options, true);
      } else {
        // Refresh failed: session definitively expired
        await removeToken();
        notifySessionExpired();
      }
    } else if (response.status === 401 && isAuthEndpoint) {
      await removeToken();
    }

    const message = getResponseMessage(responseData) ?? 'API request failed';
    throw new ApiError(message, response.status, responseData);
  }

  return responseData as ApiResponse<T>;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: unknown = {}, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body ?? {}) }),
  put: <T>(endpoint: string, body: unknown = {}, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body ?? {}) }),
  patch: <T>(endpoint: string, body: unknown = {}, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};

