/**
 * Configuration module for environment variables
 * Centralizes all environment variable access and validation
 */

import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  cors: {
    origins: string[];
  };
  database: {
    url: string;
  };
  hedera: {
    accountId: string;
    privateKey: string;
    topicId: string;
    network: "mainnet" | "testnet" | "previewnet";
    registryContractId?: string; // Optional: IssuerRegistry contract ID
  };
}

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required environment variable is missing
 */
function validateConfig(): void {
  const required = [
    "DATABASE_URL",
    "HEDERA_ACCOUNT_ID",
    "HEDERA_PRIVATE_KEY",
    "HCS_TOPIC_ID",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

validateConfig();

/**
 * Parse CORS origins from environment variable
 * Supports comma-separated list of URLs
 * Defaults to localhost URLs for development
 */
function parseCorsOrigins(): string[] {
  const defaultOrigins = [
    "http://localhost:3002", // Issuer portal (dev)
    "http://localhost:3003", // Verifier portal (dev)
  ];

  if (process.env.CORS_ORIGINS) {
    return process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim());
  }

  return defaultOrigins;
}

/**
 * Application configuration object
 */
const config: Config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  cors: {
    origins: parseCorsOrigins(),
  },
  database: {
    url: process.env.DATABASE_URL!,
  },
  hedera: {
    accountId: process.env.HEDERA_ACCOUNT_ID!,
    privateKey: process.env.HEDERA_PRIVATE_KEY!,
    topicId: process.env.HCS_TOPIC_ID!,
    network: (process.env.HEDERA_NETWORK || "testnet") as
      | "mainnet"
      | "testnet"
      | "previewnet",
    registryContractId: process.env.REGISTRY_CONTRACT_ID,
  },
};

export default config;
