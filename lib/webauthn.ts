"use client";

export interface StoredBiometricCredential {
  email: string;
  name?: string;
  credentialId: string;
  rawId: string;
  enrolledAt: string;
}

const STORAGE_KEY = "curalink_biometric_cred";

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(base64Url: string): Uint8Array {
  const padded = base64Url.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (base64Url.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function isPlatformBiometricSupported(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential || !navigator.credentials) {
    return false;
  }
  try {
    if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch {
    return false;
  }
}

export function getStoredBiometric(): StoredBiometricCredential | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.email && parsed?.credentialId && parsed?.rawId) {
      return parsed as StoredBiometricCredential;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveStoredBiometric(cred: StoredBiometricCredential): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cred));
}

export function clearStoredBiometric(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Triggers the device's real native Fingerprint / Face ID / Windows Hello enrollment prompt via WebAuthn.
 */
export async function enrollPlatformBiometric(user: {
  id: string;
  email: string;
  name: string;
}): Promise<{ credentialId: string; rawId: string }> {
  if (typeof window === "undefined" || !window.PublicKeyCredential || !navigator.credentials) {
    throw new Error("Biometric passkeys are not supported in this browser. Open CuraLink in Chrome, Safari, or Edge.");
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);
  const userIdBytes = new TextEncoder().encode(user.id);

  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: {
        name: "CuraLink Healthcare",
        id: window.location.hostname === "localhost" ? "localhost" : window.location.hostname,
      },
      user: {
        id: userIdBytes,
        name: user.email,
        displayName: user.name || user.email,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error("Fingerprint registration was cancelled.");
  }

  const rawId = bytesToBase64Url(new Uint8Array(credential.rawId));
  const credentialId = credential.id || rawId;
  return { credentialId, rawId };
}

/**
 * Triggers the device's real native Fingerprint / Face ID / Windows Hello verification prompt.
 */
export async function verifyPlatformBiometric(rawIdBase64Url: string): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential || !navigator.credentials) {
    throw new Error("Biometric authentication is not supported in this browser.");
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);
  const allowId = base64UrlToBytes(rawIdBase64Url);

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      rpId: window.location.hostname === "localhost" ? "localhost" : window.location.hostname,
      allowCredentials: [
        {
          id: allowId as unknown as BufferSource,
          type: "public-key",
          transports: ["internal"],
        },
      ],
      userVerification: "required",
      timeout: 60000,
    },
  });

  return Boolean(assertion);
}
