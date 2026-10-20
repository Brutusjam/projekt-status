FROM node:22-bookworm-slim AS base
RUN apt-get update && apt-get install -y openssl ca-certificates gosu \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

FROM base AS prod-deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# Runtime: App-Deps + Seed (tsx) und PDF (playwright)
RUN npm ci --omit=dev \
  && npm install --ignore-scripts tsx@4.23.0 dotenv@17.4.2 playwright@1.61.1 \
  && npm cache clean --force

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL="file:/data/projektcockpit.db"
WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs \
  && mkdir -p /data /ms-playwright

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma migrate + Seed
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/app/generated ./app/generated
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Volle Runtime-node_modules (Prisma CLI, Adapter, Playwright, tsx)
COPY --from=prod-deps /app/node_modules ./node_modules

COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && npx playwright install --with-deps chromium \
  && chown -R nextjs:nodejs /app /data /ms-playwright

EXPOSE 3000

# Entry als root: Volume-Rechte setzen, dann nextjs
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
