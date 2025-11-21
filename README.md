# Dtrust

**Trust Less. Verify More.**

A decentralized document verification platform built on the Hedera Hashgraph network. Dtrust enables organizations to anchor cryptographic proofs of their documents onto the Hedera Consensus Service (HCS), creating an immutable, tamper-proof record that can be verified by anyone, anywhere, without compromising privacy.

## 🌐 Live Demos

- **Verifier Portal**: [https://dtrust-verifier.jexsie.com/](https://dtrust-verifier.jexsie.com/) - Public document verification tool
- **Issuer Portal**: [https://dtrust-issuer.jexsie.com/](https://dtrust-issuer.jexsie.com/) - Document anchoring dashboard for organizations

## 📖 About the Project

Dtrust is a comprehensive document verification ecosystem that combines the power of blockchain technology with privacy-first design. It allows organizations to create cryptographic proofs of their documents on the Hedera distributed ledger while ensuring that sensitive document content never leaves the user's device.

### Core Philosophy

- **Privacy-First**: Documents are hashed locally in the browser—no files are ever uploaded to servers
- **Decentralized Trust**: Verification relies on the immutable Hedera Consensus Service, not a central authority
- **Non-Custodial**: Organizations maintain full control of their cryptographic keys
- **Zero-Knowledge**: The system only stores document hashes, never the actual content

## 🎯 What It Does

Dtrust provides a complete solution for document authenticity verification:

1. **Document Anchoring**: Organizations can anchor document hashes to the Hedera network, creating an immutable proof of existence and authenticity
2. **Public Verification**: Anyone can verify if a document has been anchored without needing authentication or uploading files
3. **Identity Management**: DID-based organization identification with cryptographic signature verification
4. **Trust Registry**: Smart contract integration for verifying trusted issuers
5. **Browser Extension**: Zero-interaction verification of assets and products on the web

## 🏗️ How It Works

### Architecture Overview

Dtrust consists of three main applications:

1. **Backend API Server** (`/server`): RESTful API for anchoring and verification
2. **Issuer Portal** (`/apps/issuer-portal`): Dashboard for organizations to anchor documents
3. **Verifier Portal** (`/apps/verifier-portal`): Public-facing verification tool
4. **Browser Extension** (`/apps/verifier-extension`): Chrome extension for automatic asset verification

### Document Anchoring Flow

1. **Client-Side Hashing**: Document is hashed locally using SHA-256 (Web Crypto API)
2. **Cryptographic Signing**: Organization signs the hash with their private key (Ed25519)
3. **Signature Verification**: Server verifies the signature using the DID's public key from Hedera network
4. **HCS Submission**: Verified proof (hash, DID, signature) is submitted to Hedera Consensus Service
5. **Database Indexing**: Proof is stored in PostgreSQL for fast lookups

### Document Verification Flow

1. **Client-Side Hashing**: User's document is hashed locally (privacy-preserving)
2. **Hash Submission**: Only the hash is sent to the server (file never uploaded)
3. **Database Lookup**: Fast indexed lookup in PostgreSQL (sub-second response)
4. **Cryptographic Verification**: Signature is verified against Hedera network records
5. **Trust Check**: Issuer is verified against the trusted issuer registry
6. **Result Return**: Verification status and proof details are returned

### Security Features

- **Multi-Layer Authentication**: API key + cryptographic signature verification
- **Non-Custodial Keys**: Private keys never touch the server
- **DID-Based Identity**: Hedera DID (Decentralized Identifier) for organization identification
- **Signature Verification**: Cryptographic proof of ownership before anchoring
- **Privacy-Preserving**: Hash-only verification (no file uploads)

## 💼 Use Cases

Dtrust is designed for a wide range of document verification scenarios:

### Academic & Education

- **Degree Verification**: Universities can anchor diplomas and certificates
- **Transcript Authentication**: Verify academic transcripts without contacting institutions
- **Credential Verification**: Employers can instantly verify candidate qualifications

### Legal & Compliance

- **Contract Verification**: Prove contract existence and integrity
- **Legal Document Authentication**: Verify legal documents and agreements
- **Compliance Records**: Maintain tamper-proof compliance documentation

### Business & Finance

- **Invoice Verification**: Verify invoice authenticity and prevent fraud
- **Financial Document Proof**: Anchor financial statements and reports
- **Business Record Keeping**: Immutable business record verification

### Healthcare

- **Medical Certificate Verification**: Verify medical certificates and licenses
- **Prescription Authentication**: Verify prescription authenticity
- **Health Record Proof**: Anchor health records for verification

### Government & Public Sector

- **License Verification**: Verify business licenses and permits
- **Identity Document Proof**: Anchor identity documents securely
- **Public Record Verification**: Verify public records and documents

### Supply Chain & Logistics

- **Product Authentication**: Verify product certificates and authenticity
- **Shipping Document Verification**: Verify shipping and customs documents
- **Quality Certificate Proof**: Anchor quality assurance certificates

## 🚀 Future Improvements & Ideas

### Short-Term (Next Sprint)

- **Multi-Network Support**: Support for Hedera mainnet, testnet, and previewnet
- **Rate Limiting**: API endpoint rate limiting for abuse prevention
- **Webhook Support**: Event webhooks for anchoring and verification events
- **Batch Operations**: Batch anchoring for multiple documents at once

### Medium-Term (Next Quarter)

- **Mobile Applications**: Native iOS and Android apps for document verification
- **QR Code Verification**: Generate and scan QR codes for instant verification
- **Advanced Analytics Dashboard**: Detailed analytics for organizations
- **SDK Releases**: Official SDKs for popular languages (Python, JavaScript, Go, Rust)
- **API Versioning**: Proper API versioning strategy for backward compatibility

### Long-Term (Next 6 Months)

- **Smart Contract Automation**: Automated smart contract interactions for trust registry
- **Cross-Chain Support**: Integration with other blockchain networks
- **IPFS Integration**: Optional IPFS storage for document metadata
- **Zero-Knowledge Proofs**: Advanced privacy features using ZK proofs
- **Marketplace Ecosystem**: Marketplace for verified document services
- **Multi-Signature Support**: Support for multi-signature document anchoring
- **Document Templates**: Pre-configured templates for common document types
- **Automated Compliance**: Automated compliance checking and reporting

### Innovative Ideas

- **AI-Powered Document Analysis**: Automatic document type detection and metadata extraction
- **Blockchain Notarization**: Full notarization services on-chain
- **Decentralized Storage**: Integration with decentralized storage solutions
- **NFT Integration**: Convert verified documents into NFTs for ownership proof
- **Time-Stamping Service**: Precise timestamping for document creation
- **Document Lifecycle Tracking**: Track document changes and versions
- **Multi-Language Support**: Internationalization for global adoption
- **Accessibility Features**: Enhanced accessibility for users with disabilities

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Hedera Hashgraph (HCS, DID)
- **Cryptography**: Ed25519 signatures, SHA-256 hashing

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Crypto**: Web Crypto API

### Infrastructure

- **Package Manager**: pnpm (monorepo)
- **Build System**: TypeScript, esbuild
- **Extension**: Chrome Extension (Manifest V3)

## 📦 Project Structure

```
dtrust/
├── apps/
│   ├── issuer-portal/          # Document anchoring dashboard
│   ├── verifier-portal/         # Public verification portal
│   └── verifier-extension/      # Chrome extension for auto-verification
├── server/                      # Backend API server
│   ├── src/
│   │   ├── api/                 # API routes, controllers, middleware
│   │   ├── services/            # Business logic services
│   │   └── config/              # Configuration
│   └── prisma/                  # Database schema and migrations
└── contracts/                   # Smart contracts
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Hedera testnet/mainnet account with HCS topic
- pnpm package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd dtrust
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your actual values
```

4. Set up the database:

```bash
cd server
pnpm prisma generate
pnpm prisma migrate dev
```

5. Run the applications:

```bash
# Backend API
pnpm dev:server

# Issuer Portal
pnpm dev:issuer

# Verifier Portal
pnpm dev:verifier
```

## 📚 Documentation

- [Server API Documentation](./server/API_DOCUMENTATION.md)
- [Server Quick Start Guide](./server/QUICK_START.md)
- [Issuer Portal README](./apps/issuer-portal/README.md)
- [Verifier Portal README](./apps/verifier-portal/README.md)
- [Browser Extension README](./apps/verifier-extension/README.md)
- [Improvements Summary](./IMPROVEMENTS_SUMMARY.md)

## 🔐 Security

Dtrust implements multiple layers of security:

- **Non-Custodial Key Management**: Private keys never leave the client
- **Cryptographic Verification**: All operations require cryptographic proof
- **Privacy-First Design**: Documents are hashed locally, never uploaded
- **DID-Based Identity**: Decentralized identifiers for organizations
- **Signature Verification**: Multi-layer authentication system
- **Trust Registry**: Smart contract-based issuer verification

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🔗 Links

- **Verifier Portal**: [https://dtrust-verifier.jexsie.com/](https://dtrust-verifier.jexsie.com/)
- **Issuer Portal**: [https://dtrust-issuer.jexsie.com/](https://dtrust-issuer.jexsie.com/)
- **Hedera Hashgraph**: [https://hedera.com/](https://hedera.com/)

---

**Built with ❤️ on Hedera Hashgraph**
