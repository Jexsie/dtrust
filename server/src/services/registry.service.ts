/**
 * Registry Service
 * Handles interactions with the Trusted Issuer Registry smart contract on Hedera
 */

import {
  Client,
  ContractCallQuery,
  ContractFunctionParameters,
  ContractId,
  AccountId,
  PrivateKey,
} from "@hashgraph/sdk";
import config from "../config";

/**
 * Gets the registry contract ID from config
 * @returns The contract ID string, or null if not configured
 */
function getRegistryContractId(): string | null {
  return config.hedera.registryContractId || null;
}

/**
 * Creates and configures a Hedera client based on the configured network
 * @returns Client - Configured Hedera client
 */
function createHederaClient(): Client {
  let client: Client;

  switch (config.hedera.network) {
    case "mainnet":
      client = Client.forMainnet();
      break;
    case "testnet":
      client = Client.forTestnet();
      break;
    case "previewnet":
      client = Client.forPreviewnet();
      break;
    default:
      throw new Error(`Invalid Hedera network: ${config.hedera.network}`);
  }

  const accountId = AccountId.fromString(config.hedera.accountId);
  const privateKey = PrivateKey.fromStringDer(config.hedera.privateKey);

  client.setOperator(accountId, privateKey);

  return client;
}

/**
 * Checks if a DID is in the trusted issuer registry
 *
 * @param did - The DID string to check
 * @param contractId - Optional contract ID. If not provided, uses config value
 * @returns Promise resolving to true if the issuer is trusted, false otherwise
 * @throws {Error} If the contract call fails or contract ID is not configured
 */
export async function isTrustedIssuer(
  did: string,
  contractId?: string
): Promise<boolean> {
  const client = createHederaClient();

  try {
    // Use provided contract ID or get from config
    const registryContractId = contractId || getRegistryContractId();

    if (!registryContractId) {
      console.warn(
        "Registry contract ID not configured. Returning false for trust check."
      );
      return false;
    }

    // Parse the contract ID
    const contract = ContractId.fromString(registryContractId);

    // Create a ContractCallQuery to call the view function checkTrusted(string)
    const query = new ContractCallQuery()
      .setContractId(contract)
      .setGas(100_000)
      .setFunction(
        "checkTrusted",
        new ContractFunctionParameters().addString(did)
      );

    // Execute the query
    const contractCallResult = await query.execute(client);

    // Get the result (boolean)
    const isTrusted = contractCallResult.getBool(0);

    console.log(`Checked trust status for DID ${did}: ${isTrusted}`);

    return isTrusted;
  } catch (error) {
    console.error("Error checking trusted issuer status:", error);
    throw new Error(
      `Failed to check trusted issuer status: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  } finally {
    client.close();
  }
}
