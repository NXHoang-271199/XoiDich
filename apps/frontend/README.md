# XoiDich — frontend

Next.js 16 (App Router) + Tailwind CSS v4 + shadcn/ui + TanStack Query.

| Lệnh (trong thư mục này) | Làm gì |
|---|---|
| `pnpm dev` | Chạy có tự reload (http://localhost:3000) |
| `pnpm build` | Build production |
| `pnpm dlx shadcn@latest add <tên>` | Thêm component shadcn vào `components/ui/` |

Gọi API: `apiServer()` (Server Component) và `http` + TanStack Query (Client Component) trong `lib/api/`. Cách chạy cả dự án và kiến trúc: [README gốc](../../README.md), [`.docs/ARCHITECTURE.md`](../../.docs/ARCHITECTURE.md).
