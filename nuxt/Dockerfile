# syntax=docker/dockerfile:1
# Stage 1: Dependencies (better layer caching)
FROM node:22-alpine AS deps

WORKDIR /app

# Copy only package files first - this layer caches unless package*.json changes
COPY package.json package-lock.json ./

# Install all dependencies (needed for build)
RUN npm install

# Stage 2: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy package files (needed for build scripts)
COPY package.json package-lock.json ./

# Copy source code
COPY . .

# Build with inline environment variables for smaller production output
RUN NODE_ENV=production npm run build

# Stage 3: Production (minimal image)
FROM node:22-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

# Copy only the built output
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./output

# Create cache directory with correct permissions
RUN mkdir -p /app/.image-cache && chown nuxtjs:nodejs /app/.image-cache

USER nuxtjs

EXPOSE 3000

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

# Use exec form for proper signal handling
CMD ["node", "output/server/index.mjs"]
