# Styleguide

<!-- Cập nhật khi có thiết kế từ Stitch. Token đặt trong apps/frontend/app/globals.css (@theme của Tailwind v4). -->

## Màu sắc
| Token | Giá trị | Dùng cho |
|---|---|---|
| `--background` | | Nền trang |
| `--foreground` | | Chữ chính |

## Typography
- Font: Geist Sans / Geist Mono, subset `latin` + `vietnamese`

## Components
Nền tảng: shadcn/ui style `base-nova` (Base UI + Tailwind v4), icon `lucide-react`, màu nền `neutral`.
Token màu/bo góc nằm trong `apps/frontend/app/globals.css`. Thêm component: `pnpm dlx shadcn@latest add <tên>` (chạy trong `apps/frontend`). Ghép class bằng `cn()`.

| Component | File | Ghi chú |
|---|---|---|
| Button | `components/ui/button.tsx` | shadcn |
