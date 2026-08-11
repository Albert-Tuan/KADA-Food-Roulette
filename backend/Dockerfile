# syntax=docker/dockerfile:1.6

# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# Install build deps (Prisma needs openssl at build time too, just in case)
RUN apk add --no-cache openssl

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npm ci
RUN npx prisma generate
RUN npm run build

# Stage 2: Runner (production)
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl wget \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

ENV NODE_ENV=production \
    PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
