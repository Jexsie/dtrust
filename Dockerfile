# Multi-stage Dockerfile for Dtrust API

# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client
RUN npm run prisma:generate

# Build TypeScript code
RUN npm run build

# Stage 2: Production
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy Prisma schema and migrations
COPY --from=builder /app/prisma ./prisma

# Copy built code
COPY --from=builder /app/dist ./dist

# Copy node_modules with Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Run the application
CMD ["node", "dist/server.js"]

