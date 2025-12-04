# Multi-stage build for Next.js application

############################
# Stage 1: Dependencies
############################
FROM node:22-slim AS deps
WORKDIR /app

# Ensure npm installs all optional deps and runs scripts
ENV npm_config_optional=true
ENV npm_config_ignore_scripts=false
ENV npm_config_fund=false
ENV npm_config_audit=false
ENV npm_config_update_notifier=false

# Copy package files
COPY package.json package-lock.json* ./

# Remove host-specific lockfile and install fresh for Linux,
# then force-install native bindings for lightningcss + Tailwind Oxide
RUN rm -f package-lock.json \
  && npm install \
  && npm install --no-save lightningcss-linux-x64-gnu @tailwindcss/oxide-linux-x64-gnu

############################
# Stage 2: Builder
############################
FROM node:22-slim AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables (baked into the build)
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_BACKEND_URL

ENV NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
ENV NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}

# Build Next.js application
RUN npm run build

############################
# Stage 3: Runtime
############################
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app

USER nextjs

ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8080) + '/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
