/**
 * Service Worker (Background Script)
 * Handles verification requests from content scripts
 */

import {
  AssetTarget,
  VerificationResult,
  VerificationRequest,
  VerificationStatus,
} from "../utils/types";
import { hashString, hashBinary } from "../utils/hash";

// DTRUST verification API URL
const DTRUST_VERIFY_URL = "http://localhost:3001/api/v1/verify";

// Maximum file size to download and hash (20MB)
const MAX_FILE_SIZE = 20 * 1024 * 1024;

/**
 * Verify a hash against the DTRUST API
 */
async function verifyHash(hash: string): Promise<VerificationResult> {
  try {
    const response = await fetch(DTRUST_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentHash: hash,
      } as VerificationRequest),
    });

    if (!response.ok) {
      return {
        status: "ERROR",
        message: `API error: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.status === "VERIFIED_ON_CHAIN") {
      return {
        status: "VERIFIED",
        proof: data.proof,
        isTrustedIssuer: data.isTrustedIssuer || false,
        message: data.message,
      };
    } else {
      return {
        status: "NOT_VERIFIED",
        message: data.message || "Document not verified",
      };
    }
  } catch (error) {
    console.error("[DTRUST] Verification error:", error);
    return {
      status: "ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check file size via HEAD request
 */
async function checkFileSize(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      mode: "no-cors", // Allow cross-origin HEAD requests
    });

    // Note: CORS may prevent reading Content-Length header
    // In that case, we'll try to download and check size as we go
    const contentLength = response.headers.get("Content-Length");
    return contentLength ? parseInt(contentLength, 10) : null;
  } catch (error) {
    console.warn("[DTRUST] Could not check file size via HEAD:", error);
    return null;
  }
}

/**
 * Download and hash a file
 */
async function downloadAndHashFile(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // Check Content-Length header
    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > MAX_FILE_SIZE) {
        return null; // File too large
      }
    }

    // Download file in chunks to check size
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const chunks: Uint8Array[] = [];
    let totalSize = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      totalSize += value.length;

      // Check size as we download
      if (totalSize > MAX_FILE_SIZE) {
        return null; // File too large
      }

      chunks.push(value);
    }

    // Combine chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    // Hash the file
    return hashBinary(combined);
  } catch (error) {
    console.error("[DTRUST] Error downloading file:", error);
    return null;
  }
}

/**
 * Process a single asset target
 */
async function processTarget(
  target: AssetTarget
): Promise<{ selector: string; status: VerificationStatus }> {
  let hash: string | null = null;
  let status: VerificationStatus = "PENDING";

  try {
    if (target.type === "PRODUCT_ID" || target.type === "CUSTOM_ATTRIBUTE") {
      // Hash the string directly
      hash = hashString(target.value);
      status = "PENDING";
    } else if (target.type === "FILE_URL") {
      // Check file size first
      const fileSize = await checkFileSize(target.value);

      if (fileSize !== null && fileSize > MAX_FILE_SIZE) {
        return {
          selector: target.elementSelector,
          status: "TOO_LARGE",
        };
      }

      // Download and hash the file
      hash = await downloadAndHashFile(target.value);

      if (hash === null) {
        return {
          selector: target.elementSelector,
          status: "TOO_LARGE",
        };
      }

      status = "PENDING";
    }

    if (!hash) {
      return {
        selector: target.elementSelector,
        status: "ERROR",
      };
    }

    // Verify the hash
    const result = await verifyHash(hash);

    return {
      selector: target.elementSelector,
      status: result.status,
    };
  } catch (error) {
    console.error("[DTRUST] Error processing target:", error);
    return {
      selector: target.elementSelector,
      status: "ERROR",
    };
  }
}

/**
 * Message listener for verification requests
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "VERIFY_TARGETS") {
    const targets: AssetTarget[] = message.targets;

    console.log(`[DTRUST] Processing ${targets.length} targets...`);

    // Process all targets in parallel
    Promise.all(targets.map(processTarget))
      .then((results) => {
        // Send results back to content script
        results.forEach((result) => {
          chrome.tabs
            .sendMessage(sender.tab?.id || 0, {
              type: "VERIFICATION_RESULT",
              selector: result.selector,
              status: result.status,
            })
            .catch((error) => {
              console.error(
                "[DTRUST] Error sending result to content script:",
                error
              );
            });
        });

        sendResponse({ success: true, results });
      })
      .catch((error) => {
        console.error("[DTRUST] Error processing targets:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep message channel open for async response
  }

  return false;
});

console.log("[DTRUST] Service worker initialized");
