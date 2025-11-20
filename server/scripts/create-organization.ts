/**
 * Create Organization Script
 * Helper script to create organizations and generate API keys
 *
 * Usage: npx ts-node scripts/create-organization.ts "Organization Name"
 */

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

/**
 * Generates a secure random API key
 * @returns Hexadecimal string API key
 */
function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Creates a new organization with an API key
 * @param organizationName - Name of the organization to create
 */
async function createOrganization(organizationName: string): Promise<void> {
  try {
    console.log("Creating organization...");

    const existingOrg = await prisma.organization.findUnique({
      where: { name: organizationName },
    });

    if (existingOrg) {
      console.error(`Organization "${organizationName}" already exists`);
      process.exit(1);
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
      },
    });

    console.log("✓ Organization created successfully");
    console.log("  ID:", organization.id);
    console.log("  Name:", organization.name);
    console.log("");

    // Generate and create API key
    const apiKeyValue = generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        key: apiKeyValue,
        organizationId: organization.id,
      },
    });

    console.log("✓ API Key generated successfully");
    console.log("  ID:", apiKey.id);
    console.log("");
    console.log("=".repeat(70));
    console.log(
      "🔑 API KEY (save this securely - it will not be shown again):"
    );
    console.log("=".repeat(70));
    console.log(apiKeyValue);
    console.log("=".repeat(70));
    console.log("");
    console.log("Use this API key in the Authorization header:");
    console.log(`Authorization: Bearer ${apiKeyValue}`);
    console.log("");
  } catch (error) {
    console.error("Error creating organization:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      'Usage: npx ts-node scripts/create-organization.ts "Organization Name"'
    );
    process.exit(1);
  }

  const organizationName = args[0];

  if (!organizationName || organizationName.trim().length === 0) {
    console.error("Organization name cannot be empty");
    process.exit(1);
  }

  await createOrganization(organizationName.trim());
}

main();
