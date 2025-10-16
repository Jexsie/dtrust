# Dtrust API - Project Summary

Complete backend implementation for the Dtrust asset verification platform built on Hedera Hashgraph.

## 📋 Project Overview

**Dtrust** is a secure, production-ready API that enables authenticated organizations to anchor cryptographic proofs of documents onto the Hedera Consensus Service (HCS) and verify them later.

### Key Features

✅ API-first platform with RESTful endpoints  
✅ API Key-based authentication for server-to-server communication  
✅ Document anchoring to Hedera Consensus Service (HCS)  
✅ Public document verification  
✅ SHA-256 cryptographic hashing  
✅ PostgreSQL database with Prisma ORM  
✅ TypeScript for type safety  
✅ Docker support for easy deployment  
✅ Production-ready error handling and logging

## 🏗️ Architecture

### Technology Stack

| Component     | Technology               |
| ------------- | ------------------------ |
| Runtime       | Node.js v18+             |
| Framework     | Express.js               |
| Language      | TypeScript               |
| Database      | PostgreSQL               |
| ORM           | Prisma                   |
| Blockchain    | Hedera Hashgraph         |
| File Handling | Multer                   |
| Hashing       | Node.js Crypto (SHA-256) |

### Project Structure

```
dtrust/
├── 📄 Configuration Files
│   ├── package.json              # Dependencies and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── .gitignore                # Git ignore rules
│   ├── ENV_TEMPLATE.txt          # Environment variables template
│   ├── Dockerfile                # Docker image definition
│   ├── docker-compose.yml        # Docker Compose configuration
│   └── .dockerignore             # Docker ignore rules
│
├── 📚 Documentation
│   ├── README.md                 # Project overview
│   ├── QUICK_START.md            # 5-minute quick start guide
│   ├── SETUP.md                  # Detailed setup instructions
│   ├── API_DOCUMENTATION.md      # Complete API reference
│   └── PROJECT_SUMMARY.md        # This file
│
├── 🗄️ Database
│   └── prisma/
│       └── schema.prisma         # Database schema (Prisma)
│
├── 🔧 Scripts
│   ├── scripts/
│   │   ├── setup.sh              # Automated setup script
│   │   └── create-organization.ts # Create orgs and API keys
│
└── 💻 Source Code
    └── src/
        ├── server.ts             # Server entry point
        ├── app.ts                # Express app configuration
        │
        ├── config/
        │   └── index.ts          # Environment configuration
        │
        ├── services/
        │   ├── hedera.service.ts     # Hedera HCS integration
        │   └── document.service.ts   # Document hashing & DB
        │
        └── api/
            ├── middleware/
            │   ├── auth.middleware.ts        # API key authentication
            │   └── fileupload.middleware.ts  # File upload handling
            │
            ├── controllers/
            │   ├── anchor.controller.ts      # Document anchoring logic
            │   └── verify.controller.ts      # Document verification logic
            │
            └── routes/
                ├── anchor.routes.ts          # Anchor endpoint routes
                └── verify.routes.ts          # Verify endpoint routes
```

## 📊 Database Schema

### Models

**Organization**

- `id`: Unique identifier (CUID)
- `name`: Organization name (unique)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- Relations: Has many API keys and document proofs

**ApiKey**

- `id`: Unique identifier (CUID)
- `key`: API key string (unique, indexed)
- `organizationId`: Foreign key to Organization
- `createdAt`: Creation timestamp
- `expiresAt`: Expiration timestamp (optional)
- `lastUsedAt`: Last usage timestamp (optional)

**DocumentProof**

- `id`: Unique identifier (CUID)
- `documentHash`: SHA-256 hash (unique, indexed)
- `hederaTransactionId`: Hedera transaction ID
- `consensusTimestamp`: Hedera consensus timestamp
- `organizationId`: Foreign key to Organization
- `createdAt`: Creation timestamp

## 🔌 API Endpoints

### 1. POST /api/v1/anchor

**Purpose:** Anchor a document to Hedera HCS

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
    "documentHash": "...",
    "hederaTransactionId": "...",
    "consensusTimestamp": "..."
  }
}
```

### 2. POST /api/v1/verify

**Purpose:** Verify a document against Hedera HCS

**Authentication:** Not required (public)

**Request:**

- Content-Type: `multipart/form-data`
- Field: `document` (file)

**Response (200 OK - Verified):**

```json
{
  "status": "VERIFIED",
  "message": "This document is authentic and was anchored on the Hedera network.",
  "proof": { ... }
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

### 3. GET /health

**Purpose:** Health check endpoint

**Authentication:** Not required

**Response (200 OK):**

```json
{
  "status": "ok",
  "message": "Dtrust API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔐 Security Features

1. **API Key Authentication**

   - Secure API key-based authentication
   - Keys stored hashed in database
   - Automatic expiration support
   - Last usage tracking

2. **File Handling**

   - Memory storage (files not persisted)
   - 50MB file size limit
   - Automatic cleanup

3. **Input Validation**

   - Type-safe TypeScript implementation
   - Request validation middleware
   - SQL injection protection (Prisma ORM)

4. **Error Handling**
   - Comprehensive error handling
   - No sensitive data in error messages
   - Appropriate HTTP status codes

## 🚀 Deployment Options

### Option 1: Local Development

```bash
npm install
npm run dev
```

### Option 2: Production Build

```bash
npm install
npm run build
npm start
```

### Option 3: Docker

```bash
docker-compose up -d
```

### Option 4: Cloud Deployment

- Deploy to AWS, GCP, Azure, or any cloud provider
- Use managed PostgreSQL service
- Set environment variables
- Run migrations
- Start server

## 📦 NPM Scripts

| Script                    | Description                              |
| ------------------------- | ---------------------------------------- |
| `npm run dev`             | Start development server with hot reload |
| `npm run build`           | Compile TypeScript to JavaScript         |
| `npm start`               | Start production server                  |
| `npm run prisma:generate` | Generate Prisma client                   |
| `npm run prisma:migrate`  | Run database migrations                  |
| `npm run prisma:studio`   | Open Prisma Studio GUI                   |

## 🔧 Configuration

### Required Environment Variables

```env
DATABASE_URL          # PostgreSQL connection string
PORT                  # Server port (default: 3000)
NODE_ENV              # Environment (development/production)
HEDERA_ACCOUNT_ID     # Your Hedera account ID
HEDERA_PRIVATE_KEY    # Your Hedera private key
HCS_TOPIC_ID          # Your HCS topic ID
HEDERA_NETWORK        # Network (testnet/mainnet/previewnet)
```

## 📖 Key Implementation Details

### 1. Hedera Integration (`hedera.service.ts`)

- Creates Hedera client based on network configuration
- Submits document hashes to HCS using TopicMessageSubmitTransaction
- Returns transaction ID and consensus timestamp
- Handles connection cleanup
- Validates configuration on startup

### 2. Document Hashing (`document.service.ts`)

- Uses Node.js crypto module for SHA-256 hashing
- Processes files in memory
- Provides database operations for proofs
- Handles Prisma client lifecycle

### 3. Authentication (`auth.middleware.ts`)

- Validates Bearer token format
- Looks up API keys in database
- Checks expiration
- Tracks last usage
- Attaches organization to request

### 4. File Upload (`fileupload.middleware.ts`)

- Uses Multer with memory storage
- Configurable file size limits
- File type filtering (currently accepts all)
- Automatic cleanup

### 5. Controllers

**Anchor Controller:**

1. Validates file upload
2. Calculates SHA-256 hash
3. Checks for duplicates
4. Submits to Hedera HCS
5. Saves proof to database

**Verify Controller:**

1. Validates file upload
2. Calculates SHA-256 hash
3. Looks up proof in database
4. Returns verification status

## 🧪 Testing

### Manual Testing

Use the provided cURL commands in QUICK_START.md or API_DOCUMENTATION.md

### Integration Testing

Example test cases:

1. Health check endpoint
2. Anchor a new document
3. Verify the anchored document
4. Try to anchor the same document again (should fail)
5. Verify a non-anchored document
6. Test authentication failures

### Unit Testing (Future Enhancement)

Consider adding:

- Jest for unit testing
- Supertest for API testing
- Test fixtures for documents
- Mock Hedera client for testing

## 📈 Future Enhancements

Potential features to add:

1. **Webhooks** - Notify when documents are verified
2. **Rate Limiting** - Prevent API abuse
3. **Caching** - Redis for frequently verified documents
4. **Batch Operations** - Anchor multiple documents at once
5. **Document Metadata** - Store additional document information
6. **Admin Dashboard** - Web UI for organization management
7. **Audit Logs** - Track all API operations
8. **Multi-signature** - Support multiple Hedera accounts
9. **IPFS Integration** - Store actual documents on IPFS
10. **API Versioning** - Support multiple API versions

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**

   - Check PostgreSQL is running
   - Verify DATABASE_URL is correct

2. **Hedera errors**

   - Verify credentials are correct
   - Check account has sufficient balance
   - Ensure HCS topic exists

3. **TypeScript errors**

   - Run `npm install` to install dependencies
   - Run `npm run prisma:generate` to generate Prisma client

4. **Port in use**
   - Change PORT in .env file

## 📝 Code Quality

### TypeScript

- Strict mode enabled
- Full type safety
- No implicit any
- Consistent code style

### Best Practices

- Separation of concerns (MVC pattern)
- Service layer for business logic
- Middleware for cross-cutting concerns
- Environment-based configuration
- Comprehensive error handling
- Graceful shutdown handling

## 📜 License

MIT

## 👥 Support

For questions, issues, or contributions:

- Read the documentation
- Check existing issues
- Contact the development team

---

## ✅ Checklist for Getting Started

- [ ] Install Node.js v18+
- [ ] Install PostgreSQL
- [ ] Create Hedera testnet account
- [ ] Create HCS topic
- [ ] Clone/download project
- [ ] Run `npm install`
- [ ] Create `.env` file
- [ ] Run database migrations
- [ ] Create organization and API key
- [ ] Start server
- [ ] Test endpoints
- [ ] Read API documentation
- [ ] Integrate with your application

---

**🎉 Congratulations! You now have a complete, production-ready document verification API built on Hedera Hashgraph.**

For detailed instructions, refer to:

- [QUICK_START.md](QUICK_START.md) - Get running in 5 minutes
- [SETUP.md](SETUP.md) - Detailed setup guide
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Complete API reference
- [README.md](README.md) - Project overview
