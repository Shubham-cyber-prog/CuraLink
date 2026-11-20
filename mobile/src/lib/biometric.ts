import { requireOptionalNativeModule } from 'expo';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

const BIOMETRIC_CRED_KEY = 'curalink_mobile_biometric_cred';

export interface MobileBiometricCred {
  email: string;
  name?: string;
  credentialId: string;
}

export interface BiometricAvailability {
  available: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  label: string;
  nativeModuleAvailable: boolean;
}

type LocalAuthModule = typeof import('expo-local-authentication');

let cachedLocalAuth: LocalAuthModule | null | undefined;

/**
 * Safely lazy-loads expo-local-authentication so the app NEVER crashes in Expo Go
 * or an older Dev Client APK that doesn't yet include the native ExpoLocalAuthentication module.
 */
function getLocalAuth(): LocalAuthModule | null {
  if (cachedLocalAuth !== undefined) {
    return cachedLocalAuth;
  }
  // Check silently via requireOptionalNativeModule BEFORE requiring expo-local-authentication
  // so Expo never throws or triggers a red LogBox error when the native binary lacks the module.
  const nativeModule = requireOptionalNativeModule('ExpoLocalAuthentication');
  if (!nativeModule) {
    cachedLocalAuth = null;
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-local-authentication') as LocalAuthModule;
    if (mod && typeof mod.hasHardwareAsync === 'function') {
      cachedLocalAuth = mod;
      return mod;
    }
    cachedLocalAuth = null;
    return null;
  } catch {
    cachedLocalAuth = null;
    return null;
  }
}

export async function checkBiometricAvailability(): Promise<BiometricAvailability> {
  const LocalAuth = getLocalAuth();
  if (!LocalAuth) {
    return {
      available: false,
      hasHardware: false,
      isEnrolled: false,
      label: 'Fingerprint',
      nativeModuleAvailable: false,
    };
  }

  try {
    const hasHardware = await LocalAuth.hasHardwareAsync();
    const isEnrolled = await LocalAuth.isEnrolledAsync();
    const types = await LocalAuth.supportedAuthenticationTypesAsync();

    let label = 'Fingerprint';
    if (
      Platform.OS === 'ios' &&
      types.includes(LocalAuth.AuthenticationType.FACIAL_RECOGNITION) &&
      !types.includes(LocalAuth.AuthenticationType.FINGERPRINT)
    ) {
      label = 'Face ID';
    } else if (types.includes(LocalAuth.AuthenticationType.FINGERPRINT)) {
      label = 'Fingerprint';
    } else if (types.length > 0) {
      label = 'Biometrics';
    }

    return {
      available: hasHardware && isEnrolled,
      hasHardware,
      isEnrolled,
      label,
      nativeModuleAvailable: true,
    };
  } catch {
    return {
      available: false,
      hasHardware: false,
      isEnrolled: false,
      label: 'Fingerprint',
      nativeModuleAvailable: false,
    };
  }
}

export async function authenticateWithBiometrics(promptMessage = 'Verify your fingerprint to continue'): Promise<{
  success: boolean;
  error?: string;
}> {
  const LocalAuth = getLocalAuth();
  if (!LocalAuth) {
    return {
      success: false,
      error: 'Fingerprint native module requires a fresh Android/iOS build (npx expo run:android or eas build).',
    };
  }

  try {
    const result = await LocalAuth.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use Passcode',
      disableDeviceFallback: false,
    });

    if (result.success) {
      return { success: true };
    }
    return {
      success: false,
      error: result.error === 'user_cancel' ? 'Cancelled by user' : 'Fingerprint verification failed',
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Biometric authentication error',
    };
  }
}

export function generateBiometricCredentialId(): string {
  return `mobile-bio-${Crypto.randomUUID()}`;
}

export async function saveBiometricCredentials(cred: MobileBiometricCred): Promise<void> {
  await SecureStore.setItemAsync(BIOMETRIC_CRED_KEY, JSON.stringify(cred));
}

export async function getBiometricCredentials(): Promise<MobileBiometricCred | null> {
  try {
    const raw = await SecureStore.getItemAsync(BIOMETRIC_CRED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.email && parsed?.credentialId) {
      return parsed as MobileBiometricCred;
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearBiometricCredentials(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_CRED_KEY);
  } catch {
    // Ignore delete error
  }
}
