# Build Stage
FROM node:20 AS builder
WORKDIR /app

# # Install pnpm globally
RUN npm install -g pnpm

# Copy package files first for dependency caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy Prisma files & source
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY . .

# Copy .env temporarily for Prisma generation
COPY .env.production .env

# Generate Prisma client (reads DATABASE_URL from .env)
RUN pnpm prisma:generate

# Build NestJS app
RUN pnpm build

# Remove .env to keep image clean
RUN rm -f .env

# ===================================
# Production Stage
FROM node:20-alpine AS production
WORKDIR /app

# Copy build output & node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Environment
ENV NODE_ENV=production
EXPOSE 5000

# Start the app
CMD ["pnpm", "start:docker"]


# ====================================
#  Base Image
# FROM node:20 AS base
# WORKDIR /app

# # Install pnpm globally
# RUN npm install -g pnpm

# # Dependencies Stage
# FROM base AS deps

# # Copy only package files for better caching
# COPY package.json pnpm-lock.yaml ./
# COPY prisma ./prisma
# COPY prisma.config.ts ./

# RUN pnpm install --frozen-lockfile

# # Build Stage
# FROM base AS builder

# # Copy dependencies
# COPY --from=deps /app/node_modules ./node_modules

# # Copy source
# COPY . .

# # # Copy .env temporarily for Prisma generation
# COPY .env.production .env

# # Prisma generate (no need to copy .env into image)
# RUN pnpm prisma generate

# # Build app
# RUN pnpm build

# # # Remove .env to keep image clean
# RUN rm -f .env

# # =========================
# # Production Stage
# FROM node:20 AS production

# WORKDIR /app

# # Install pnpm
# RUN npm install -g pnpm

# # Copy only necessary files
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/prisma ./prisma

# # Environment
# ENV NODE_ENV=production
# EXPOSE 5000

# # Start the app
# CMD ["npm", "run", "start:docker"]