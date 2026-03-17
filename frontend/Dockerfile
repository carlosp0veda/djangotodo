# Stage 1: Dependencies
FROM node:20-bookworm-slim AS deps

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-bookworm-slim AS builder

WORKDIR /app
RUN corepack enable pnpm

COPY --from=deps /app/node_modules ./node_modules
# Relying on a strict .dockerignore here
COPY . .

ARG DJANGO_API_URL
ENV DJANGO_API_URL=${DJANGO_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# Stage 3: Runner
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the public directory (Root owned, read-only for nextjs)
COPY --from=builder /app/public ./public

# Copy the standalone output and static files (Root owned, read-only for nextjs)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Next.js needs write access to .next for caching (ISR, Image Optimization)
# We create the directory explicitly and give ownership ONLY to this directory
RUN mkdir -p .next && chown nextjs:nodejs .next

# Switch to the non-root user
USER nextjs

EXPOSE 3000
ENV PORT=3000

# Add a healthcheck to ensure the Node server is actually responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]