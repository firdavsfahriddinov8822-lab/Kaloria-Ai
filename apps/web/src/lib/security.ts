import { storageGet, storageRemove, storageSet } from "./storage";

const SALT = "kaloriya-pin-v1";

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPin(pin: string): Promise<string> {
  return sha256Hex(`${SALT}:${pin}`);
}

export function isPinEnabled(): boolean {
  return !!storageGet<string | undefined>("security:pinHash", undefined);
}

export function setPinHash(hash: string): void {
  storageSet("security:pinHash", hash);
}

export function getPinHash(): string | undefined {
  return storageGet<string | undefined>("security:pinHash", undefined);
}

export function clearPin(): void {
  storageRemove("security:pinHash");
  storageRemove("security:webauthnCredentialId");
}

export function shouldOfferPinSetup(): boolean {
  const asked = storageGet<boolean>("security:pinPromptShown", false);
  return !asked && !isPinEnabled();
}

export function markPinPromptShown(): void {
  storageSet("security:pinPromptShown", true);
}

// Session gating — the app boots locked; unlock() flips this in memory.
let _unlocked = false;
const listeners = new Set<(v: boolean) => void>();

export function isUnlocked(): boolean {
  return _unlocked;
}
export function setUnlocked(v: boolean): void {
  _unlocked = v;
  listeners.forEach((fn) => fn(v));
}
export function subscribeLock(fn: (v: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// WebAuthn (fingerprint / platform biometric)
const WEBAUTHN_ID_KEY = "security:webauthnCredentialId";
const WEBAUTHN_USER_ID_KEY = "security:webauthnUserId";

function toBase64Url(bytes: ArrayBuffer): string {
  const b = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(b).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

export async function isBiometricAvailable(): Promise<boolean> {
  try {
    if (!("credentials" in navigator) || !("PublicKeyCredential" in window)) {
      return false;
    }
    const anyPk = PublicKeyCredential as unknown as {
      isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean>;
    };
    if (typeof anyPk.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
      return await anyPk.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return false;
  } catch {
    return false;
  }
}

export function isBiometricEnabled(): boolean {
  return !!storageGet<string | undefined>(WEBAUTHN_ID_KEY, undefined);
}

export async function enableBiometric(username: string): Promise<boolean> {
  try {
    const userId = crypto.getRandomValues(new Uint8Array(16));
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const cred = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "Kaloriya", id: window.location.hostname },
        user: {
          id: userId,
          name: username || "user@kaloriya",
          displayName: username || "Kaloriya user",
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
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
    if (!cred) return false;
    storageSet(WEBAUTHN_ID_KEY, toBase64Url(cred.rawId));
    storageSet(WEBAUTHN_USER_ID_KEY, toBase64Url(userId.buffer));
    return true;
  } catch {
    return false;
  }
}

export function disableBiometric(): void {
  storageRemove(WEBAUTHN_ID_KEY);
  storageRemove(WEBAUTHN_USER_ID_KEY);
}

export async function verifyBiometric(): Promise<boolean> {
  try {
    const idStr = storageGet<string | undefined>(WEBAUTHN_ID_KEY, undefined);
    if (!idStr) return false;
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const cred = (await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [
          {
            id: fromBase64Url(idStr),
            type: "public-key",
            transports: ["internal"],
          },
        ],
        userVerification: "required",
        timeout: 60000,
      },
    })) as PublicKeyCredential | null;
    return !!cred;
  } catch {
    return false;
  }
}
