/**
 * Hashing Utility
 * Uses @hiero-did-sdk/crypto for standardized SHA-256 hashing
 */

import { Crypto } from "@hiero-did-sdk/crypto";

/**
 * Hash a string (e.g., product ID/SKU) using SHA-256
 * @param input - String to hash
 * @returns Hex-encoded SHA-256 hash
 */
export function hashString(input: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  return Crypto.sha256(data);
}

/**
 * Hash binary data (e.g., file content) using SHA-256
 * @param data - Uint8Array or ArrayBuffer containing the data
 * @returns Hex-encoded SHA-256 hash
 */
export function hashBinary(data: Uint8Array | ArrayBuffer): string {
  const uint8Array = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  return Crypto.sha256(uint8Array);
}
