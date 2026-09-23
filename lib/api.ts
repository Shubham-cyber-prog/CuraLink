/**
 * Shared API Client for CuraLink Web Application
 * Handles authentication headers, CSRF token acquisition/double-submit cookie synchronization,
 * credentials: "include", and standardized error handling.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

let cachedCsrfToken: string | null = null;

export async function getCsrfToken(forceFresh = false): Promise<string> {
  if (!forceFresh) {
    if (cachedCsrfToken) return cachedCsrfToken;
    const existingCookie = getCookie("curalink_csrf");
    if (existingCookie) {
      cachedCsrfToken = existingCookie;
      return existingCookie;
    }
  }

  // Fetch fresh token from endpoint with credentials: "include" so browser saves the cookie
  try {
    const res = await fetch(`${API_BASE}/auth/csrf-token`, {
      method: "GET",
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        cachedCsrfToken = data.token;
        if (typeof document !== "undefined") {
          try {
            document.cookie = `curalink_csrf=${data.token}; path=/; SameSite=Lax`;
          } catch {}
        }
        return data.token;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch CSRF token:", err);
  }

  return cachedCsrfToken || "";
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  _isRetry?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  let url = `${API_BASE}${cleanEndpoint}`;

  if (options.params) {
    const query = new URLSearchParams();
    Object.entries(options.params).forEach(([k, v]) => {
      if (v !== undefined) query.append(k, String(v));
    });
    const qs = query.toString();
    if (qs) url += `?${qs}`;
  }

  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Attach Bearer token from localStorage/sessionStorage if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("curalink_token") || sessionStorage.getItem("curalink_token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Double-submit CSRF protection for mutating requests
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    let csrfToken = headers.get("X-CSRF-Token");
    if (!csrfToken) {
      csrfToken = await getCsrfToken();
      if (csrfToken) {
        headers.set("X-CSRF-Token", csrfToken);
      }
    }
  }

  const response = await fetch(url, {
    ...options,
    method,
    headers,
    credentials: "include", // CRITICAL: Always include credentials for cookies across origins
  });

  let data: any;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = { success: response.ok, message: await response.text() };
  }

  // Auto-retry once on CSRF mismatch/expiry
  if (response.status === 403 && typeof data?.message === "string" && data.message.toLowerCase().includes("csrf") && !options._isRetry) {
    const freshToken = await getCsrfToken(true);
    if (freshToken) {
      headers.set("X-CSRF-Token", freshToken);
      return request<T>(endpoint, {
        ...options,
        headers,
        _isRetry: true,
      });
    }
  }

  if (!response.ok) {
    const errorMsg = data?.message || `HTTP ${response.status}: Request failed`;
    const error: any = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),
  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};

export default api;
