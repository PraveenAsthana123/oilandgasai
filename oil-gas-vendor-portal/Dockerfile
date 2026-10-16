FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max_old_space_size=4096"
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S ogvgroup && adduser -S ogvuser -G ogvgroup
COPY --from=builder --chown=ogvuser:ogvgroup /app/.next/standalone ./
COPY --from=builder --chown=ogvuser:ogvgroup /app/.next/static ./.next/static
COPY --from=builder --chown=ogvuser:ogvgroup /app/public ./public
USER ogvuser
EXPOSE 8386
ENV PORT=8386
ENV HOSTNAME=0.0.0.0
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:8386/api/health || exit 1
CMD ["node", "server.js"]
