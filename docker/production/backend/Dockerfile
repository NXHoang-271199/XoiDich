# Production backend image, built by CI (.gitlab-ci.yml). Build context: repo root.
# Contains the compiled app, production dependencies, the production .env (CI copies
# PRODUCTION_ENV_FILE to apps/backend/.env before building, like yoslot) and the Prisma CLI + migrations,
# so the deploy step can run `npx prisma migrate deploy` with this same image
# (like yoslot's `php artisan migrate --force`).
FROM node:24-alpine AS build
ENV TZ=Asia/Ho_Chi_Minh
RUN corepack enable && mkdir /repo && chown node:node /repo
USER node
WORKDIR /repo
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node apps/backend/package.json apps/backend/
RUN pnpm install --frozen-lockfile --filter backend...
COPY --chown=node:node apps/backend apps/backend
RUN pnpm --filter backend build \
 && pnpm --filter backend deploy --prod --legacy /tmp/out \
 && cp -r apps/backend/dist /tmp/out/dist \
 && cp apps/backend/.env /tmp/out/.env \
 && cd /tmp/out && rm -rf src test vitest.config*.ts tsconfig*.json nest-cli.json README.md *.tsbuildinfo

FROM node:24-alpine
ENV TZ=Asia/Ho_Chi_Minh NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /tmp/out .
USER node
EXPOSE 4000
CMD ["node", "dist/main.js"]
