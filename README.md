# XoiDich

Monorepo: Next.js (frontend) + NestJS (backend) + PostgreSQL/Prisma, chạy bằng Docker.

## Bắt đầu (máy local)
```bash
pnpm install                                   # cũng cài git hooks
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
docker compose up -d --build                   # Postgres + Redis + backend + frontend, tự reload
```
- Frontend: http://localhost:3000
- API: http://localhost:4000/api — Swagger: http://localhost:4000/api/docs
- Health: http://localhost:4000/api/health
- DB (Navicat): `localhost:5432`, user `postgres`, mật khẩu `postgres`, DB `xoidich`

## Server
CI/CD (`.gitlab-ci.yml`) build image, đưa `docker-compose.production.yml` lên server, chạy migration rồi khởi động app sau nginx. Server **không chạy DB trong compose**: giống yoslot, app tìm DB qua `DB_*` / `REDIS_*` trong `.env` production — lưu ở biến `PRODUCTION_ENV_FILE` trên GitLab, CI đóng vào image backend lúc build. Chi tiết: `.docs/ARCHITECTURE.md` mục Docker và CI/CD.

## Lệnh
| Lệnh | Làm gì |
|---|---|
| `pnpm check` | lint + typecheck + unit test (tự chạy trước `git push`) |
| `pnpm test:e2e` | E2E backend trên DB `xoidich_test` |
| `pnpm db:migrate --name <tên>` | Tạo + áp migration |
| `pnpm db:studio` | Xem DB |

## Tài liệu
- `.docs/ARCHITECTURE.md` — kiến trúc, định dạng lỗi, Docker
- `.docs/HOW_TO_NEW_FEATURE.md` — thêm tính năng từ DB tới UI
- `.agent/AGENTS.md` — luật code (AI và người đều theo)
- `.agent/` — nguồn gốc duy nhất của luật và skills cho Claude Code
- `CLAUDE.md` + `.claude/` — Claude Code nối vào `.agent/` (import `@.agent/AGENTS.md`, `.claude/skills` là symlink)

## Checklist trước khi mở MR
- [ ] Branch tạo từ `main` mới nhất, chỉ chứa thay đổi của một việc
- [ ] `pnpm check` pass; đổi backend → `pnpm test:e2e` pass
- [ ] Đổi `schema.prisma` → có migration đi kèm
- [ ] Biến env mới → `env.schema.ts` + `.env.example`
- [ ] Endpoint mới → có e2e test và comment để Swagger hiển thị
- [ ] Đổi kiến trúc/luồng → cập nhật `.docs/ARCHITECTURE.md`
- [ ] Commit theo Conventional Commits
