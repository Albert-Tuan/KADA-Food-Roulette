# Multi-stage Dockerfile for Food Roulette Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests and Prisma schema
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/

WORKDIR /app/backend
RUN npm ci
RUN npx prisma generate

# Copy application source
COPY backend/ ./

# Build TypeScript to JavaScript (dist/)
RUN npm run build

# Prune devDependencies for runtime
RUN npm prune --production

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules, compiled dist, and prisma from builder stage
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/index.js"]
