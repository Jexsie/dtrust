# Installation Guide

## Prerequisites

1. Node.js >= 20.0.0
2. pnpm >= 10.0.0

## Build the Extension

From the root of the monorepo:

```bash
# Install dependencies
pnpm install

# Build the extension
pnpm build:extension

# Or build in watch mode for development
pnpm dev:extension
```

## Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `apps/verifier-extension/dist` directory

## Icon Setup

The extension requires icons at:

- `public/icons/icon16.png` (16x16 pixels)
- `public/icons/icon48.png` (48x48 pixels)
- `public/icons/icon128.png` (128x128 pixels)

You can create placeholder icons or use any PNG images with the correct dimensions.

## Configuration

The extension is configured to connect to:

- **Verification API**: `http://localhost:3001/api/v1/verify`

To change this, update the `DTRUST_VERIFY_URL` constant in:

- `src/background/background.ts`
- `src/content/content.ts`

## Testing

1. Build the extension
2. Load it in Chrome
3. Visit any webpage with:
   - File links (PDFs, ZIPs, etc.)
   - Product SKUs (`itemprop="sku"` or `data-product-id`)
   - Custom DTRUST attributes (`data-dtrust-asset`)

The extension will automatically scan and verify assets, showing status icons next to detected elements.
