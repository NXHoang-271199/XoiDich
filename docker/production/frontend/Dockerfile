# Production frontend image, built by CI (.gitlab-ci.yml). Build context: repo root.
# NEXT_PUBLIC_API_URL is baked into the browser bundle at build time.
FROM node:24-alpine AS build
ENV TZ=Asia/Ho_Chi_Minh
RUN corepack enable && mkdir /repo && chown node:node /repo
USER node
WORKDIR /repo
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node apps/frontend/package.json apps/frontend/
RUN pnpm install --frozen-lockfile --filter frontend...
ARG NEXT_PUBLIC_API_URL=http://localhost/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --chown=node:node apps/frontend apps/frontend
RUN pnpm --filter frontend build

FROM node:24-alpine AS prod
ENV TZ=Asia/Ho_Chi_Minh NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /repo/apps/frontend/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build --chown=node:node /repo/apps/frontend/public ./apps/frontend/public
USER node
EXPOSE 3000
CMD ["node", "apps/frontend/server.js"]
