# =====================
# Build
# =====================
FROM registry.access.redhat.com/ubi9/nodejs-24 AS builder

USER root
RUN mkdir -p /app && chown -R 1001:0 /app
USER 1001
WORKDIR /app

COPY --chown=1001:0 package.json yarn.lock ./
RUN npm install -g yarn \
 && yarn install --frozen-lockfile

COPY --chown=1001:0 . .
COPY --chown=1001:0 .env-cicd .env.local

ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=true

RUN yarn build

# =====================
# Runtime
# =====================
FROM registry.access.redhat.com/ubi9/nodejs-24 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy everything as root-owned and read-only.
# next.config.js is not copied: standalone output serializes the resolved config
# into server.js, and evaluating the file here would require dev-only plugins.
COPY --from=builder --chown=0:0 --chmod=555 /app/public ./public
COPY --from=builder --chown=0:0 --chmod=444 /app/package.json ./
COPY --from=builder --chown=0:0 --chmod=555 /app/.next/standalone ./
COPY --from=builder --chown=0:0 --chmod=555 /app/.next/static ./.next/static

# Grant write where entrypoint.sh needs to replace placeholders.
# ug+w (not just g+w) so it works whether the container runs as the file owner
# (uid 1001, e.g. Dokploy) or as an arbitrary uid in the root group (OpenShift).
USER root
RUN chown 1001:0 /app && chown 1001:0 /app/server.js && chmod ug+w /app/server.js \
 && chown -R 1001:0 /app/.next && chmod -R ug+w /app/.next
USER 1001

# Entrypoint — fix line endings before locking permissions
COPY --chown=0:0 entrypoint.sh ./
RUN sed -i 's/\r$//' ./entrypoint.sh && chmod 0555 ./entrypoint.sh

USER 1001

EXPOSE 3000
ENV PORT=3000

ENTRYPOINT ["/app/entrypoint.sh"]
