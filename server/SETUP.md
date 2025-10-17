# Dtrust API - Setup Guide

This guide will help you set up and run the Dtrust API on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v13 or higher) - [Download](https://www.postgresql.org/download/)
- **Hedera Testnet Account** - [Create Account](https://portal.hedera.com/)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

Create a new PostgreSQL database for the project:

```sql
CREATE DATABASE dtrust_db;
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/dtrust_db?schema=public"

# Hedera Configuration
HEDERA_ACCOUNT_ID="0.0.12345"
HEDERA_PRIVATE_KEY="302e020100300506032b65700422042012345678901234567890123456789012"
HCS_TOPIC_ID="0.0.67890"
HEDERA_NETWORK="testnet"
```

**Important:** Replace the placeholder values with your actual credentials:

- `DATABASE_URL`: Your PostgreSQL connection string
- `HEDERA_ACCOUNT_ID`: Your Hedera account ID from the Hedera portal
- `HEDERA_PRIVATE_KEY`: Your Hedera private key (DER-encoded hex string)
- `HCS_TOPIC_ID`: Your Hedera Consensus Service topic ID

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Run Database Migrations

```bash
npm run prisma:migrate
```

This will create all necessary tables in your PostgreSQL database.

### 6. Create Initial Organization and API Key (Optional)

You can use Prisma Studio to manually create an organization and API key for testing:

```bash
npm run prisma:studio
```

1. Open Prisma Studio (usually at http://localhost:5555)
2. Create a new **Organization** record
3. Create a new **ApiKey** record linked to the organization

Alternatively, you can use the Prisma client directly in a Node.js script.

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start the server with hot-reloading enabled.

### Production Mode

```bash
npm run build
npm start
```

## Verifying the Setup

Once the server is running, you can verify it's working by accessing:

```
http://localhost:3000/health
```

You should see a response like:

```json
{
  "status": "ok",
  "message": "Dtrust API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Testing the API

### 1. Anchor a Document

```bash
curl -X POST http://localhost:3000/api/v1/anchor \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "document=@/path/to/your/document.pdf"
```

### 2. Verify a Document

```bash
curl -X POST http://localhost:3000/api/v1/verify \
  -F "document=@/path/to/your/document.pdf"
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify your `DATABASE_URL` is correct
- Check that the database exists

### Hedera Connection Issues

- Verify your Hedera credentials are correct
- Ensure you're using the correct network (testnet/mainnet)
- Check that your HCS topic ID is valid and accessible

### Port Already in Use

If port 3000 is already in use, change the `PORT` value in your `.env` file.

## Creating Organizations and API Keys

Since this is an invite-only system, organizations and API keys must be provisioned by an admin. Here's a sample script to create them:

```typescript
// scripts/create-org.ts
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function createOrganization() {
  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: "Test Organization",
    },
  });

  // Generate a secure API key
  const apiKey = crypto.randomBytes(32).toString("hex");

  // Create API key
  const key = await prisma.apiKey.create({
    data: {
      key: apiKey,
      organizationId: org.id,
    },
  });

  console.log("Organization created:", org);
  console.log("API Key:", apiKey);

  await prisma.$disconnect();
}

createOrganization();
```

Run it with:

```bash
npx ts-node scripts/create-org.ts
```

## Next Steps

- Read the [API Documentation](README.md)
- Explore the [Hedera SDK Documentation](https://docs.hedera.com/)
- Learn about [Prisma](https://www.prisma.io/docs/)

## Support

For issues or questions, please refer to the project documentation or contact the development team.
