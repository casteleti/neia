FROM node:22-bookworm-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/* && corepack enable
WORKDIR /workspace
COPY . .
ENV DATABASE_URL=postgresql://nepi:nepi_local@localhost:5432/nepi?schema=public
RUN pnpm install --frozen-lockfile
RUN pnpm build
RUN mkdir -p /home/node/.cache && if [ -d /root/.cache/prisma ]; then cp -a /root/.cache/prisma /home/node/.cache/prisma; fi && chown -R node:node /workspace /home/node/.cache

FROM builder AS runtime
ENV NODE_ENV=development
EXPOSE 5173 3001
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 CMD node -e "fetch('http://127.0.0.1:3001/health/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
USER node
CMD ["sh", "-c", "pnpm db:migrate && pnpm db:seed && pnpm dev"]
