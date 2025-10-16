/**
 * Document Service
 * Handles document-related operations including hashing and database interactions
 */

import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Calculates the SHA-256 hash of a file buffer
 *
 * @param fileBuffer - Buffer containing the file data
 * @returns Hexadecimal string representation of the SHA-256 hash
 */
export function calculateFileHash(fileBuffer: Buffer): string {
  const hash = crypto.createHash("sha256");
  hash.update(fileBuffer);
  return hash.digest("hex");
}

/**
 * Interface for document proof data
 */
export interface DocumentProofData {
  documentHash: string;
  hederaTransactionId: string;
  consensusTimestamp: string;
  organizationId: string;
}

/**
 * Checks if a document hash already exists in the database
 *
 * @param documentHash - SHA-256 hash of the document
 * @returns Promise resolving to the existing proof if found, null otherwise
 */
export async function findProofByHash(documentHash: string) {
  return await prisma.documentProof.findUnique({
    where: { documentHash },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Creates a new document proof record in the database
 *
 * @param proofData - Data for the new document proof
 * @returns Promise resolving to the created proof
 */
export async function createDocumentProof(proofData: DocumentProofData) {
  return await prisma.documentProof.create({
    data: {
      documentHash: proofData.documentHash,
      hederaTransactionId: proofData.hederaTransactionId,
      consensusTimestamp: proofData.consensusTimestamp,
      organizationId: proofData.organizationId,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Retrieves a document proof by its hash
 * Includes organization information
 *
 * @param documentHash - SHA-256 hash of the document
 * @returns Promise resolving to the proof with organization data, or null if not found
 */
export async function getProofWithOrganization(documentHash: string) {
  return await prisma.documentProof.findUnique({
    where: { documentHash },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Closes the Prisma client connection
 * Should be called when shutting down the application
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
}
