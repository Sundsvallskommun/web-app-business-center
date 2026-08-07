# Backend
# =====================
# Install dependencies only when needed
# =====================
FROM node:22-slim AS build-deps
# openssl is required by Prisma's query engine
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Install only the packages needed by the running service. Prisma remains a
# production dependency because migrations are deliberately applied at startup.
FROM node:22-slim AS production-deps
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY package.json yarn.lock ./
COPY prisma ./prisma
RUN yarn install --frozen-lockfile --production=true --ignore-scripts \
 && yarn prisma:generate \
 && yarn cache clean

# =====================
# Rebuild the source code only when needed
# =====================
FROM node:22-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build-deps /app/node_modules ./node_modules
COPY . .

# Generate the Prisma client into node_modules, then compile TypeScript
RUN yarn prisma:generate \
 && yarn build

# =====================
# Production image
# =====================
FROM node:22-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nodejs

COPY --from=production-deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Guard against accidentally reintroducing build and test tooling in production,
# then create the only runtime-writable folders.
RUN test ! -e /app/node_modules/typescript \
 && test ! -e /app/node_modules/vitest \
 && test ! -e /app/node_modules/ts-node \
 && test -x /app/node_modules/.bin/prisma \
 && mkdir -p /app/data/sessions /app/data/logs /app/data/database \
 && chown -R nodejs:nodejs /app/data

USER nodejs

EXPOSE 3000
ENV PORT=3000

# Apply pending Prisma migrations at startup, then start the server.
# Call the Prisma binary directly so yarn isn't needed in the runtime image.
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node ./dist/server.js"]
