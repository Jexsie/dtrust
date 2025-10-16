# Dtrust API

An asset verification tool built on the Hedera Hashgraph network. This API allows authenticated organizations to anchor cryptographic proofs of their documents onto the Hedera Consensus Service (HCS) that can be verified by the public.

## Features

- API Key-based authentication for server-to-server communication
- Document anchoring to Hedera Consensus Service (HCS)
- Public document verification
- Secure SHA-256 hashing
- PostgreSQL database with Prisma ORM

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Hedera testnet/mainnet account with HCS topic

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd dtrust
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your actual values
```

4. Set up the database:

```bash
npm run prisma:generate
npm run prisma:migrate
```

## Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `HEDERA_ACCOUNT_ID`: Your Hedera account ID
- `HEDERA_PRIVATE_KEY`: Your Hedera private key
- `HCS_TOPIC_ID`: Your Hedera Consensus Service topic ID
- `PORT`: Server port (default: 3000)

## Running the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

## API Endpoints

### POST /api/v1/anchor

Anchor a document to the Hedera network.

**Authentication:** Required (API Key)

**Request:**

- Content-Type: `multipart/form-data`
- Field: `document` (file)
- Header: `Authorization: Bearer <API_KEY>`

**Response (201 Created):**

```json
{
  "message": "Document anchored successfully.",
  "proof": {
    "documentHash": "a1b2c3d4...",
    "hederaTransactionId": "0.0.12345@166589...-...",
    "consensusTimestamp": "166589...-..."
  }
}
```

### POST /api/v1/verify

Verify a document against the Hedera network.

**Authentication:** Not required (public endpoint)

**Request:**

- Content-Type: `multipart/form-data`
- Field: `document` (file)

**Response (200 OK - Verified):**

```json
{
  "status": "VERIFIED",
  "message": "This document is authentic and was anchored on the Hedera network.",
  "proof": {
    "documentHash": "a1b2c3d4...",
    "hederaTransactionId": "0.0.12345@166589...-...",
    "consensusTimestamp": "166589...-...",
    "anchoredByOrganizationId": "org_cuid_..."
  }
}
```

**Response (200 OK - Not Verified):**

```json
{
  "status": "NOT_VERIFIED",
  "message": "This document has not been anchored and cannot be verified.",
  "proof": null
}
```

## Project Structure

```
/dtrust-api
|-- /prisma
|   |-- schema.prisma
|-- /src
|   |-- /api
|   |   |-- /routes
|   |   |   |-- anchor.routes.ts
|   |   |   |-- verify.routes.ts
|   |   |-- /controllers
|   |   |   |-- anchor.controller.ts
|   |   |   |-- verify.controller.ts
|   |   |-- /middleware
|   |       |-- auth.middleware.ts
|   |       |-- fileupload.middleware.ts
|   |-- /config
|   |   |-- index.ts
|   |-- /services
|   |   |-- hedera.service.ts
|   |   |-- document.service.ts
|   |-- app.ts
|   |-- server.ts
|-- .env.example
|-- .gitignore
|-- package.json
|-- tsconfig.json
```

## License

MIT
