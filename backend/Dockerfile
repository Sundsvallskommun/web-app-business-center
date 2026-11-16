# Backend
# =====================
# Install dependencies only when needed
# =====================
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# =====================
# Rebuild the source code only when needed
# =====================
FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

# =====================
# Production image
# =====================
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/ ./

# Writable folders for sessions and logs
RUN mkdir -p /app/data/sessions /app/data/logs \
 && chown -R nodejs:nodejs /app/data

USER nodejs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "./dist/server.js"]
