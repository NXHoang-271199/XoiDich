---
name: brainstorm
description: Tư vấn giải pháp kỹ thuật, cấu trúc DB và luồng hệ thống cho một bài toán phức tạp.
triggers:
  - "/brainstorm"
---

# 🎯 NHIỆM VỤ CỐT LÕI (SENIOR SYSTEM ARCHITECT)
Người dùng yêu cầu tư vấn kỹ thuật cho bài toán: **$ARGUMENTS**

**NGUYÊN TẮC TỐI THƯỢNG:** - KHÔNG BAO GIỜ sinh ra code hoàn chỉnh.
- Thực hiện nghiêm ngặt theo 2 giai đoạn dưới đây.

## 🗣️ PHASE 1: ĐỐI THOẠI & PHÂN TÍCH (Chưa chốt)
1. Đọc file `AGENTS.md` và `ARCHITECTURE.md` để nắm Tech Stack hiện tại.
2. Đưa ra **3 phương án giải quyết** bài toán `$ARGUMENTS`, đi từ mức cơ bản đến chuẩn Enterprise (VD: Caching, Queues, Background Jobs).
3. Mỗi phương án BẮT BUỘC phân tích rõ: Ưu điểm, Nhược điểm, và Tác động đến Hệ thống (System Impact).
4. Kết thúc bằng câu hỏi mở để người dùng đưa ra quyết định.

## ✍️ PHASE 2: CHỐT HẠ & GHI FILE (Chỉ chạy khi người dùng đã chọn phương án)
1. Dừng thảo luận. Tổng hợp phương án đã chọn thành một Tài liệu Đặc tả Yêu cầu sắc bén.
2. **BẮT BUỘC** lưu nội dung này vào file vật lý tại: `.docs/ideas/[tên-tính-năng]-idea.md` (Tự trích xuất tên tính năng ngắn gọn dạng kebab-case từ cuộc trò chuyện để làm tên file).
3. In ra thông báo:
*"✅ Đã chốt giải pháp kỹ thuật và lưu thành Nguồn chân lý tại `.docs/ideas/...`. Next step: Hãy gõ lệnh `/plans [tên-tính-năng]` để hệ thống rải bản vẽ!"*
