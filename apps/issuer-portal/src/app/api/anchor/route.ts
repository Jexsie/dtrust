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
    // These should be set from the credentials provided during signup
    const didPrivateKey = process.env.DTRUST_DID_PRIVATE_KEY;
    const did = process.env.DTRUST_DID;
    const apiKey = process.env.DTRUST_API_KEY;
    const apiUrl = process.env.DTRUST_API_URL || "http://localhost:3001";

    if (!didPrivateKey) {
      console.error("DTRUST_DID_PRIVATE_KEY environment variable is not set");
      return NextResponse.json(
        {
          error: "Server configuration error",
          message:
            "DID private key not configured. Please set DTRUST_DID_PRIVATE_KEY in .env.local (from signup credentials)",
        },
        { status: 500 }
      );
    }

    if (!did) {
      console.error("DTRUST_DID environment variable is not set");
      return NextResponse.json(
        {
          error: "Server configuration error",
          message:
            "DID not configured. Please set DTRUST_DID in .env.local (from signup credentials)",
        },
        { status: 500 }
      );
    }

    if (!apiKey) {
      console.error("DTRUST_API_KEY environment variable is not set");
      return NextResponse.json(
        {
          error: "Server configuration error",
          message:
            "API key not configured. Please set DTRUST_API_KEY in .env.local (from signup credentials)",
        },
        { status: 500 }
      );
    }

    // Calculate hash on server side using Hiero SDK crypto utility
    const arrayBuffer = await file.arrayBuffer();
    const hash = Crypto.sha256(new Uint8Array(arrayBuffer));

    // Sign the hash using the DID private key from signup
    // The private key is stored in .env.local and never leaves this server
    // The private key format from signup is hex (from PrivateKey.toStringRaw())
    const hashBuffer = Buffer.from(hash, "hex");

    // Reconstruct the private key from hex string
    // PrivateKey.fromString() accepts the raw hex format from toStringRaw()
    const privateKey = PrivateKey.fromStringED25519(didPrivateKey);
    const signatureBytes = privateKey.sign(hashBuffer);
    const signature = Buffer.from(signatureBytes).toString("hex");

    // Call the backend anchor API with API key authentication
    // The server expects: Authorization: Bearer <API_KEY>
    const response = await fetch(`${apiUrl}/api/v1/anchor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`, // API key authentication as Bearer token
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
