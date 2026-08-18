# Multi-stage Dockerfile for Food Roulette Backend
FROM node:22-alpine AS builder

RUN apk add --no-cache openssl

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

FROM builder AS migrator

CMD ["npm", "run", "db:migrate"]

FROM builder AS production-deps

# Prune devDependencies for runtime
RUN npm prune --omit=dev

# Production Runner Stage
FROM node:22-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules, compiled dist, and prisma from builder stage
COPY --from=production-deps /app/package*.json ./
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/index.js"]
