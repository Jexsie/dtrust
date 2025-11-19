/**
 * Mirror Node Service
 * Handles queries to Hedera Mirror Node for HCS messages
 */

import config from "../config";

/**
 * Interface for HCS message from mirror node
 */
export interface HcsMessage {
  consensus_timestamp: string;
  message: string;
  payer_account_id: string;
  running_hash: string;
  running_hash_version: number;
  sequence_number: number;
  topic_id: string;
}

/**
 * Gets the mirror node base URL based on the network
 * @returns The mirror node API base URL
 */
function getMirrorNodeUrl(): string {
  switch (config.hedera.network) {
    case "mainnet":
      return "https://mainnet-public.mirrornode.hedera.com";
    case "testnet":
      return "https://testnet.mirrornode.hedera.com";
    case "previewnet":
      return "https://previewnet.mirrornode.hedera.com";
    default:
      throw new Error(`Invalid Hedera network: ${config.hedera.network}`);
  }
}

/**
 * Queries the Hedera Mirror Node for HCS messages containing a specific hash
 *
 * @param topicId - The HCS topic ID to query
 * @param hash - The hash to search for in messages
 * @returns Promise resolving to the first matching message, or null if not found
 */
export async function findMessageByHash(
  hash: string
): Promise<HcsMessage | null> {
  try {
    const mirrorUrl = getMirrorNodeUrl();
    const topicId = config.hedera.topicId;

    if (!topicId) {
      throw new Error("HCS topic ID is not configured");
    }
    // Query mirror node for messages in the topic
    // We'll search through messages to find one containing the hash
    const url = `${mirrorUrl}/api/v1/topics/${topicId}/messages?limit=100&order=desc`;

    console.log(`Querying mirror node: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Mirror node query failed: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as { messages: HcsMessage[] };

    if (!data.messages || !Array.isArray(data.messages)) {
      return null;
    }

    // Search through messages to find one containing our hash
    for (const message of data.messages) {
      try {
        // Parse the message (it should be a JSON string)
        const messageContent = JSON.parse(
          Buffer.from(message.message, "base64").toString("utf-8")
        );

        // Check if this message contains our hash
        if (messageContent.hash === hash) {
          return message;
        }
      } catch (parseError) {
        // If message is not JSON, skip it
        continue;
      }
    }

    // If we didn't find it in the first 100, we might need to paginate
    // For now, return null
    return null;
  } catch (error) {
    console.error("Error querying mirror node:", error);
    throw new Error(
      `Failed to query mirror node: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
