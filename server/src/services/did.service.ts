/**
 * DID Service
 * Handles all interactions with Hedera Decentralized Identifiers (DIDs)
 * Uses the Hiero DID SDK to create and resolve DIDs
 */

import { PublicKey } from "@hashgraph/sdk";
import { HederaClientService } from "@hiero-did-sdk/client";
import { resolveDID } from "@hiero-did-sdk/resolver";
import { KeysUtility } from "@hiero-did-sdk/core";
import config from "../config";

/**
 * Interface for the result of generating a new DID
 */
export interface DidGenerationResult {
  did: string;
  privateKey: string;
}

/**
 * Singleton instance of HederaClientService
 * Manages connections to Hedera networks
 */
let clientServiceInstance: HederaClientService | null = null;

/**
 * Gets or creates the singleton HederaClientService instance
 * @returns HederaClientService instance
 */
function getClientService(): HederaClientService {
  if (!clientServiceInstance) {
    // Determine network string for Hiero SDK
    let network: "mainnet" | "testnet" | "previewnet";

    switch (config.hedera.network) {
      case "mainnet":
        network = "mainnet";
        break;
      case "testnet":
        network = "testnet";
        break;
      case "previewnet":
        network = "previewnet";
        break;
      default:
        throw new Error(`Invalid Hedera network: ${config.hedera.network}`);
    }

    // Create a singleton instance of the HederaClientService
    clientServiceInstance = new HederaClientService({
      networks: [
        {
          network: network,
          operatorId: config.hedera.accountId,
          operatorKey: config.hedera.privateKey,
        },
      ],
    });
  }

  return clientServiceInstance;
}

/**
 * Verifies a cryptographic signature against a document hash using a DID's public key
 *
 * This is a CRITICAL security function that prevents malicious uploads.
 * It cryptographically proves that the signer has the private key for the given DID.
 *
 * @param did - The Hedera DID to verify against
 * @param documentHashHex - The document hash in hex format
 * @param signatureHex - The signature in hex format
 * @returns true if signature is valid, false otherwise
 */
export async function verifySignature(
  did: string,
  documentHashHex: string,
  signatureHex: string
): Promise<boolean> {
  try {
    // Validate inputs
    if (!did || !documentHashHex || !signatureHex) {
      console.error("Signature verification: Missing required parameters");
      return false;
    }

    if (!did.startsWith("did:hedera:")) {
      console.error(`Signature verification: Invalid DID format: ${did}`);
      return false;
    }

    // 1. Resolve the DID to find the Public Key from the Hedera network
    // This ensures we're using the authoritative public key, not a cached one
    console.log(`Resolving DID to get public key: ${did}`);
    const didDocument = await resolveDID(did);

    if (!didDocument) {
      console.error(`Signature verification: Failed to resolve DID: ${did}`);
      return false;
    }

    if (
      !didDocument.verificationMethod ||
      didDocument.verificationMethod.length === 0
    ) {
      console.error(
        `Signature verification: DID document has no verification methods: ${did}`
      );
      return false;
    }

    // 2. Extract the Public Key string from the DID Document
    // Hiero DIDs use Ed25519VerificationKey2020 with publicKeyMultibase
    // Try to find the Ed25519 verification method
    let publicKeyString: string | undefined;

    for (const method of didDocument.verificationMethod) {
      if (
        method.type === "Ed25519VerificationKey2020" &&
        method.publicKeyMultibase
      ) {
        publicKeyString = method.publicKeyMultibase;
        break;
      }
    }

    if (!publicKeyString) {
      console.error(
        `Signature verification: No Ed25519 public key found in DID document for: ${did}`
      );
      return false;
    }
    console.log(`Public key string (multibase): ${publicKeyString}`);

    // 3. Convert the multibase public key string to Hedera PublicKey object
    // The publicKeyMultibase is in base58btc format (starts with 'z')
    // We need to use KeysUtility to convert it back to a Hedera PublicKey
    let publicKey: PublicKey;
    try {
      // Use KeysUtility to convert from multibase format
      const keysUtility = KeysUtility.fromMultibase(publicKeyString);
      // Get the Hedera PublicKey from the utility
      publicKey = keysUtility.toPublicKey();
      console.log(`✓ Successfully converted multibase to Hedera PublicKey`);
    } catch (error) {
      console.error(
        `Signature verification: Failed to convert multibase public key to Hedera PublicKey: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return false;
    }

    // 4. Prepare the data (Convert Hex strings to Uint8Array bytes)
    let hashBytes: Buffer;
    let signatureBytes: Buffer;

    try {
      hashBytes = Buffer.from(documentHashHex, "hex");
      signatureBytes = Buffer.from(signatureHex, "hex");
    } catch (error) {
      console.error(
        `Signature verification: Failed to convert hex strings to bytes: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return false;
    }

    // Validate buffer lengths
    if (hashBytes.length !== 32) {
      console.error(
        `Signature verification: Invalid hash length: ${hashBytes.length} (expected 32 for SHA-256)`
      );
      return false;
    }

    if (signatureBytes.length !== 64) {
      console.error(
        `Signature verification: Invalid signature length: ${signatureBytes.length} (expected 64 for Ed25519)`
      );
      return false;
    }

    // 5. CRITICAL: VERIFY THE SIGNATURE
    // This cryptographically proves the signer has the private key
    const isValid = publicKey.verify(hashBytes, signatureBytes);

    if (isValid) {
      console.log(`✓ Signature verification SUCCESS for DID: ${did}`);
    } else {
      console.error(
        `✗ Signature verification FAILED for DID: ${did} - Signature does not match hash`
      );
    }

    return isValid;
  } catch (error) {
    console.error(
      `Signature verification: Unexpected error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return false;
  }
}
