export interface GiftState {
  m: string;
  img?: string;
}

const GIFT_STORAGE_PREFIX = "regalo-flores-gift-";

function toBase64Url(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function fromBase64Url(safe: string): string {
  let b64 = safe.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) b64 += "=";
  return b64;
}

function utoa(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function atou(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeGift(state: GiftState): string {
  const json = JSON.stringify(state);
  return toBase64Url(utoa(json));
}

export function decodeGift(segment: string): GiftState | null {
  try {
    const safe = segment.includes("%") ? decodeURIComponent(segment) : segment;
    const json = atou(fromBase64Url(safe));
    const parsed = JSON.parse(json) as GiftState;
    if (typeof parsed.m !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function decodeStoredGift(segment: string): GiftState | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(`${GIFT_STORAGE_PREFIX}${segment}`);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as GiftState;
    return typeof parsed.m === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function giftUrlFor(state: GiftState): string {
  const base =
    typeof window === "undefined" ? "" : window.location.origin;
  if (typeof window !== "undefined") {
    const token =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    try {
      window.localStorage.setItem(
        `${GIFT_STORAGE_PREFIX}${token}`,
        JSON.stringify(state),
      );
      return `${base}/regalo/${token}`;
    } catch {
      // Fall back to a portable URL if localStorage is unavailable.
    }
  }
  return `${base}/regalo/${encodeGift(state)}`;
}