/**
 * Hedera Service
 * Handles all interactions with the Hedera Hashgraph network
 * Specifically manages submissions to the Hedera Consensus Service (HCS)
 */

import {
  Client,
  TopicMessageSubmitTransaction,
  AccountId,
  PrivateKey,
  Status,
} from "@hashgraph/sdk";
import config from "../config";

/**
 * Interface for the result of submitting a hash to HCS
 */
export interface HederaSubmissionResult {
  transactionId: string;
  consensusTimestamp: string;
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

  // Uses the DER-encoded private key
  const privateKey = PrivateKey.fromStringDer(config.hedera.privateKey);

  client.setOperator(accountId, privateKey);

  return client;
}

/**
 * Submits a document proof to the Hedera Consensus Service (HCS)
 *
 * @param message - JSON string containing the proof: { hash, did, signature }
 * @returns Promise resolving to transaction ID and consensus timestamp
 * @throws {Error} If submission to HCS fails
 */
export async function submitHashToHCS(
  message: string
): Promise<HederaSubmissionResult> {
  const client = createHederaClient();

  try {
    const transaction = new TopicMessageSubmitTransaction({
      topicId: config.hedera.topicId,
      message: message,
    });

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const record = await txResponse.getRecord(client);

    const consensusTimestamp = record.consensusTimestamp;
    const status = receipt.status;

    if (status._code !== Status.Success._code) {
      throw new Error(`Transaction failed: ${status._code}`);
    }

    if (!consensusTimestamp) {
      throw new Error("No consensus timestamp received from Hedera");
    }

    const result: HederaSubmissionResult = {
      transactionId: txResponse.transactionId.toString(),
      consensusTimestamp: consensusTimestamp.toString(),
    };

    console.log("Successfully submitted proof to HCS:", {
      message,
      transactionId: result.transactionId,
      consensusTimestamp: result.consensusTimestamp,
    });

    return result;
  } catch (error) {
    console.error("Error submitting hash to HCS:", error);
    throw new Error(
      `Failed to submit hash to Hedera Consensus Service: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  } finally {
    client.close();
  }
}

/**
 * Validates that the Hedera configuration is correct by testing the connection
 * This is useful for startup health checks
 *
 * @returns Promise resolving to true if configuration is valid
 * @throws {Error} If configuration is invalid or connection fails
 */
export async function validateHederaConfig(): Promise<boolean> {
  const client = createHederaClient();

  try {
    client.close();
    return true;
  } catch (error) {
    console.error("Invalid Hedera configuration:", error);
    throw new Error("Invalid Hedera configuration");
  }
}
