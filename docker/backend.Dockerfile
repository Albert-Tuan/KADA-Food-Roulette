# Multi-stage Dockerfile for Food Roulette Backend
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including devDependencies for build
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy application source
COPY . .

# Build TypeScript to JavaScript (dist/)
RUN npm run build

# Prune devDependencies for runtime
RUN npm prune --production

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules, compiled dist, and prisma from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/index.js"]
