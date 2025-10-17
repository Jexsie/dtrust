/**
 * File Hashing Utility
 *
 * Uses the Web Crypto API (SubtleCrypto) to calculate SHA-256 hashes
 * of files entirely in the browser. Files are never sent to the server.
 */

/**
 * Calculate the SHA-256 hash of a file
 * @param file - The file to hash
 * @returns Promise resolving to the hex-encoded hash string
 */
export async function hashFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;

        // Use SubtleCrypto to calculate SHA-256 hash
        const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

        // Convert ArrayBuffer to hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        resolve(hashHex);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    // Read the file as an ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Format file size for display
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
