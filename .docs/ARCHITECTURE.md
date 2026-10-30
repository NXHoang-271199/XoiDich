# Architecture

> Trạng thái: **chỉ có móng kỹ thuật**, chưa có tính năng nghiệp vụ, chưa có model DB, chưa có auth.

## Tổng quan

| Thành phần | Công nghệ | Port |
|---|---|---|
| Frontend | Next.js 16 (App Router, Cache Components), React 19, Tailwind v4, shadcn/ui (base-nova) | 3000 |
| Backend | NestJS 12 (ESM), REST, prefix `/api`, version `v1` | 4000 |
| Database | PostgreSQL 17 qua Prisma 7 (adapter `pg`) | 5432 |
| Cache/Token store | Redis 8 qua `ioredis` | 6379 |

```
Browser ── Axios + TanStack Query (credentials) ──▶ NestJS (4000) ──▶ Postgres, Redis
   └──▶ Next.js (3000) ── server fetch, forward cookie ──▶ NestJS
```

- Browser gọi backend qua `NEXT_PUBLIC_API_URL` (`http://localhost:4000/api`).
- Server Next.js gọi backend qua `API_INTERNAL_URL` (`http://backend:4000/api` trong Docker — trong container, `localhost` là chính frontend), chuyển tiếp cookie của request.

## Backend

### Cây module
```
AppModule
├── ConfigModule     (global, validate env bằng zod: src/config/env.schema.ts)
├── ThrottlerModule  (100 req/phút/IP, đổi theo route bằng @Throttle)
├── PrismaModule     (global: PrismaService)
├── RedisModule      (global: ioredis client, inject bằng @Inject(REDIS))
└── HealthModule     (GET /api/health — ping Postgres + Redis, không version)
```

### Luồng request
```
Request
  → helmet (header bảo mật), CORS (FRONTEND_URL, credentials)
  → ThrottlerGuard (global)          — 429 nếu vượt giới hạn
  → ValidationPipe (global)          — 400 VALIDATION_FAILED; whitelist + forbidNonWhitelisted + transform
  → Controller → Service → Prisma
  → AllExceptionsFilter (global)     — mọi lỗi thành ErrorBody
```

Cấu hình HTTP nằm trong `src/app.setup.ts` (`configureApp`), dùng chung cho `main.ts` và e2e test → test chạy đúng app như production. Swagger (`/api/docs`) chỉ bật khi `NODE_ENV !== production`.

### Cấu trúc một module
```
src/modules/<domain>/
├── dto/                     # DTO input (class-validator) + DTO response
├── <domain>.controller.ts
├── <domain>.service.ts
├── <domain>.module.ts
└── *.spec.ts                # unit test cạnh file
```
Dùng chung: `src/common/filters/` (`AllExceptionsFilter`), `src/config/` (env).

### Định dạng lỗi
```json
{ "error": { "statusCode": 400, "code": "VALIDATION_FAILED", "message": "Validation failed", "details": ["title must be longer than or equal to 3 characters"] } }
```
`code` = tên HTTP status (`NOT_FOUND`, `CONFLICT`, `TOO_MANY_REQUESTS`...) hoặc `VALIDATION_FAILED`. Lỗi Prisma `P2002` (trùng unique) → 409, `P2025` (không tìm thấy) → 404. Lỗi không xác định → 500, không lộ chi tiết ra client (chỉ ghi log).

Response thành công trả thẳng dữ liệu (không bọc `{ data }`), để Swagger mô tả đúng kiểu trả về.

## Múi giờ
Chỉ dùng giờ Việt Nam: `TZ=Asia/Ho_Chi_Minh` trong Dockerfile (backend, frontend), container Redis, `.env`; Postgres chạy với `timezone=Asia/Ho_Chi_Minh` (`now()`, `CURRENT_DATE` theo giờ VN).
Prisma luôn lưu `DateTime` dạng UTC và trả về `Date` đúng thời điểm — không tự cộng/trừ giờ. Khi cần định dạng ngày: `Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })`.

## Logging
`nestjs-pino` (`src/logger/logger.module.ts`): mỗi dòng log là JSON, có `req.id` riêng cho từng request.
- Console: luôn bật (dev in dạng dễ đọc bằng `pino-pretty`).
- File theo ngày khi có `LOG_DIR`: `app.YYYY-MM-DD.N.log`, sang file mới lúc 0h giờ VN, giữ `LOG_RETENTION_DAYS` ngày (mặc định 30). Dev: `apps/backend/logs/`; prod: `./logs/` ở máy chủ.
- `LOG_LEVEL`: dev `debug`, prod `info`, e2e `silent`.
- Tự che `authorization`, `cookie`, `set-cookie`, `password`, `token` thành `[REDACTED]`. Không ghi log request `/api/health`.
- Trong code: `private readonly logger = new Logger(MyService.name)` (Logger của `@nestjs/common`, đã chuyển qua pino).

## Database
Chưa có model. Thêm theo từng tính năng (xem `HOW_TO_NEW_FEATURE.md`). Quy ước: model PascalCase, bảng/cột snake_case qua `@@map`/`@map`, id `cuid()`.

## Redis
Chỉ chứa dữ liệu tạm, nhỏ, có TTL: blacklist `jti` của JWT (TTL = thời gian sống còn lại của token), bộ đếm/khoá ngắn hạn, cache. Dữ liệu nghiệp vụ luôn ở PostgreSQL. Ghi có điều kiện dùng lệnh nguyên tử (`SET key val NX PX ttl`), không get-rồi-set.

## Auth
Chưa có. Quy chuẩn khi làm: mục 7 trong `.agent/AGENTS.md` (bcrypt 12, jsonwebtoken, blacklist `jti` trong Redis, refresh token trong cookie HttpOnly).

## Frontend
- `lib/env.ts` — env phía server (zod, `server-only`).
- `lib/api/server.ts` — `apiServer()` cho Server Component/Function: chuyển tiếp cookie, `cache: "no-store"`.
- `lib/api/http.ts` — instance Axios `http` cho Client Component (`withCredentials`), dùng bên trong TanStack Query (`useQuery`/`useMutation`). Lỗi → `ApiError`.
- `app/providers.tsx` — `QueryClientProvider` (staleTime 60s, retry 1).
- `hooks/use-debounce.ts` — `useDebounce(value, ms)` cho ô tìm kiếm/auto-complete (300–500ms).
- `lib/api/api-error.ts` — `ApiError { status, code, message, details }` khớp với ErrorBody của backend.
- `components/ui/` — shadcn (sinh bằng CLI, không áp giới hạn dòng).

## Docker
Giống yoslot: file compose ở gốc repo, Dockerfile + config nằm trong `docker/<môi trường>/<service>/`.

```
docker-compose.yml              local: db, redis, backend, frontend (tự reload)
docker-compose.production.yml   server: backend, frontend, nginx — KHÔNG có DB
docker/
├── local/
│   ├── backend/Dockerfile      chạy từ source (bind mount), tự prisma generate + migrate deploy
│   ├── frontend/Dockerfile     next dev
│   └── postgres/init.sql       tạo DB xoidich_test
└── production/
    ├── backend/Dockerfile      app đã biên dịch + Prisma CLI + migrations
    ├── frontend/Dockerfile     Next.js standalone
    └── nginx/                  nginx.conf, sites/, select-site.sh, certs/ (không commit)
```

| | Local | Server |
|---|---|---|
| Lệnh | `docker compose up -d --build` | `docker compose -f docker-compose.production.yml up -d` (CI chạy) |
| DB/Redis | Container trong compose, port chỉ mở trên `127.0.0.1` | Ở ngoài compose, kết nối qua `apps/backend/.env` |
| Mở ra ngoài | 3000 (frontend), 4000 (API) | Chỉ nginx: 80/443 |
| Migration | Backend tự chạy khi khởi động | Bước deploy: `run --rm backend npx prisma migrate deploy` trước `up` (như `php artisan migrate --force` của yoslot) |

- **Kết nối DB giống yoslot:** backend chỉ đọc `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB` từ `apps/backend/.env` (mật khẩu có ký tự đặc biệt không cần mã hoá). Prisma CLI (`prisma.config.ts`) ghép URL từ chính các key này. Trên server, `DB_HOST` là tên miền/IP của DB; chỉ mở port DB cho IP của server app, không mở cho cả internet.
- Compose local ghi đè `DB_HOST=db`, `REDIS_HOST=redis`, để cùng một `apps/backend/.env` (trỏ `localhost`) dùng được cho cả `pnpm dev` trên máy.
- E2E test dùng cùng server DB nhưng database `TEST_DB_DATABASE` (phải kết thúc `_test`) và Redis DB `TEST_REDIS_DB` (phải khác `REDIS_DB`).
- **Nginx (production):** `/api/` → backend, `/` → frontend, gzip, `/nginx-health`. Có `certs/fullchain.pem` + `certs/privkey.pem` thì `select-site.sh` tự bật HTTPS (HTTP chuyển 301, có HSTS); chưa có thì chạy HTTP. Backend đặt `trust proxy` (mạng nội bộ) để rate limit nhận đúng IP người dùng.
- Container chạy bằng user `node`. Đổi phiên bản Node thì sửa cả 4 Dockerfile.

## CI/CD (`.gitlab-ci.yml`)
Giống yoslot: chạy trên runner tự host tag `docker` (không tốn phút của GitLab).

| Stage | Khi nào | Làm gì |
|---|---|---|
| `lint` | MR + push `main` | `pnpm lint` + `pnpm typecheck` |
| `test` | **Đang tạm tắt** (`rules: when: never`) | unit + e2e với Postgres/Redis service |
| `build` | push `main` | Build image `backend`, `frontend` từ `docker/production/*` (dind) → push lên GitLab Container Registry, tag `<commit>` + `latest` |
| `deploy` | push `main` | SSH vào server: copy `docker-compose.production.yml` + config nginx, `pull`, chạy migration bằng image backend, `up -d`, chờ `/api/health` ok, dọn image cũ |

Biến trong GitLab (Settings → CI/CD → Variables), đặt tên giống yoslot:

| Biến | Kiểu | Nội dung |
|---|---|---|
| `PRODUCTION_URL` | Variable | `https://xoidich.vn` — frontend được build với API `PRODUCTION_URL/api` |
| `PRODUCTION_DEPLOY_HOST` / `_USER` / `_PATH` | Variable | IP server, user SSH (chạy được docker), thư mục deploy |
| `PRODUCTION_SSH_PRIVATE_KEY` | File | Khoá SSH vào server |
| `PRODUCTION_ENV_FILE` | File | Nội dung `apps/backend/.env` production (`DB_*`, `REDIS_*`, `FRONTEND_URL`…). Giống yoslot: CI chép thành `.env` trước khi build và đóng vào image backend |

Sửa `.env` production = sửa `PRODUCTION_ENV_FILE` trên GitLab rồi chạy lại pipeline (build lại image).

Chuẩn bị server một lần: cài Docker + GitLab Runner (tag `docker`); đặt chứng chỉ SSL vào `<PRODUCTION_DEPLOY_PATH>/docker/production/nginx/certs/` để bật HTTPS (chứng chỉ không đi qua git/CI).

Container Registry tính vào 10 GiB của gói Free → bật Cleanup policy (Settings → Packages and registries) giữ khoảng 10 tag gần nhất.

## Công cụ
| Lệnh | Làm gì |
|---|---|
| `pnpm check` | lint + typecheck + unit test (tự chạy trước `git push`) |
| `pnpm test:e2e` | E2E backend trên `xoidich_test` + Redis DB 1 — chỉ chạy nếu tên DB kết thúc bằng `_test` |
| `pnpm db:migrate --name <tên>` | Tạo + áp migration từ `schema.prisma` |

Lint: oxlint (backend), ESLint (frontend); cả hai giới hạn 200 dòng/file. Commit: Conventional Commits (commitlint).
