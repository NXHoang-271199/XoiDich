# Local backend (docker-compose.yml). Build context: repo root.
# Source is bind-mounted; nest --watch reloads on every change.
FROM node:24-alpine
# The whole project runs on Vietnam time
ENV TZ=Asia/Ho_Chi_Minh
RUN corepack enable && mkdir /repo && chown node:node /repo
# Run as the unprivileged `node` user (uid 1000), so files written into
# bind-mounted source folders stay owned by the developer, not root.
USER node
WORKDIR /repo

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node apps/backend/package.json apps/backend/
RUN pnpm install --frozen-lockfile --filter backend...

COPY --chown=node:node apps/backend apps/backend
WORKDIR /repo/apps/backend
EXPOSE 4000
CMD ["sh", "-c", "pnpm exec prisma generate && pnpm exec prisma migrate deploy && pnpm dev"]
