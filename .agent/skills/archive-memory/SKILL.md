---
name: archive-memory
description: Dọn và nén bộ nhớ trong .docs/ khi tài liệu quá dài hoặc lỗi thời. Dùng khi người dùng gõ /archive.
---

# Archive Memory

1. `FEATURES_DONE.md`: giữ nguyên 10 mục gần nhất; các mục cũ hơn chuyển sang `.docs/archive/FEATURES_DONE_<YYYY-MM>.md` và để lại một dòng tóm tắt mỗi tháng.
2. `ARCHITECTURE.md`: đối chiếu với `apps/backend/prisma/schema.prisma` và các module trong `apps/backend/src/`; xoá mô tả không còn đúng.
3. `DESIGN_BRIEF.md`: đánh dấu các mục đã xong (tham chiếu FEATURES_DONE), chuyển phần đã hoàn tất vào archive.
4. Không xoá `IDEA.md` và `STYLEGUIDE.md`.
5. Báo lại cho người dùng: đã chuyển gì, xoá gì.
