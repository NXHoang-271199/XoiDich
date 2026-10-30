# Local frontend (docker-compose.yml). Build context: repo root.
# Source is bind-mounted; next dev reloads on every change.
FROM node:24-alpine
# The whole project runs on Vietnam time
ENV TZ=Asia/Ho_Chi_Minh
RUN corepack enable && mkdir /repo && chown node:node /repo
# Run as the unprivileged `node` user (uid 1000), so files written into
# bind-mounted source folders stay owned by the developer, not root.
USER node
WORKDIR /repo

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node apps/frontend/package.json apps/frontend/
RUN pnpm install --frozen-lockfile --filter frontend...

COPY --chown=node:node apps/frontend apps/frontend
# Pre-create so the anonymous volume for .next is owned by `node`
RUN mkdir -p apps/frontend/.next
WORKDIR /repo/apps/frontend
EXPOSE 3000
CMD ["pnpm", "dev", "--hostname", "0.0.0.0"]
