import * as LocalAuthentication from 'expo-local-authentication';
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
}

export async function checkBiometricAvailability(): Promise<BiometricAvailability> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    let label = 'Fingerprint';
    if (
      Platform.OS === 'ios' &&
      types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) &&
      !types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
    ) {
      label = 'Face ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      label = 'Fingerprint';
    } else if (types.length > 0) {
      label = 'Biometrics';
    }

    return {
      available: hasHardware && isEnrolled,
      hasHardware,
      isEnrolled,
      label,
    };
  } catch {
    return {
      available: false,
      hasHardware: false,
      isEnrolled: false,
      label: 'Fingerprint',
    };
  }
}

export async function authenticateWithBiometrics(promptMessage = 'Verify your fingerprint to continue'): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
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
