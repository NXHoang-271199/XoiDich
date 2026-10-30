# XoiDich — backend

NestJS 12 (REST, `/api/v1`) + Prisma 7 + PostgreSQL + Redis.

| Lệnh (trong thư mục này) | Làm gì |
|---|---|
| `pnpm dev` | Chạy có tự reload |
| `pnpm test` / `pnpm test:e2e` | Unit test / e2e test (DB `xoidich_test`) |
| `pnpm exec prisma migrate dev --name <tên>` | Tạo + áp migration |

Swagger: http://localhost:4000/api/docs. Cách chạy cả dự án, kiến trúc và quy ước: [README gốc](../../README.md), [`.docs/ARCHITECTURE.md`](../../.docs/ARCHITECTURE.md).
