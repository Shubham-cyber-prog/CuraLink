import { requireOptionalNativeModule } from 'expo';
import { api } from './api';

type ImagePickerModule = typeof import('expo-image-picker');
let cachedPickerModule: ImagePickerModule | null | undefined;

/**
 * Checks whether the ExponentImagePicker native binary is available in the current runtime.
 * Returns false silently in Expo Go when the native library is missing.
 */
export function isNativeImagePickerAvailable(): boolean {
  try {
    const mod = requireOptionalNativeModule('ExponentImagePicker');
    return Boolean(mod);
  } catch {
    return false;
  }
}

/**
 * Lazy loads expo-image-picker safely. Never throws at top-level.
 */
function getSafePicker(): ImagePickerModule | null {
  if (cachedPickerModule !== undefined) return cachedPickerModule;
  if (!isNativeImagePickerAvailable()) {
    cachedPickerModule = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-image-picker') as ImagePickerModule;
    cachedPickerModule = mod;
    return mod;
  } catch {
    cachedPickerModule = null;
    return null;
  }
}

export interface PickResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
  isUnsupportedInExpoGo?: boolean;
}

/**
 * Opens device image library if supported by native binary.
 */
export async function pickFromGallery(): Promise<PickResult> {
  const picker = getSafePicker();
  if (!picker) {
    return {
      success: false,
      isUnsupportedInExpoGo: true,
      error: 'Device gallery access is not compiled into Expo Go. Use our curated clinical avatars or a development build.',
    };
  }

  try {
    const perm = await picker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      return { success: false, error: 'Photo library permission was denied.' };
    }

    const result = await picker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { success: false, error: 'Cancelled' };
    }

    const asset = result.assets[0];
    if (!asset.base64) {
      return { success: false, error: 'Could not read image file data.' };
    }

    const mime = asset.mimeType || 'image/jpeg';
    const dataUrl = `data:${mime};base64,${asset.base64}`;
    return { success: true, dataUrl };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to select image.' };
  }
}

/**
 * Takes a photo with device camera if supported by native binary.
 */
export async function takePhotoWithCamera(): Promise<PickResult> {
  const picker = getSafePicker();
  if (!picker) {
    return {
      success: false,
      isUnsupportedInExpoGo: true,
      error: 'Camera access is not compiled into Expo Go. Use our curated clinical avatars or a development build.',
    };
  }

  try {
    const perm = await picker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') {
      return { success: false, error: 'Camera permission was denied.' };
    }

    const result = await picker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { success: false, error: 'Cancelled' };
    }

    const asset = result.assets[0];
    if (!asset.base64) {
      return { success: false, error: 'Could not read camera capture.' };
    }

    const mime = asset.mimeType || 'image/jpeg';
    const dataUrl = `data:${mime};base64,${asset.base64}`;
    return { success: true, dataUrl };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to capture photo.' };
  }
}

/**
 * Uploads a base64 Data URL avatar directly to CuraLink backend POST /auth/profile/avatar.
 * Validates magic-bytes on backend (JPG, PNG, WebP < 3MB).
 */
export async function uploadAvatarToBackend(dataUrl: string): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
  try {
    const res = await api.post<any>('/auth/profile/avatar', { image: dataUrl });
    if (!res.success) {
      return { success: false, error: res.message || 'Failed to upload avatar' };
    }
    const newUrl = res.data?.avatarUrl || res.data?.user?.avatarUrl;
    return { success: true, avatarUrl: newUrl };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Upload failed' };
  }
}

/**
 * Removes user avatar from backend DELETE /auth/profile/avatar.
 */
export async function deleteAvatarFromBackend(): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.delete<any>('/auth/profile/avatar');
    if (!res.success) {
      return { success: false, error: res.message || 'Failed to remove avatar' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Delete failed' };
  }
}
