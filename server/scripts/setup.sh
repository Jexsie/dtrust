#!/bin/bash

# Dtrust API Setup Script
# This script helps set up the development environment

set -e

echo "==================================="
echo "Dtrust API - Setup Script"
echo "==================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✓ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found."
    echo "Please create a .env file with the following variables:"
    echo ""
    echo "DATABASE_URL=\"postgresql://username:password@localhost:5432/dtrust_db?schema=public\""
    echo "PORT=3000"
    echo "NODE_ENV=development"
    echo "HEDERA_ACCOUNT_ID=\"0.0.12345\""
    echo "HEDERA_PRIVATE_KEY=\"your_private_key_here\""
    echo "HCS_TOPIC_ID=\"0.0.67890\""
    echo "HEDERA_NETWORK=\"testnet\""
    echo ""
else
    echo "✓ .env file found"
fi

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npm run prisma:generate
echo "✓ Prisma client generated"
echo ""

echo "==================================="
echo "Setup complete! 🎉"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Make sure your .env file is configured correctly"
echo "2. Ensure PostgreSQL is running"
echo "3. Run 'npm run prisma:migrate' to create the database schema"
echo "4. Run 'npm run dev' to start the development server"
echo ""

