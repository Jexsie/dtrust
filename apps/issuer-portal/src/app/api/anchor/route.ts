import { NextResponse } from "next/server";
import { PrivateKey } from "@hashgraph/sdk";
import { Crypto } from "@hiero-did-sdk/crypto";

/**
 * Server-side proxy endpoint for anchoring documents
 * This runs ONLY on the server and securely handles API key authentication
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get configuration from environment variables
    const didPrivateKey = process.env.DTRUST_DID_PRIVATE_KEY;
    const did = process.env.DTRUST_DID;
    const apiUrl = process.env.DTRUST_API_URL || "http://localhost:3001";

    if (!didPrivateKey) {
      console.error("DTRUST_DID_PRIVATE_KEY environment variable is not set");
      return NextResponse.json(
        {
          error: "Server configuration error",
          message:
            "DID private key not configured. Please set DTRUST_DID_PRIVATE_KEY in .env.local",
        },
        { status: 500 }
      );
    }

    if (!did) {
      console.error("DTRUST_DID environment variable is not set");
      return NextResponse.json(
        {
          error: "Server configuration error",
          message: "DID not configured. Please set DTRUST_DID in .env.local",
        },
        { status: 500 }
      );
    }

    // Calculate hash on server side using Hiero SDK crypto utility
    const arrayBuffer = await file.arrayBuffer();
    const hash = Crypto.sha256(new Uint8Array(arrayBuffer));

    // Sign the hash using the local private key
    // The private key is stored in .env.local and never leaves this server
    const hashBuffer = Buffer.from(hash, "hex");

    // Use Hedera SDK to sign the hash
    const privateKey = PrivateKey.fromString(didPrivateKey);
    const signatureBytes = privateKey.sign(hashBuffer);
    const signature = Buffer.from(signatureBytes).toString("hex");

    // Call the backend anchor API with signature
    // No API key needed - signature is the authentication
    const response = await fetch(`${apiUrl}/api/v1/anchor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentHash: hash,
        did: did,
        signature: signature,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("API Anchor Route Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
