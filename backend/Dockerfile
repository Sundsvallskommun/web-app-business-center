# Backend
# =====================
# Install dependencies only when needed
# =====================
FROM node:22-slim AS deps
# openssl is required by Prisma's query engine
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# =====================
# Rebuild the source code only when needed
# =====================
FROM node:22-slim AS builder
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate the Prisma client into node_modules, then compile TypeScript
RUN yarn prisma:generate
RUN yarn build

# =====================
# Production image
# =====================
FROM node:22-slim AS runner
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/ ./

# Writable folders for sessions, logs and the SQLite database
RUN mkdir -p /app/data/sessions /app/data/logs /app/data/database \
 && chown -R nodejs:nodejs /app/data

USER nodejs

EXPOSE 3000
ENV PORT=3000

# Apply pending Prisma migrations at startup, then start the server.
# Call the Prisma binary directly so yarn isn't needed in the runtime image.
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node ./dist/server.js"]
