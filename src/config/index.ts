/**
 * Configuration module for environment variables
 * Centralizes all environment variable access and validation
 */

import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  database: {
    url: string;
  };
  hedera: {
    accountId: string;
    privateKey: string;
    topicId: string;
    network: "mainnet" | "testnet" | "previewnet";
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
 * Application configuration object
 */
const config: Config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
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
  },
};

export default config;
