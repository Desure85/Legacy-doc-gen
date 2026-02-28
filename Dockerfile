# syntax=docker/dockerfile:1

# ==============================================================================
# 1. Base Node.js Image
# ==============================================================================
FROM node:20-alpine AS base
WORKDIR /app

# Install system dependencies required for native modules (e.g., better-sqlite3)
RUN apk add --no-cache python3 make g++ 

# ==============================================================================
# 2. Dependencies Stage
# ==============================================================================
FROM base AS deps
COPY package.json package-lock.json* ./
# Install all dependencies (including dev) for building
RUN npm ci

# ==============================================================================
# 3. Builder Stage
# ==============================================================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build the React frontend (Vite)
RUN npm run build

# ==============================================================================
# 4. Production Runner Stage
# ==============================================================================
FROM base AS runner
ENV NODE_ENV=production

# We use Qdrant as the vector database for a 1M+ LOC PHP monolith.
# Why Qdrant?
# 1. Written in Rust: Extremely fast and memory-efficient.
# 2. Local/Docker deployment: No need for expensive cloud vector DBs initially.
# 3. Payload Filtering: Crucial for filtering by branch, language (PHP vs TS), or component (Admin vs API).
# 4. Scalability: Handles millions of vectors easily on a single node.

# Copy built frontend assets
COPY --from=builder /app/dist ./dist
# Copy backend/MCP server files (assuming you have a server.ts)
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/package.json ./

# Install ONLY production dependencies to keep image small
RUN npm ci --omit=dev

# Create directory for local SQLite (metadata) and Qdrant storage (if running locally)
RUN mkdir -p /app/data && chown -R node:node /app/data

USER node

# Expose the port the MCP Control Panel runs on
EXPOSE 3000

# Start the MCP Server and Control Panel
CMD ["npm", "run", "start"]
