/**
 * Type definitions for the verification extension
 */

export type VerificationStatus =
  | "VERIFIED"
  | "NOT_VERIFIED"
  | "TOO_LARGE"
  | "PENDING"
  | "ERROR";

export type AssetTargetType = "FILE_URL" | "PRODUCT_ID" | "CUSTOM_ATTRIBUTE";

export interface AssetTarget {
  type: AssetTargetType;
  value: string; // URL, SKU, or custom value
  elementSelector: string; // CSS selector to find the element
  elementId?: string; // Optional element ID
}

export interface VerificationResult {
  status: VerificationStatus;
  proof?: {
    hash: string;
    did: string;
    signature: string;
    consensusTimestamp: string;
    organizationName?: string;
  };
  isTrustedIssuer?: boolean;
  message?: string;
}

export interface VerificationRequest {
  documentHash: string;
}
