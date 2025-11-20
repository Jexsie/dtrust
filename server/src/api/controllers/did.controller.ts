/**
 * DID Controller
 * Handles non-custodial DID registration flow where client signs and server submits
 */

import { Request, Response } from "express";
import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";
import {
  generateCreateDIDRequest,
  submitCreateDIDRequest,
} from "@hiero-did-sdk/registrar";
import { PrismaClient } from "@prisma/client";
import config from "../../config";

const prisma = new PrismaClient();

/**
 * Creates a Hedera client configured with the server's operator account (payer)
 * @returns Configured Hedera client
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
 * Helper function to convert Uint8Array to hex string
 */
function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Helper function to convert hex string to Uint8Array
 */
function hexToUint8Array(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g);
  if (!matches) {
    throw new Error("Invalid hex string");
  }
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

/**
 * POST /api/v1/did/request-creation
 *
 * Generates a DID creation request that the client will sign.
 * The server acts as the payer for the transaction.
 *
 * Request Body: { publicKeyMultibase: string }
 * Response: { serialisedPayload: string (hex), state: any }
 */
export async function requestDidCreation(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { publicKeyMultibase } = req.body as { publicKeyMultibase?: string };

    if (!publicKeyMultibase || typeof publicKeyMultibase !== "string") {
      res.status(400).json({
        error: "Bad Request",
        message: "publicKeyMultibase is required",
      });
      return;
    }

    // Initialize Hedera client with server's operator account (payer)
    const client = createHederaClient();

    // Generate the creation request
    // This returns a signingRequest that the client must sign
    const result = await generateCreateDIDRequest(
      {
        multibasePublicKey: publicKeyMultibase,
        topicId: config.hedera.topicId,
      },
      { client }
    );

    if (!result.signingRequest || !result.state) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to generate DID creation request",
      });
      return;
    }

    // Convert serializedPayload (Uint8Array) to hex string for client
    const serialisedPayloadHex = uint8ArrayToHex(
      result.signingRequest.serializedPayload
    );

    res.status(200).json({
      serialisedPayload: serialisedPayloadHex,
      state: result.state,
    });
  } catch (error) {
    console.error("Error requesting DID creation:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

/**
 * POST /api/v1/did/submit-creation
 *
 * Submits the signed DID creation request to Hedera.
 * The server pays for the transaction using its operator account.
 *
 * Request Body: { state: any, signatureHex: string, organizationId?: string }
 * Response: { did: string, didDocument: any }
 */
export async function submitDidCreation(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { state, signature, organizationId } = req.body as {
      state?: any;
      signature?: string;
      organizationId?: string;
    };

    if (!state) {
      res.status(400).json({
        error: "Bad Request",
        message: "state is required",
      });
      return;
    }

    if (!signature || typeof signature !== "string") {
      res.status(400).json({
        error: "Bad Request",
        message: "signature (hex string) is required",
      });
      return;
    }

    // Initialize Hedera client with server's operator account (payer)
    const client = createHederaClient();

    // Convert signature hex string back to Uint8Array
    const signatureUint8Array = hexToUint8Array(signature);

    // Submit the signed creation request
    const result = await submitCreateDIDRequest(
      { state, signature: signatureUint8Array },
      { client }
    );

    if (!result.did || !result.didDocument) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to submit DID creation",
      });
      return;
    }

    // If organizationId is provided, save the DID to the organization
    if (organizationId) {
      try {
        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            did: result.did,
          },
        });
        console.log(
          `DID ${result.did} saved to organization ${organizationId}`
        );
      } catch (dbError) {
        console.error("Error saving DID to organization:", dbError);
        // Don't fail the request if DB update fails - DID was still created
      }
    }

    res.status(201).json({
      did: result.did,
      didDocument: result.didDocument,
    });
  } catch (error) {
    console.error("Error submitting DID creation:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
