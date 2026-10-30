---
name: code-ui
description: Đọc thiết kế màn hình từ Google Stitch qua MCP rồi viết component/page Next.js + Tailwind theo STYLEGUIDE. Dùng khi người dùng gõ /code-ui hoặc yêu cầu dựng UI từ thiết kế.
---

# Code UI (Stitch → Next.js)

1. Đọc `.docs/STYLEGUIDE.md` và `.docs/DESIGN_BRIEF.md` (màn hình cần dựng).
2. Lấy thiết kế qua Stitch MCP (project/screen người dùng chỉ định). Nếu MCP chưa kết nối, dừng lại và báo người dùng cấu hình MCP.
3. Coi output của Stitch là tham khảo, không copy nguyên: map màu/spacing/font về token trong STYLEGUIDE và `apps/frontend/app/globals.css`.
4. Tái sử dụng component có sẵn trong `apps/frontend/components/` trước khi tạo mới. Component mới: một file một component, props có type rõ ràng.
5. Page đặt trong `apps/frontend/app/<route>/page.tsx`, ưu tiên Server Component.
6. Chạy `pnpm --filter frontend lint` và `pnpm --filter frontend build`.
7. Nếu phát sinh token/component dùng chung mới, bổ sung vào STYLEGUIDE.
