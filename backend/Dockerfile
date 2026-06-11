# Backend
# =====================
# Build
# =====================
FROM registry.access.redhat.com/ubi9/nodejs-20 AS builder

USER root
RUN mkdir -p /app && chown -R 1001:0 /app
USER 1001
WORKDIR /app

COPY --chown=1001:0 package.json yarn.lock ./
RUN npm install -g yarn \
 && yarn install --frozen-lockfile

COPY --chown=1001:0 . .

# Generate the Prisma client into node_modules, then compile TypeScript
RUN yarn prisma:generate
RUN yarn build

# =====================
# Runtime
# =====================
FROM registry.access.redhat.com/ubi9/nodejs-20 AS runner

WORKDIR /app

ENV NODE_ENV=production

USER root
RUN mkdir -p /app && chown -R 1001:0 /app
COPY --from=builder --chown=1001:0 /app/ ./

# Writable folders for sessions, logs and the SQLite database
RUN mkdir -p /app/data/sessions /app/data/logs /app/data/database \
 && chown -R 1001:0 /app/data
USER 1001

EXPOSE 3000
ENV PORT=3000

# Apply pending Prisma migrations at startup, then start the server.
# Call the Prisma binary directly so yarn isn't needed in the runtime image.
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node ./dist/server.js"]
