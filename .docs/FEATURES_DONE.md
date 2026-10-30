# Features Done

## 2026-10-24 — Móng kỹ thuật (chưa có tính năng)
- **Làm gì:** Backend: env zod, ValidationPipe, AllExceptionsFilter (định dạng lỗi chuẩn, map lỗi Prisma), API `/api/v1`, Swagger `/api/docs` tự sinh, helmet, rate limit, health check có ping DB, `app.setup.ts` dùng chung cho main + e2e. Frontend: env zod, `apiServer`/`apiClient`, `ApiError`, shadcn/ui, error boundary, font tiếng Việt. Docker chạy user `node`, service `migrate` cho prod, DB `xoidich_test`. Tooling: `pnpm check`, husky (commitlint + pre-push), giới hạn 200 dòng/file.
- **File chính:** `apps/backend/src/{app.setup.ts,app.module.ts,config/,common/,modules/health/}`, `apps/frontend/lib/`, `.agent/AGENTS.md`, `.docs/HOW_TO_NEW_FEATURE.md`
- **DB/API thay đổi:** Chưa có model (schema rỗng, chưa có migration). Endpoint duy nhất: `GET /api/health`.
- **Còn dở / TODO:** Viết `.docs/IDEA.md` → chạy /system-planner để lên tính năng đầu tiên (kể cả auth nếu cần).

## 2026-10-24 — Khởi tạo dự án
- **Làm gì:** Scaffold monorepo pnpm: Next.js 16 frontend, NestJS 12 backend, Prisma 7 + PostgreSQL, Docker dev/prod.
- **File chính:** `docker-compose.yml`, `apps/*/Dockerfile`, `apps/backend/src/prisma/`, `apps/backend/prisma/schema.prisma`
- **DB/API thay đổi:** (đã thay bởi mục móng kỹ thuật ở trên)
- **Còn dở / TODO:** Viết IDEA.md → chạy /plan.
