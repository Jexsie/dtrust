# Document Anchoring Portal

Direct-access portal for organizations to anchor their documents to the Hedera network.

## Overview

The Document Anchoring Portal is a professional application that allows organizations to:

- Anchor document hashes to the Hedera distributed ledger
- View their anchoring history
- Verify documents before anchoring with preview modal

## Features

### 📄 Document Anchoring

- **Client-Side Hashing**: Documents are hashed locally using SHA-256 via the Web Crypto API
- **Privacy-First**: Files never leave the user's browser
- **Drag-and-Drop**: Modern, intuitive file upload interface
- **Preview Modal**: Review document contents before anchoring
- **Verification Prompts**: Multiple warnings to ensure correct file is anchored
- **Real-Time Feedback**: Loading states and success/error messages

### 📊 Dashboard

- View all previously anchored documents
- Transaction IDs and timestamps
- Document status tracking

## Pages

### `/`

Main dashboard showing anchored document history. No authentication required.

### `/anchor`

Page for anchoring new documents with:

- File uploader component
- Preview modal with file content
- SHA-256 hash display
- Verification warnings
- Privacy information
- Step-by-step guide

## Core Component: File Preview Modal

The preview modal shows:

- **File Details**: Name, size, type, and SHA-256 hash
- **Visual Preview**: Images and text files are displayed
- **Verification Warning**: Prompts user to verify the correct file
- **Garbage In, Garbage Out Notice**: Warns about anchoring incorrect files
- **Two Action Buttons**:
  - Cancel: Closes modal and resets
  - Anchor to Dtrust: Proceeds with anchoring

## Theme

**Primary Color**: Green (`#059669`) for professional, secure feel

- No Dtrust branding (neutral for organizations)
- Clean, minimalist design
- Focus on functionality

## Running Locally

```bash
# From the root of the monorepo
pnpm dev:issuer

# Or from this directory
pnpm dev
```

The portal will be available at: **http://localhost:3002**

**Note**: Port changed from 3000 to 3002.

## Technology

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Web Crypto API** for client-side hashing

## Environment Variables

Configure in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Components

### Button

Reusable button with variants:

- `default`: Solid green background
- `destructive`: Solid red background
- `outline`: Transparent with border

### Card

Container component with header, title, and content sections.

### Layout

Main layout with header and navigation (no branding).

### FileUploader

Drag-and-drop file uploader with:

- Client-side SHA-256 hashing
- Modal preview trigger
- Success/error feedback

### FilePreviewModal

Preview modal that shows:

- File details (name, size, type, hash)
- Visual preview (for images and text files)
- Verification warnings
- "Garbage in, garbage out" notice
- Cancel and "Anchor to Dtrust" buttons

## API Integration

### Anchor Document

```typescript
POST http://localhost:3001/api/v1/anchor
Headers: { Content-Type: application/json }
Body: { hash, fileName, fileSize }
```

### Get History

```typescript
GET http://localhost:3001/api/v1/anchor/history
```

## Security & Privacy

- **No Authentication Required**: Direct organization access
- **Client-Side Hashing**: Files never uploaded
- **Preview Modal**: Verification before anchoring
- **Multiple Warnings**: About data integrity
- **Immutable Records**: Once anchored, cannot be changed

## File Preview Support

The modal supports previews for:

- **Images**: JPG, PNG, GIF, WebP, SVG
- **Text Files**: TXT, MD, JSON, and other text-based formats
- **Unsupported Types**: Shows placeholder with file info

## Workflow

1. User drops or selects a file
2. File is hashed using SHA-256 (client-side)
3. Preview modal opens showing:
   - File details and hash
   - Visual preview (if supported)
   - Verification warnings
4. User reviews and confirms
5. Hash is sent to backend
6. Transaction ID is returned
7. Success message displayed

## Key Differences from Original

✅ **Removed authentication** - No login required
✅ **Removed Dtrust branding** - Neutral for organizations
✅ **Added preview modal** - Review before anchoring
✅ **Added verification prompts** - Ensure correct file
✅ **Changed port** - Now runs on 3002
✅ **Simplified routes** - Direct `/` and `/anchor` pages

## Contributing

See the main monorepo README for contribution guidelines.

## License

© 2025 All rights reserved.
