# Dtrust Verifier Extension

Chrome extension for zero-interaction verification of assets and products on the web.

## Features

- **Universal Scanning**: Automatically scans web pages for verifiable assets
- **Zero-Interaction**: Works in the background without user intervention
- **Multiple Asset Types**: Supports file URLs, product IDs, and custom attributes
- **Real-time Verification**: Verifies assets against the DTRUST network

## Development

```bash
# Install dependencies (from root)
pnpm install

# Build extension
pnpm --filter verifier-extension build

# Watch mode
pnpm --filter verifier-extension dev
```

## Installation

1. Build the extension: `pnpm --filter verifier-extension build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `apps/verifier-extension/dist` directory

## Asset Detection

The extension automatically detects:

1. **File Links**: Links to PDFs, EPUBs, ZIPs, MP4s, certificates, etc.
2. **Product Identifiers**: Elements with `itemprop="sku"` or `data-product-id`
3. **Custom Attributes**: Elements with `data-dtrust-asset` attribute

## Status Icons

- 🟢 Green: Verified on-chain
- 🔴 Red: Not verified
- 🟠 Orange: File too large (>20MB)
- ⚪ Gray: Pending verification
