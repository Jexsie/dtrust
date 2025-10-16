# Dtrust API - Quick Start Guide

Get up and running with Dtrust API in 5 minutes!

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js v18+ installed ([Download](https://nodejs.org/))
- [ ] PostgreSQL installed and running ([Download](https://www.postgresql.org/download/))
- [ ] A Hedera testnet account ([Sign up](https://portal.hedera.com/))
- [ ] An HCS topic created in your Hedera account

## Setup in 5 Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Create a `.env` file in the root directory:

```bash
cp ENV_TEMPLATE.txt .env
```

Edit `.env` and add your credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dtrust_db?schema=public"
HEDERA_ACCOUNT_ID="0.0.YOUR_ACCOUNT_ID"
HEDERA_PRIVATE_KEY="your_private_key_here"
HCS_TOPIC_ID="0.0.YOUR_TOPIC_ID"
HEDERA_NETWORK="testnet"
PORT=3000
```

### Step 3: Set Up Database

```bash
# Create the database
createdb dtrust_db

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### Step 4: Create an Organization

```bash
npx ts-node scripts/create-organization.ts "My Organization"
```

**Save the API key** that is displayed - you'll need it to make authenticated requests!

### Step 5: Start the Server

```bash
npm run dev
```

You should see:

```
🚀 Dtrust API Server Started
Port: 3000
Hedera Network: testnet
```

## Test Your API

### Test 1: Health Check

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "Dtrust API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test 2: Anchor a Document

Create a test file:

```bash
echo "This is a test document" > test.txt
```

Anchor it (replace `YOUR_API_KEY` with your actual API key):

```bash
curl -X POST http://localhost:3000/api/v1/anchor \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "document=@test.txt"
```

Expected response:

```json
{
  "message": "Document anchored successfully.",
  "proof": {
    "documentHash": "...",
    "hederaTransactionId": "...",
    "consensusTimestamp": "..."
  }
}
```

### Test 3: Verify the Document

```bash
curl -X POST http://localhost:3000/api/v1/verify \
  -F "document=@test.txt"
```

Expected response:

```json
{
  "status": "VERIFIED",
  "message": "This document is authentic and was anchored on the Hedera network.",
  "proof": { ... }
}
```

### Test 4: Try a Different Document

```bash
echo "This is a different document" > test2.txt

curl -X POST http://localhost:3000/api/v1/verify \
  -F "document=@test2.txt"
```

Expected response:

```json
{
  "status": "NOT_VERIFIED",
  "message": "This document has not been anchored and cannot be verified.",
  "proof": null
}
```

## Next Steps

✅ **Congratulations!** Your Dtrust API is now running.

### What to do next:

1. **Read the full documentation**

   - [API Documentation](API_DOCUMENTATION.md)
   - [Setup Guide](SETUP.md)

2. **Explore the code**

   - `/src/services/hedera.service.ts` - Hedera integration
   - `/src/api/controllers/` - API endpoint logic
   - `/src/api/middleware/auth.middleware.ts` - Authentication

3. **Customize for production**

   - Set up proper secrets management
   - Configure HTTPS/SSL
   - Set up monitoring and logging
   - Deploy using Docker

4. **Integrate with your application**
   - Use the API examples in the documentation
   - Build a frontend interface
   - Set up webhooks (coming soon)

## Docker Quick Start (Alternative)

If you prefer using Docker:

```bash
# Set up environment variables
cp ENV_TEMPLATE.txt .env
# Edit .env with your credentials

# Start with Docker Compose
docker-compose up -d

# Run migrations
docker-compose exec api npx prisma migrate deploy

# Create an organization
docker-compose exec api npx ts-node scripts/create-organization.ts "My Org"
```

## Troubleshooting

### "Cannot connect to database"

- Ensure PostgreSQL is running
- Check your DATABASE_URL in .env
- Verify database exists: `psql -l`

### "Invalid Hedera configuration"

- Verify HEDERA_ACCOUNT_ID format (e.g., "0.0.12345")
- Check HEDERA_PRIVATE_KEY is correct
- Ensure HCS_TOPIC_ID exists and is accessible

### "Port already in use"

- Change PORT in .env to a different port (e.g., 3001)

### "API key authentication failed"

- Ensure you're using the correct API key
- Check the Authorization header format: `Bearer <API_KEY>`
- Verify the API key exists: `npm run prisma:studio`

## Getting Help

- Check the [API Documentation](API_DOCUMENTATION.md)
- Read the [Full Setup Guide](SETUP.md)
- Review the [README](README.md)

## Common Commands

```bash
# Development
npm run dev                    # Start dev server with hot reload
npm run build                  # Build for production
npm start                      # Start production server

# Database
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate         # Run migrations
npm run prisma:studio          # Open Prisma Studio (GUI)

# Organizations
npx ts-node scripts/create-organization.ts "Org Name"

# Docker
docker-compose up -d           # Start all services
docker-compose down            # Stop all services
docker-compose logs -f api     # View API logs
```

## Project Structure Overview

```
dtrust/
├── src/
│   ├── api/
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # Route definitions
│   │   └── middleware/       # Auth & file upload
│   ├── services/             # Business logic
│   ├── config/               # Configuration
│   ├── app.ts                # Express app setup
│   └── server.ts             # Server entry point
├── prisma/
│   └── schema.prisma         # Database schema
├── scripts/                  # Helper scripts
└── package.json              # Dependencies
```

---

**Ready to build something amazing? Let's go! 🚀**
