import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'curalink_jwt_token';
const REFRESH_TOKEN_KEY = 'curalink_refresh_token';

/**
 * Save the JWT access token securely
 */
export async function saveToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving access token:', error);
  }
}

/**
 * Save the JWT refresh token securely
 */
export async function saveRefreshToken(refreshToken: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error saving refresh token:', error);
  }
}

/**
 * Convenience helper to save both tokens together
 */
export async function saveTokens(accessToken: string, refreshToken?: string): Promise<void> {
  await saveToken(accessToken);
  if (refreshToken) {
    await saveRefreshToken(refreshToken);
  }
}

/**
 * Retrieve the stored JWT access token
 */
export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

/**
 * Retrieve the stored JWT refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
}

/**
 * Remove all stored authentication tokens (for logout / token expiration)
 */
export async function removeToken(): Promise<void> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => null),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => null),
    ]);
  } catch (error) {
    console.error('Error removing tokens:', error);
  }
}

export const removeTokens = removeToken;
