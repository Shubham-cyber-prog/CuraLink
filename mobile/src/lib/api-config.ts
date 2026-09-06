import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Centralized API Configuration for CuraLink Mobile App.
 *
 * Rules:
 * 1. Production (!__DEV__): Always uses EXPO_PUBLIC_API_URL or production domain.
 * 2. Development (__DEV__):
 *    a) First tries runtime auto-detection from Expo hostUri (discovers dev machine LAN IP automatically).
 *    b) Fallback to EXPO_PUBLIC_API_URL environment variable.
 *    c) Fallback to Android emulator loopback (10.0.2.2) if running on Android.
 *    d) Fallback to local default.
 */

const DEFAULT_PORT = '5000';
const DEFAULT_PROD_URL = 'https://api.curalink.com/api';

function extractHostIp(): string | null {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest?.debuggerHost ||
      (Constants as any).experienceUrl;

    if (typeof hostUri === 'string' && hostUri.length > 0) {
      // Clean scheme if present (e.g. exp://10.221.198.237:8081)
      const cleanHost = hostUri.replace(/^[a-z]+:\/\//i, '');
      const ip = cleanHost.split(':')[0]?.trim();
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return ip;
      }
    }
  } catch {
    // Fallback if Constants is unavailable
  }
  return null;
}

export function getApiBaseUrl(): string {
  // 1. Production Mode
  if (!__DEV__) {
    return process.env.EXPO_PUBLIC_API_URL || DEFAULT_PROD_URL;
  }

  // 2. Explicit environment variable check (if set and not localhost/127.0.0.1)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }

  // 3. Dynamic runtime LAN IP Auto-detection from Expo
  const detectedIp = extractHostIp();
  if (detectedIp) {
    return `http://${detectedIp}:${DEFAULT_PORT}/api`;
  }

  // 4. Android Emulator loopback fallback
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_PORT}/api`;
  }

  // 5. iOS Simulator or default fallback
  return envUrl || `http://localhost:${DEFAULT_PORT}/api`;
}

export function getHealthCheckUrl(): string {
  const baseUrl = getApiBaseUrl();
  // Remove /api suffix if present to reach /health
  const serverRoot = baseUrl.replace(/\/api\/?$/, '');
  return `${serverRoot}/health`;
}
