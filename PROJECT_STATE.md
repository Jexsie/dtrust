# Dtrust Project - Current State

**Last Updated:** January 2025

## 📋 Project Overview

**Dtrust** is a document verification platform built on the Hedera Hashgraph network. It enables organizations to anchor cryptographic proofs of their documents onto the Hedera Consensus Service (HCS) and allows public verification of document authenticity.

### Core Concept

- **Issuers** (organizations) can anchor document hashes to the Hedera blockchain
- **Verifiers** (public) can verify document authenticity by checking against anchored proofs
- **Privacy-first**: Only document hashes (SHA-256) are stored, never the actual files
- **Immutable**: Once anchored, document proofs are permanently recorded on Hedera

---

## 🏗️ Architecture

### Monorepo Structure

The project is organized as a **pnpm workspace monorepo** with three main applications:

```
dtrust/
├── apps/
│   ├── issuer-portal/     # Next.js app for document anchoring (Port 3002)
│   └── verifier-portal/   # Next.js app for document verification (Port 3003)
├── server/                # Express.js API backend (Port 3001)
└── package.json           # Root workspace configuration
```

### Technology Stack

#### Frontend (Both Portals)

- **Framework**: Next.js 15.5.5 (with Turbopack)
- **React**: 19.1.0
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion 12.23.24
- **Icons**: Material Symbols Outlined
- **TypeScript**: 5.x

#### Backend (Server)

- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.19.2
- **Database**: PostgreSQL with Prisma ORM 5.19.1
- **Blockchain**: Hedera Hashgraph SDK 2.49.2
- **File Upload**: Multer 1.4.5
- **TypeScript**: 5.5.4

#### Development Tools

- **Package Manager**: pnpm 10.0.0
- **Monorepo**: pnpm workspaces
- **Linting**: ESLint 9
- **Build**: TypeScript compiler

---

## 🎯 Applications

### 1. Issuer Portal (`apps/issuer-portal`)

**Purpose**: Allows organizations to anchor documents to the Hedera network.

**Port**: 3002

#### Features Implemented ✅

1. **Document Anchoring Dashboard**

   - Hero section with title and description
   - "Anchor New Document" button (opens modal)
   - Sidebar layout (1/4 width) with:
     - Batch Upload section (drag & drop, file browser)
     - Filters section (status, date range)
   - Main content area (3/4 width) with:
     - Anchored Documents table
     - Export button
     - Status badges (Anchored/Pending)
     - Action buttons (View/Audit)

2. **3-Step Anchor Modal** (`AnchorModal.tsx`)

   - **Step 1: Upload**
     - Drag & drop file upload
     - File browser fallback
     - Visual feedback on file selection
     - Shows file name and size
   - **Step 2: Confirm**
     - File metadata display (name, size, type)
     - Content preview (first 500 characters)
     - Confirmation checkbox (required)
     - Warning about irreversible action
   - **Step 3: Status**
     - Loading spinner during anchoring
     - Success state with:
       - Full SHA-256 hash
       - Transaction ID (with HashScan link)
       - Timestamp
     - Error state with error message

3. **Design System**

   - Emerald green branding (`#059669`)
   - Montserrat font for headings
   - Inter font for body text
   - Fira Code for monospace (hashes)
   - Material Icons throughout
   - Dark mode support
   - Semi-transparent cards (glassmorphism)
   - Smooth animations (Framer Motion)

4. **Anchor Page** (`/anchor`)
   - Privacy notice (emerald background)
   - File upload zone
   - "How It Works" section (4 steps)
   - Auto-opens modal on route access

#### Current State

- ✅ UI/UX fully implemented
- ✅ Modal workflow complete
- ✅ Client-side file hashing (SHA-256)
- ✅ API integration ready
- ⚠️ Currently using dummy data for document list
- ⚠️ Batch upload functionality not yet connected to API
- ⚠️ Filters not yet functional
- ⚠️ Export functionality not yet implemented

#### Key Components

- `Layout.tsx` - Header with logo and Sign In button
- `AnchorModal.tsx` - 3-step anchoring workflow
- `Button.tsx` - Reusable button component
- `Card.tsx` - Card container component
- `FilePreviewModal.tsx` - File preview component
- `FileUploader.tsx` - File upload component (legacy)

---

### 2. Verifier Portal (`apps/verifier-portal`)

**Purpose**: Public interface for verifying document authenticity.

**Port**: 3003

#### Features Implemented ✅

1. **Welcome Screen**

   - Full-width welcome interface (before first upload)
   - Drag & drop file upload
   - File browser option
   - Search bar for transaction ID/hash lookup
   - Theme toggle (light/dark)

2. **Compact Sidebar** (after first upload)

   - Collapses to 20rem width
   - Maintains upload/search functionality
   - Theme toggle remains accessible

3. **Main Content Area** (after first upload)

   - **Stats Grid**: Shows verification statistics
     - Total Verifications
     - Success Rate
     - Recent Activity
   - **Verification Result**: Displays verification outcome
     - Success/Error states
     - Transaction details
     - Organization info (if verified)
   - **Transaction Log Table**: History of verifications
     - Time, Transaction ID, Status, File Name
     - Last 10 transactions

4. **Design**
   - Dark theme by default (`#191919`)
   - Smooth animations (sidebar collapse, content fade-in)
   - Responsive layout
   - Material Icons

#### Current State

- ✅ UI/UX fully implemented
- ✅ File upload and hashing
- ✅ API integration for verification
- ✅ Transaction history tracking
- ⚠️ Search functionality uses mock data
- ⚠️ Stats are calculated from local state only

#### Key Components

- `WelcomeScreen.tsx` - Initial full-width interface
- `CompactSidebar.tsx` - Collapsed sidebar view
- `VerificationResult.tsx` - Verification outcome display
- `StatsGrid.tsx` - Statistics dashboard
- `TransactionLogTable.tsx` - Verification history
- `ThemeToggle.tsx` - Theme switcher
- `SearchBar.tsx` - Search input component

---

### 3. Backend API (`server`)

**Purpose**: RESTful API for document anchoring and verification.

**Port**: 3001

#### API Endpoints

1. **POST `/api/v1/anchor`** (Authenticated)

   - Anchors a document hash to Hedera HCS
   - Requires API key authentication
   - Accepts: `multipart/form-data` with `document` field
   - Returns: Transaction ID, consensus timestamp, document hash
   - Status codes: 201 (Created), 400 (Bad Request), 401 (Unauthorized), 409 (Conflict), 500 (Error)

2. **POST `/api/v1/verify`** (Public)

   - Verifies a document against anchored proofs
   - No authentication required
   - Accepts: `multipart/form-data` with `document` field
   - Returns: Verification status, proof details (if verified)
   - Status codes: 200 (OK), 400 (Bad Request), 500 (Error)

3. **GET `/health`** (Public)

   - Health check endpoint
   - Returns: API status and timestamp

4. **GET `/`** (Public)
   - API information endpoint
   - Returns: API name, version, available endpoints

#### Database Schema (Prisma)

```prisma
model Organization {
  id              String         @id @default(cuid())
  name            String         @unique
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  apiKeys         ApiKey[]
  documentProofs  DocumentProof[]
}

model ApiKey {
  id              String         @id @default(cuid())
  key             String         @unique
  organizationId  String
  organization    Organization   @relation(...)
  createdAt       DateTime       @default(now())
  expiresAt       DateTime?
  lastUsedAt      DateTime?
}

model DocumentProof {
  id                  String       @id @default(cuid())
  documentHash        String       @unique  // SHA-256 hash
  hederaTransactionId String
  consensusTimestamp  String
  organizationId      String
  organization        Organization @relation(...)
  createdAt           DateTime     @default(now())
}
```

#### Services

1. **Hedera Service** (`hedera.service.ts`)

   - `submitHashToHCS()` - Submits hash to Hedera Consensus Service
   - `validateHederaConfig()` - Validates Hedera configuration
   - Supports: mainnet, testnet, previewnet

2. **Document Service** (`document.service.ts`)
   - `calculateFileHash()` - Calculates SHA-256 hash
   - `findProofByHash()` - Finds existing proof
   - `createDocumentProof()` - Creates new proof record
   - `getProofWithOrganization()` - Gets proof with org details

#### Middleware

1. **Auth Middleware** (`auth.middleware.ts`)

   - Validates API key from `Authorization: Bearer <key>` header
   - Attaches organization to request object

2. **File Upload Middleware** (`fileupload.middleware.ts`)
   - Handles multipart/form-data
   - File size limit: 50MB
   - Stores file in memory buffer

#### Current State

- ✅ Core API endpoints implemented
- ✅ Hedera integration working
- ✅ Database schema defined
- ✅ Authentication middleware
- ✅ File upload handling
- ⚠️ API key management UI not yet built
- ⚠️ Organization management endpoints not yet implemented
- ⚠️ Error handling could be more comprehensive

---

## 🔄 Data Flow

### Document Anchoring Flow

```
1. User selects file in Issuer Portal
   ↓
2. Client calculates SHA-256 hash (browser-side)
   ↓
3. Hash sent to POST /api/v1/anchor (with API key)
   ↓
4. Server validates API key → gets organization
   ↓
5. Server checks if hash already exists in DB
   ↓
6. If new, server submits hash to Hedera HCS
   ↓
7. Server receives transaction ID and timestamp
   ↓
8. Server saves proof to PostgreSQL database
   ↓
9. Server returns success response to client
   ↓
10. Client displays transaction details
```

### Document Verification Flow

```
1. User uploads file in Verifier Portal
   ↓
2. Client calculates SHA-256 hash (browser-side)
   ↓
3. Hash sent to POST /api/v1/verify (no auth required)
   ↓
4. Server calculates hash from uploaded file
   ↓
5. Server looks up hash in database
   ↓
6. If found, returns proof details (VERIFIED)
   ↓
7. If not found, returns NOT_VERIFIED
   ↓
8. Client displays verification result
```

---

## 🎨 Design System

### Color Palette

**Light Theme:**

- Background: `slate-50` (`#f8fafc`)
- Foreground: `slate-800` (`#1e293b`)
- Primary: `emerald-600` (`#059669`)
- Primary Hover: `emerald-700` (`#047857`)
- Card: `white/50` (semi-transparent)

**Dark Theme:**

- Background: `slate-900` (`#0f172a`)
- Foreground: `slate-200` (`#e2e8f0`)
- Card: `slate-800/50` (semi-transparent)

### Typography

- **Headings**: Montserrat (weights: 400, 500, 600, 700)
- **Body**: Inter (weights: 400, 500, 700)
- **Monospace**: Fira Code (for hashes/code)

### Icons

- **Library**: Material Symbols Outlined
- **Usage**: Consistent iconography throughout both portals

---

## 📦 Dependencies

### Root Workspace

- `pnpm` 10.0.0
- Node.js 20+

### Issuer Portal

- Next.js 15.5.5
- React 19.1.0
- Tailwind CSS 4
- Framer Motion 12.23.24
- TypeScript 5

### Verifier Portal

- Next.js 15.5.5
- React 19.1.0
- Tailwind CSS 4
- Framer Motion 12.23.24
- TypeScript 5

### Server

- Express 4.19.2
- Prisma 5.19.1
- @hashgraph/sdk 2.49.2
- Multer 1.4.5
- TypeScript 5.5.4

---

## 🚀 Development Setup

### Prerequisites

- Node.js 20+
- pnpm 10.0.0
- PostgreSQL database
- Hedera account (testnet/mainnet) with HCS topic

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your values

# Set up database
cd server
pnpm prisma:generate
pnpm prisma:migrate
```

### Running Development Servers

```bash
# Run all apps in parallel
pnpm dev

# Or run individually:
pnpm dev:issuer    # Issuer Portal (port 3002)
pnpm dev:verifier  # Verifier Portal (port 3003)
pnpm dev:server    # Backend API (port 3001)
```

### Environment Variables (Server)

Required in `server/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dtrust
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e...
HCS_TOPIC_ID=0.0.xxxxx
HEDERA_NETWORK=testnet
PORT=3001
```

---

## ✅ Completed Features

### Issuer Portal

- ✅ Modern UI redesign with emerald branding
- ✅ 3-step anchor modal workflow
- ✅ Client-side file hashing
- ✅ Document dashboard with table
- ✅ Batch upload UI
- ✅ Filters UI
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Material Icons integration

### Verifier Portal

- ✅ Welcome screen with file upload
- ✅ Compact sidebar after first upload
- ✅ Verification result display
- ✅ Stats grid
- ✅ Transaction log table
- ✅ Theme toggle
- ✅ Client-side file hashing
- ✅ API integration

### Backend API

- ✅ Document anchoring endpoint
- ✅ Document verification endpoint
- ✅ Hedera HCS integration
- ✅ PostgreSQL database with Prisma
- ✅ API key authentication
- ✅ File upload handling
- ✅ Error handling
- ✅ Health check endpoint

---

## ⚠️ Known Limitations / TODO

### Issuer Portal

- [ ] Connect batch upload to API
- [ ] Implement filter functionality
- [ ] Implement export functionality
- [ ] Connect document list to real API data
- [ ] Add pagination for document table
- [ ] Add document detail view
- [ ] Add audit trail view
- [ ] API key management UI
- [ ] Organization management UI

### Verifier Portal

- [ ] Implement real search functionality (by hash/transaction ID)
- [ ] Connect stats to real API data
- [ ] Add pagination for transaction log
- [ ] Add transaction detail view
- [ ] Add HashScan link integration
- [ ] Add share verification result feature

### Backend API

- [ ] Organization management endpoints
- [ ] API key management endpoints
- [ ] Rate limiting
- [ ] Request validation middleware
- [ ] Comprehensive error handling
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Webhook support for events
- [ ] Batch anchoring support
- [ ] Search by transaction ID endpoint

### Infrastructure

- [ ] Docker setup for production
- [ ] CI/CD pipeline
- [ ] Environment-specific configurations
- [ ] Logging and monitoring
- [ ] Database backups
- [ ] API versioning strategy

---

## 📝 Recent Changes

### Anchor Modal Implementation (Completed)

- Implemented 3-step modal workflow (Upload → Confirm → Status)
- Added client-side file hashing
- Added file preview functionality
- Added confirmation checkbox
- Added transaction details display
- Added HashScan link integration

### Issuer Portal Redesign (Completed)

- Redesigned UI to match design specifications
- Added emerald green branding
- Added Material Icons
- Added dark mode support
- Added semi-transparent cards
- Added smooth animations
- Updated typography (Montserrat, Inter, Fira Code)

---

## 🔐 Security Considerations

### Current Implementation

- ✅ API key authentication for anchoring
- ✅ Client-side hashing (files never uploaded)
- ✅ SHA-256 cryptographic hashing
- ✅ Hedera blockchain immutability

### Recommendations

- [ ] Add rate limiting
- [ ] Add CORS configuration
- [ ] Add request validation
- [ ] Add API key rotation mechanism
- [ ] Add HTTPS enforcement
- [ ] Add input sanitization
- [ ] Add file type validation
- [ ] Add file size limits (currently 50MB)

---

## 📊 Project Statistics

- **Total Applications**: 3 (Issuer Portal, Verifier Portal, Backend API)
- **Lines of Code**: ~5,000+ (estimated)
- **Components**: 15+ React components
- **API Endpoints**: 4 (anchor, verify, health, root)
- **Database Models**: 3 (Organization, ApiKey, DocumentProof)
- **Dependencies**: ~30 packages

---

## 🎯 Next Steps (Recommended)

### High Priority

1. Connect Issuer Portal document list to real API
2. Implement batch upload functionality
3. Add API key management UI
4. Implement search functionality in Verifier Portal
5. Add comprehensive error handling

### Medium Priority

1. Add pagination for tables
2. Add document/transaction detail views
3. Implement filter functionality
4. Add export functionality
5. Add HashScan integration

### Low Priority

1. Add API documentation
2. Add unit tests
3. Add E2E tests
4. Set up CI/CD
5. Add monitoring and logging

---

## 📚 Documentation Files

- `README.md` - Main project overview
- `ANCHOR_MODAL_IMPLEMENTATION.md` - Anchor modal feature documentation
- `ISSUER_PORTAL_REDESIGN.md` - UI redesign documentation
- `server/API_DOCUMENTATION.md` - API endpoint documentation
- `server/QUICK_START.md` - Quick start guide
- `server/SETUP.md` - Setup instructions
- `PROJECT_STATE.md` - This file (current project state)

---

## 🤝 Contributing

See `server/CONTRIBUTING.md` for contribution guidelines.

---

## 📄 License

MIT

---

**Status**: ✅ **Active Development**  
**Last Major Update**: January 2025  
**Version**: 1.0.0 (pre-release)
