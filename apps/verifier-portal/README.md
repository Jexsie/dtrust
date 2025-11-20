# Dtrust Verifier Portal

Public-facing portal for verifying document authenticity on the Hedera network.

## Overview

The Verifier Portal is a clean, single-purpose application that allows anyone to:

- Verify if a document has been anchored to Hedera
- Check document authenticity without uploading the file
- Get instant verification results

## Features

### ✅ Public Verification

- **No Authentication Required**: Open to everyone
- **Instant Results**: Real-time verification against Hedera network
- **Privacy-First**: Documents are hashed locally in the browser

### 🔒 Privacy & Security

- **Client-Side Hashing**: SHA-256 calculated using Web Crypto API
- **No File Upload**: Documents never leave your browser
- **Tamper-Proof**: Verification against immutable Hedera ledger

### 🎨 Clear Visual Feedback

- **✅ Verified** (Green): Document found on Hedera network
- **❌ Not Verified** (Red): Document not found or has been modified
- Detailed verification information when available

## Pages

### `/` (Home)

Single-page verification tool featuring:

- Large drag-and-drop uploader
- Document verification interface
- Information cards about the process
- How it works section
- FAQ section

## Theme

**Primary Color**: Red (`#e11d48`)

- Creates distinct visual identity from Issuer Portal
- Used for primary call-to-action buttons
- Clean, public-facing aesthetic

## Running Locally

```bash
# From the root of the monorepo
pnpm dev:verifier

# Or from this directory
pnpm dev
```

The portal will be available at: http://localhost:3002

## Technology

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Web Crypto API** for client-side hashing

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure:

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3001)

## Components

### Button

Reusable button with variants:

- `default`: Solid red background
- `destructive`: Solid darker red background
- `outline`: Transparent with border

### Card

Container component with header, title, and content sections.

### Layout

Public-facing layout with minimal header and informative footer.

### DocumentVerifier

Complete verification component with:

- Drag-and-drop file upload
- Client-side SHA-256 hashing
- Automatic verification on upload
- Clear visual feedback
- Detailed result display

## How Verification Works

1. **Upload Document**: User drops or selects a file
2. **Local Hashing**: SHA-256 hash calculated in browser using Web Crypto API
3. **Hedera Lookup**: Hash is checked against Hedera network records
4. **Display Result**: Clear ✅ or ❌ feedback with details

## API Integration

### Verify Document

```typescript
POST http://localhost:3001/api/v1/verify
Body: { hash, fileName }
Response: { verified: boolean, details: {...} }
```

## Verification Results

### ✅ Verified

- Document hash found on Hedera network
- Shows transaction ID
- Shows anchoring timestamp
- Shows organization (if available)

### ❌ Not Verified

- Document hash not found
- Could mean:
  - Document was never anchored
  - Document has been modified since anchoring
  - Hash mismatch

## User Experience

### Information Cards

- **100% Private**: Files hashed locally
- **Instant Verification**: Real-time results
- **Tamper-Proof**: Hedera distributed consensus

### FAQ Section

- What does verified mean?
- Is my document uploaded?
- What if document is not verified?

## Security

- No authentication required (public access)
- Client-side file hashing (files never uploaded)
- Read-only verification (no data modification)
- Secure communication with backend API

## Use Cases

- Verify academic certificates
- Check document authenticity
- Validate legal documents
- Confirm business records
- Audit trail verification

## Contributing

See the main monorepo README for contribution guidelines.

## License

© 2025 Dtrust. All rights reserved.
