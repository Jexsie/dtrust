/**
 * DID Service
 * Handles all interactions with Hedera Decentralized Identifiers (DIDs)
 * Uses the Hiero DID SDK to create and resolve DIDs
 */

import { PublicKey } from "@hashgraph/sdk";
import { HederaClientService } from "@hiero-did-sdk/client";
import { resolveDID } from "@hiero-did-sdk/resolver";
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

export async function verifySignature(
  did: string,
  documentHashHex: string,
  signatureHex: string
): Promise<boolean> {
  try {
    // 1. Resolve the DID to find the Public Key
    // (This is the "Lookup" step)
    const didDocument = await resolveDID(did);

    if (!didDocument || !didDocument.verificationMethod) {
      console.error("DID Document invalid or missing verification methods");
      return false;
    }

    // 2. Extract the Public Key string from the DID Document
    // Hiero DIDs usually use 'publicKeyMultibase' (starts with 'z')
    const method = didDocument.verificationMethod[1];
    const publicKeyString =
      method.type === "Ed25519VerificationKey2020"
        ? method.publicKeyMultibase
        : "";

    if (!publicKeyString) {
      throw new Error("No public key found in DID Document");
    }

    // 3. Convert the Public Key string into a Hedera PublicKey object
    const publicKey = PublicKey.fromString(publicKeyString);

    // 4. Prepare the data (Convert Hex strings to Uint8Array bytes)
    const hashBytes = Buffer.from(documentHashHex, "hex");
    const signatureBytes = Buffer.from(signatureHex, "hex");

    // 5. VERIFY (The Magic Moment)
    // We don't "decrypt" manually. We just call .verify()
    return publicKey.verify(hashBytes, signatureBytes);
  } catch (error) {
    console.error("Verification failed:", error);
    return false;
  }
}
