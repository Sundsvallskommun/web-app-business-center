# Backend
# =====================
# Dependencies
# =====================
# node:22-slim already ships Yarn 1.22, so Yarn must not be installed again.
FROM node:22-slim AS deps

WORKDIR /app
COPY --chown=1001:0 package.json yarn.lock ./

# Lifecycle scripts are disabled: nothing in this project needs an install script, and it stops
# dependencies from running arbitrary code or phoning home during the build.
RUN yarn install --frozen-lockfile --ignore-scripts --network-timeout 600000

# =====================
# Build
# =====================
FROM node:22-slim AS builder

WORKDIR /app
COPY --from=deps --chown=1001:0 /app/node_modules ./node_modules
COPY --chown=1001:0 . .

# tsc + tsc-alias. A failing build must fail the image build.
RUN yarn build

# Keep only production dependencies for the runtime image.
RUN rm -rf node_modules \
 && yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline --network-timeout 600000

# =====================
# Runtime
# =====================
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Application files are never written at runtime: left root-owned and read-only for the app user.
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# The only runtime writes are rotating log files under /app/data/logs (and ./data/sessions when
# REDIS_HOST is unset, which is not the case in OpenShift). Sessions and the gateway token live in
# Redis, so the pod needs no volume and can run with several replicas.
# OpenShift runs the container as an arbitrary UID in group 0, so group write is required.
# UID 1001 is used numerically (node:22-slim has no account for it), which USER and chown accept.
RUN mkdir -p /app/data \
 && chown 1001:0 /app/data \
 && chmod g+w /app/data

USER 1001

EXPOSE 3000

CMD ["node", "dist/server.js"]
